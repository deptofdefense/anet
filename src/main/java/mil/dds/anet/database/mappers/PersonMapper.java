package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Status;

public class PersonMapper implements ResultSetMapper<Person> {

	@Override
	public Person map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Person a = new Person();
		a.setId(r.getInt("id"));
		a.setFirstName(r.getString("firstName"));
		a.setLastName(r.getString("lastName"));
		a.setStatus(Status.valueOf(r.getString("status")));
		a.setEmailAddress(r.getString("emailAddress"));
		a.setPhoneNumber(r.getString("phoneNumber"));
		a.setRank(r.getString("rank"));
		a.setBiography(r.getString("biography"));
		return a;
	} 
}
