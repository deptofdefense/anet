//
// from http://waffle.codeplex.com/workitem/10034
//

package mil.dds.anet.auth;

import java.io.IOException;
import java.security.Principal;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.StringTokenizer;

import javax.servlet.ServletException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com4j.COM4J;
import com4j.Com4jObject;
import com4j.Variant;
import com4j.typelibs.activeDirectory.IADs;
import com4j.typelibs.ado20.ClassFactory;
import com4j.typelibs.ado20.Field;
import com4j.typelibs.ado20.Fields;
import com4j.typelibs.ado20._Command;
import com4j.typelibs.ado20._Connection;
import com4j.typelibs.ado20._Recordset;

/*
 * Decorates a Request with Active Directory data corresponding to the currently authenticated user.
 * Requires COM4J.
 * 
 * Developpers info: http://waffle.codeplex.com/workitem/10034
 * 
 * by Christophe Dupriez, DESTIN inc. SSEB. Contributed in 2010/12 to Waffle Project along its OpenSource licence.
 */
public class ActiveDirectoryQuery { 
	protected Logger log = LoggerFactory.getLogger(ActiveDirectoryQuery.class);
	
	private String defaultNamingContext = null;

	private final String defaultQueryField = "sAMAccountName";
	private final String defaultQueryField2 = "userPrincipalName";

	private String queryField;
	private String queryField2;

	private final String defaultFields = "distinguishedName,userPrincipalName,sAMAccountName,sn,givenName,telephoneNumber";
	private String adFields;
	private HashMap<String,String> adAttribute;

	private HashMap<String, HashMap<String,String>> knownUsersData;
	private HashMap<String, Date> knownUsersCreated;

	private long maxAge = 30 * 60 * 1000; // Default age for cached AD information entries is 30 minutes

	public ActiveDirectoryQuery() { 
		IADs rootDse = COM4J.getObject(IADs.class, "LDAP://RootDSE", null);
		defaultNamingContext = (String)rootDse.get("defaultNamingContext");
		knownUsersData = new HashMap<String, HashMap<String,String>>();
		knownUsersCreated = new HashMap<String, Date>();
		
		adFields = defaultFields;
		adAttribute = new HashMap<String,String>();
		queryField = defaultQueryField;
		queryField2 = defaultQueryField2;
		
		if (adFields.isEmpty()) {
			adFields = defaultFields;
			StringTokenizer st = new StringTokenizer(adFields,",");
			while (st.hasMoreTokens()) {
				String token = st.nextToken();
				adAttribute.put(token, token);
			}
		}
		if (queryField.isEmpty()) {
			queryField = defaultQueryField;
			queryField2 = defaultQueryField2;
		}
		log.info("LDAP root=" + defaultNamingContext + ", query=" + queryField + ", query2=" + queryField2 + ", AD fields=" + adFields);
	}

	public synchronized void destroy() {
		defaultNamingContext = null;
		knownUsersData = null;
		knownUsersCreated = null;
		adFields = null;
		log.info("destroyed");
	}

	private synchronized Map<String,String> gatherUserData(String name) {
		Date nameCreated = knownUsersCreated.get(name);
		Date now = new Date();
		if (nameCreated != null && nameCreated.getTime() > (now.getTime() - maxAge)) {
			return knownUsersData.get(name);
		}
		
		HashMap<String,String> userDataAttributes = null;
		
		knownUsersData.remove(name);
		knownUsersCreated.remove(name);
		_Connection con = ClassFactory.createConnection();
		con.provider("ADsDSOObject");
		con.open("Active Directory Provider",""/*default*/,""/*default*/,-1/*default*/);

		// query LDAP to find out the LDAP DN and other info for the given user from the login ID 

		_Command cmd = ClassFactory.createCommand();
		cmd.activeConnection(con);

		String command = "<LDAP://" + defaultNamingContext + ">;(" + queryField + "=" + name + ");" + adFields + ";subTree";
		log.debug("Command=" + command);
		cmd.commandText(command);
		_Recordset rs = cmd.execute(null, Variant.getMissing(), -1/*default*/);
		if (rs.eof()) { // User not found!
			command = "<LDAP://" + defaultNamingContext + ">;(" + queryField2 + "=" + name + ");" + adFields + ";subTree";
			log.debug("Command=" + command);
			cmd.commandText(command);
			rs = cmd.execute(null, Variant.getMissing(), -1/*default*/);
		}
		if (rs.eof()) { // User not found!
			log.error(name + " not found.");
		} else {
			Fields userData = rs.fields();
			if (userData != null) {
				Iterator<Com4jObject> itCom = userData.iterator();
				int i = 0;
				userDataAttributes = new HashMap<String,String>();
				while (itCom.hasNext()) {
					Field comObj = (Field)itCom.next();
					String attribute = adAttribute.get(comObj.name());
					if (attribute != null && !attribute.isEmpty()) {
						log.debug(i++ + ") " + attribute + ":" + comObj.name() + "=" + comObj.value().toString());
						userDataAttributes.put(attribute, comObj.value().toString());
					}
				}
				knownUsersData.put(name, userDataAttributes);
				knownUsersCreated.put(name, now);
			} else {
				log.error("User " + name + " AD information is empty?");
			}
		}
		rs.close();
		con.close();
		return userDataAttributes;
	}

	public Map<String,String> getUserInfo(Principal windowsPrincipal) throws IOException, ServletException {
		if (windowsPrincipal != null) {
			String name = windowsPrincipal.getName();
			if (name != null && !name.isEmpty()) {
				return gatherUserData(name);
			}
		} 
		return null;
	}
}