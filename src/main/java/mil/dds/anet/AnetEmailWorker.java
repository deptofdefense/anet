package mil.dds.anet;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.ws.rs.WebApplicationException;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;
import org.joda.time.DateTime;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import com.google.common.base.Joiner;

import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapperBuilder;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.config.AnetConfiguration.SmtpConfiguration;

public class AnetEmailWorker implements Runnable {

	private Handle handle;
	private ObjectMapper mapper;
	private AnetEmailMapper emailMapper;
	private Properties props;
	private Authenticator auth;
	private String fromAddr;
	private Configuration freemarkerConfig;
	
	private static AnetEmailWorker instance;
	private static Logger log = Log.getLogger(AnetEmailWorker.class);
	
	public AnetEmailWorker(Handle dbHandle, AnetConfiguration config) { 
		this.handle = dbHandle;
		this.mapper = new ObjectMapper();
		mapper.registerModule(new JodaModule());
		this.emailMapper = new AnetEmailMapper();
		this.fromAddr = config.getEmailFromAddr();
		instance = this;
		
		SmtpConfiguration smtpConfig = config.getSmtp();
		props = new Properties();
		props.put("mail.smtp.starttls.enable", smtpConfig.getStartTLS().toString());
		props.put("mail.smtp.host", smtpConfig.getHostname());
		props.put("mail.smtp.port", smtpConfig.getPort().toString());
		auth = null;
		
		if (smtpConfig.getUsername() != null && smtpConfig.getUsername().trim().length() > 0) { 
			props.put("mail.smtp.auth", "true");
			auth = new javax.mail.Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(smtpConfig.getUsername(), smtpConfig.getPassword());
				}
			};
		}
		
		freemarkerConfig = new Configuration(Configuration.getVersion());
		freemarkerConfig.setObjectWrapper(new DefaultObjectWrapperBuilder(Configuration.getVersion()).build());
		freemarkerConfig.loadBuiltInEncodingMap();
		freemarkerConfig.setDefaultEncoding(StandardCharsets.UTF_8.name());
		freemarkerConfig.setClassForTemplateLoading(this.getClass(), "/");
//        for (Map.Entry<String, String> entry : baseConfig.entrySet()) {
//            configuration.setSetting(entry.getKey(), entry.getValue());
//        }
	}
	
	@Override
	public void run() {
		while (true) { 
			log.debug("AnetEmailWorker waking up to send emails!");
			
			//check the database for any emails we need to send. 
			List<AnetEmail> emails = handle.createQuery("SELECT * FROM pendingEmails ORDER BY createdAt ASC")
					.map(emailMapper)
					.list();
			
			//Send the emails!
			List<Integer> sentEmails = new LinkedList<Integer>();
			for (AnetEmail email : emails) { 
				try { 
					log.debug("Sending email to {} re: {}",email.getToAddresses(), email.getSubject());
					sendEmail(email);
					sentEmails.add(email.getId());
				} catch (Exception e) { 
					e.printStackTrace();
				}
			}
			
			//Update the database.
			if (sentEmails.size() > 0) { 
				String emailIds = Joiner.on(", ").join(sentEmails);
				handle.createStatement("DELETE FROM pendingEmails WHERE id IN (" + emailIds + ")").execute();
			}
		
			//TODO: figure out if we should be cancelled
			
			//Back to sleep!
			fallAsleep();
		}
	}

	public synchronized void fallAsleep() { 
		try {
			this.wait(300 * 1000L);
		} catch (InterruptedException e) {};
	}
	
	private void sendEmail(AnetEmail email) throws MessagingException, IOException, TemplateException {
		Template temp = freemarkerConfig.getTemplate(email.getTemplateName());
		StringWriter writer = new StringWriter();
		temp.process(email.getContext(), writer);
		
		Session session = Session.getInstance(props, auth);
		Message message = new MimeMessage(session);
		message.setFrom(new InternetAddress(fromAddr));
		String toAddress = Joiner.on(", ").join(email.getToAddresses());
		message.setRecipients(Message.RecipientType.TO,
			InternetAddress.parse(toAddress));
		message.setSubject(email.getSubject());
		message.setContent(writer.toString(), "text/html; charset=utf-8");

		Transport.send(message);
	}
	
	
	public static void sendEmailAsync(AnetEmail email) {
		instance.internal_sendEmailAsync(email);
	}
	
	private synchronized void internal_sendEmailAsync(AnetEmail email) { 
		//Insert the job spec into the database.
		try { 
			String jobSpec = mapper.writeValueAsString(email);
			handle.createStatement("INSERT INTO pendingEmails (jobSpec, createdAt) VALUES (:jobSpec, :createdAt)")
				.bind("jobSpec", jobSpec)
				.bind("createdAt", new DateTime())
				.execute();
		} catch (JsonProcessingException e) { 
			throw new WebApplicationException(e);
		}
		
		//poke the worker thread so it wakes up. 
		this.notify();
	} 
	
	public static class AnetEmail { 
		Integer id;
		String templateName;
		String subject;
		Map<String,Object> context;
		List<String> toAddresses;
		DateTime createdAt;
		
		public Integer getId() {
			return id;
		}
		public void setId(Integer id) {
			this.id = id;
		}
		public String getTemplateName() {
			return templateName;
		}
		public void setTemplateName(String templateName) {
			this.templateName = templateName;
		}
		public String getSubject() {
			return subject;
		}
		public void setSubject(String subject) {
			this.subject = subject;
		}
		public Map<String, Object> getContext() {
			return context;
		}
		public void setContext(Map<String, Object> context) {
			this.context = context;
		}
		public List<String> getToAddresses() {
			return toAddresses;
		}
		public void setToAddresses(List<String> toAddresses) {
			this.toAddresses = toAddresses;
		}
		public DateTime getCreatedAt() {
			return createdAt;
		}
		public void setCreatedAt(DateTime createdAt) {
			this.createdAt = createdAt;
		}
	}
	
	public static class AnetEmailMapper implements ResultSetMapper<AnetEmail> {

		ObjectMapper mapper;
		
		public AnetEmailMapper() { 
			this.mapper = new ObjectMapper();
		}
		
		@Override
		public AnetEmail map(int index, ResultSet r, StatementContext ctx) throws SQLException {
			String jobSpec = r.getString("jobSpec");
			try { 
				AnetEmail email = mapper.readValue(jobSpec, AnetEmail.class);
				
				email.setId(r.getInt("id"));
				email.setCreatedAt(new DateTime(r.getTimestamp("createdAt")));
				return email;
			} catch (Exception e) { 
				e.printStackTrace();
			}
			return null;			
		} 
		
	}
	
}