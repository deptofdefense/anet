package mil.dds.anet.resources;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.config.AnetConfiguration.SmtpConfiguration;
import mil.dds.anet.views.SimpleView;

@Path("/api/testing")
@Produces(MediaType.APPLICATION_JSON)
public class TestingResource {

	private static Logger log = Log.getLogger(TestingResource.class);
	private AnetConfiguration config;
	
	public TestingResource(AnetObjectEngine engine, AnetConfiguration config) {
		this.config = config;
	}

	@GET
	@Path("/whoami")
	public Person whoAmI(@Auth Person me) {
		return me;
	}


	@GET
	@Path("/headers")
	public Map<String,String> logHeaders(@Context HttpServletRequest request) {
		Map<String,String> headers = new HashMap<String,String>();

		Enumeration<String> headerNames = request.getHeaderNames();
		for (; headerNames.hasMoreElements(); ) {
			String name = headerNames.nextElement();
			headers.put(name, request.getHeader(name));
			log.info("Header: {}: {}", name, request.getHeader(name));
		}
		return headers;
	}

	@GET
	@Path("/features")
	@Produces(MediaType.TEXT_HTML)
	public SimpleView featureTest() {
		return new SimpleView("/views/feature_test.ftl");
	}

	@POST
	@Path("/features")
	public HashMap<String, Object> featureTestPost(HashMap<String, Object> json) {
		log.info("BROWSER_JSON: {}", json);
		return json;
	}
	
	@GET
	@Path("/email")
	public void email(@QueryParam("from") String from, @QueryParam("to") String to) { 
		SmtpConfiguration smtp = config.getSmtp();
		Properties props = new Properties();
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.starttls.enable", smtp.getStartTLS().toString());
		props.put("mail.smtp.host", smtp.getHostname());
		props.put("mail.smtp.port", smtp.getPort().toString());

		Session session = Session.getInstance(props,
			new javax.mail.Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(smtp.getUsername(), smtp.getPassword());
				}
			});

		try {

			Message message = new MimeMessage(session);
			message.setFrom(new InternetAddress(from));
			message.setRecipients(Message.RecipientType.TO,
				InternetAddress.parse(to));
			message.setSubject("Testing Subject");
			message.setText("A Test Email from ANET!");

			Transport.send(message);

			System.out.println("Done");

		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}
}
