package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class PersonMapper implements ResultSetMapper<Person> {

	@Override
	public Person map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		return fillInFields(new Person(), r);
	} 
	
	public static <T extends Person> T fillInFields(T a, ResultSet r) throws SQLException {
		//This hits when we do a join but there's no Person record. 
		if (r.getObject("id") == null) { return null; }
		a.setId(r.getInt("id"));
		a.setName(r.getString("name"));
		a.setStatus(MapperUtils.getEnumIdx(r, "status", Status.class));
		a.setRole(MapperUtils.getEnumIdx(r, "role", Role.class));
		a.setEmailAddress(r.getString("emailAddress"));
		a.setPhoneNumber(r.getString("phoneNumber"));
		a.setRank(r.getString("rank"));
		a.setBiography(r.getString("biography"));
		a.setDomainUsername(r.getString("domainUsername"));
		a.setPendingVerification(r.getBoolean("pendingVerification"));
		a.setCreatedAt(new DateTime(r.getTimestamp("createdAt")));
		a.setUpdatedAt(new DateTime(r.getTimestamp("updatedAt")));
		
		a.setLoadLevel(LoadLevel.PROPERTIES);
		return a;
	}
}
