package mil.dds.anet.auth;

//
// from http://waffle.codeplex.com/workitem/10034
//

import java.util.HashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com4j.COM4J;
import com4j.ComException;
import com4j.Variant;
import com4j.typelibs.activeDirectory.IADs;
import com4j.typelibs.ado20.ClassFactory;
import com4j.typelibs.ado20.Fields;
import com4j.typelibs.ado20._Command;
import com4j.typelibs.ado20._Connection;
import com4j.typelibs.ado20._Recordset;

public class ActiveDirectoryUserInfo {

	protected Log _log = LogFactory.getLog(ActiveDirectoryUserInfo.class);

	static String defaultNamingContext = null;

	static final String usefulFields = "distinguishedName,userPrincipalName,sAMAccountName,sn,givenName,telephoneNumber";

	String dn;	// distinguishedName
	String upn; // userPrincipalName
	String fqn; // sAMAccountName;
	String sn;	// surname
	String givenName;
	String telephoneNumber;
	
	static HashMap<String, ActiveDirectoryUserInfo> knownUsers = new HashMap<String, ActiveDirectoryUserInfo>();

	synchronized void initNamingContext() {
		if (defaultNamingContext == null) {
			IADs rootDSE = COM4J.getObject(IADs.class, "LDAP://RootDSE", null);
			defaultNamingContext = (String)rootDSE.get("defaultNamingContext");
	    	_log.error("defaultNamingContext="+defaultNamingContext);
		}
	}

	synchronized public static ActiveDirectoryUserInfo getInstance(String username) {
		ActiveDirectoryUserInfo found = knownUsers.get(username);
		if (found != null) return found;
		return getInstanceNoCache(username);
	}

	synchronized public static ActiveDirectoryUserInfo getInstanceNoCache(String username) {
		ActiveDirectoryUserInfo found = new ActiveDirectoryUserInfo(username);
		if (found.dn == null) {
			return null;
		}
		knownUsers.put(username, found);
		return found;
	}

	private ActiveDirectoryUserInfo (String username) {
		initNamingContext();
		if (defaultNamingContext == null) {
			return;
		}

		// Searching LDAP requires ADO [8], so it's good to create a connection upfront for reuse. 

		_Connection con = ClassFactory.createConnection();
		con.provider("ADsDSOObject");
		con.open("Active Directory Provider",""/*default*/,""/*default*/,-1/*default*/);

		// query LDAP to find out the LDAP DN and other info for the given user from the login ID 

		_Command cmd = ClassFactory.createCommand();
		cmd.activeConnection(con);

		String searchField = "userPrincipalName";
		int pSlash = username.indexOf('\\');
		if (pSlash > 0) {
			searchField = "sAMAccountName";
			username = username.substring(pSlash+1);
		}
		_log.error("Command="+"<LDAP://"+defaultNamingContext+">;("+searchField+"="+username+");"+usefulFields+";subTree");
		cmd.commandText("<LDAP://"+defaultNamingContext+">;("+searchField+"="+username+");"+usefulFields+";subTree");
		_Recordset rs = cmd.execute(null, Variant.getMissing(), -1/*default*/);
		if(rs.eof()) { // User not found!
			_log.error(username+" not found.");
		}
		else {
			Fields userData = rs.fields();
			if (userData != null) {
				/* Iterator<Com4jObject> itCom = userData.iterator();
				int i=0;
				while (itCom.hasNext()) {
					Field comObj = (Field)itCom.next();
					_log.error(i++ +":"+comObj.name()+"="+comObj.value().toString());
				} */
				Object o;
				try {
					o = userData.item("distinguishedName").value();
					if (o != null) dn = o.toString();
				} catch (ComException ecom ) {
					_log.error("distinguishedName not returned:"+ecom.getMessage());
				}
				try {
					o = userData.item("userPrincipalName").value();
					if (o != null) upn = o.toString();
				} catch (ComException ecom ) {
					_log.error("userPrincipalName not returned:"+ecom.getMessage());
				}
				try {
					o = userData.item("sAMAccountName").value();
					if (o != null) fqn = o.toString();
				} catch (ComException ecom ) {
					_log.error("sAMAccountName not returned:"+ecom.getMessage());
				}
				try {
					o = userData.item("sn").value();
					if (o != null) sn = o.toString();
				} catch (ComException ecom ) {
					_log.error("sn not returned:"+ecom.getMessage());
				}
				try {
					o = userData.item("givenName").value();
					if (o != null) givenName = o.toString();
				} catch (ComException ecom ) {
					_log.error("givenName not returned:"+ecom.getMessage());
				}
				try {
					o = userData.item("telephoneNumber").value();
					if (o != null) telephoneNumber = o.toString();
				} catch (ComException ecom ) {
					_log.error("telephoneNumber not returned:"+ecom.getMessage());
				}
			}
			else {
				_log.error("User "+username+" information is empty?");
			}
		}
		rs.close();
		con.close();
	}

	public static String getDefaultNamingContext() {
		return defaultNamingContext;
	}

	public String getDn() {
		return dn;
	}

	public String getUpn() {
		return upn;
	}

	public String getFqn() {
		return fqn;
	}

	public String getSn() {
		return sn;
	}

	public String getGivenName() {
		return givenName;
	}

	public String getTelephoneNumber() {
		return telephoneNumber;
	}
}