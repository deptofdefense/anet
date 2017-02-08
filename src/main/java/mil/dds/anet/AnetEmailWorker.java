package mil.dds.anet;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

import org.joda.time.DateTime;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
	private String serverUrl;
	private Configuration freemarkerConfig;
	
	private static AnetEmailWorker instance;
	private Logger logger = LoggerFactory.getLogger(AnetEmailWorker.class);
	
	public AnetEmailWorker(Handle dbHandle, AnetConfiguration config) { 
		this.handle = dbHandle;
		this.mapper = new ObjectMapper();
		mapper.registerModule(new JodaModule());
		this.emailMapper = new AnetEmailMapper();
		this.fromAddr = config.getEmailFromAddr();
		this.serverUrl = config.getServerUrl();
		instance = this;
		
		SmtpConfiguration smtpConfig = config.getSmtp();
		props = new Properties();
		props.put("mail.smtp.starttls.enable", smtpConfig.getStartTls().toString());
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
	}
	
	@Override
	public void run() {
		while (true) { 
			logger.debug("AnetEmailWorker waking up to send emails!");
			
			//check the database for any emails we need to send. 
			List<AnetEmail> emails = handle.createQuery("SELECT * FROM pendingEmails ORDER BY createdAt ASC")
					.map(emailMapper)
					.list();
			
			//Send the emails!
			List<Integer> sentEmails = new LinkedList<Integer>();
			for (AnetEmail email : emails) { 
				try {
					logger.error("Sending email to {} re: {}",email.getToAddresses(), email.getSubject());
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

	/*
	 * Puts the thread to sleep for 30 seconds. 
	 */
	public synchronized void fallAsleep() { 
		try {
			this.wait(300 * 1000L);
		} catch (InterruptedException e) {};
	}
	
	private void sendEmail(AnetEmail email) throws MessagingException, IOException, TemplateException {
		//Remove any null email addresses
		email.getToAddresses().removeIf(s -> Objects.equals(s, null));
		if (email.getToAddresses().size() == 0) { 
			//This email will never get sent... just kill it off
			//log.error("Unable to send email of subject {}, because there are no valid to email addresses");
			return;
		}
		email.getContext().put("serverUrl", serverUrl);
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
		} catch (JsonProcessingException jsonError) { 
			throw new WebApplicationException(jsonError);
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
		public AnetEmail map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
			String jobSpec = rs.getString("jobSpec");
			try { 
				AnetEmail email = mapper.readValue(jobSpec, AnetEmail.class);
				
				email.setId(rs.getInt("id"));
				email.setCreatedAt(new DateTime(rs.getTimestamp("createdAt")));
				return email;
			} catch (Exception e) { 
				e.printStackTrace();
			}
			return null;			
		} 
		
	}
	
}