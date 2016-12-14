package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.beans.Position;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class PersonMapper implements ResultSetMapper<Person> {

	@Override
	public Person map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Person p = fillInFields(new Person(), r);
		
		if (MapperUtils.containsColumnNamed(r, "positions_id")) { 
			p.setPosition(PositionMapper.fillInFields(new Position(), r));
		}
		
		return p;
	}
	
	public static <T extends Person> T fillInFields(T a, ResultSet r) throws SQLException {
		//This hits when we do a join but there's no Person record. 
		if (r.getObject("people_id") == null) { return null; }
		a.setId(r.getInt("people_id"));
		a.setName(r.getString("people_name"));
		a.setStatus(MapperUtils.getEnumIdx(r, "people_status", Status.class));
		a.setRole(MapperUtils.getEnumIdx(r, "people_role", Role.class));
		a.setEmailAddress(r.getString("people_emailAddress"));
		a.setPhoneNumber(r.getString("people_phoneNumber"));
		a.setRank(r.getString("people_rank"));
		a.setBiography(r.getString("people_biography"));
		a.setDomainUsername(r.getString("people_domainUsername"));
		a.setPendingVerification(r.getBoolean("people_pendingVerification"));
		a.setCreatedAt(new DateTime(r.getTimestamp("people_createdAt")));
		a.setUpdatedAt(new DateTime(r.getTimestamp("people_updatedAt")));
		
		
		a.setLoadLevel(LoadLevel.PROPERTIES);
		return a;
	}
}
