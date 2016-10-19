package mil.dds.anet.beans;

public class AdvisorOrganization {

	int id;
	String name;
	int memberGroupId;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getMemberGroupId() {
		return memberGroupId;
	}
	public void setMemberGroupId(int memberGroupId) {
		this.memberGroupId = memberGroupId;
	}
	
}
