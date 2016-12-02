package mil.dds.anet.beans;

public class ReportPerson extends Person {

	boolean primary;

	public ReportPerson() { 
		this.primary = false; // Default
	}
	
	public boolean isPrimary() {
		return primary;
	}

	public void setPrimary(boolean primary) {
		this.primary = primary;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || getClass() != o.getClass()) { 
			return false;
		}
		ReportPerson rp = (ReportPerson) o;
		return super.equals(o) && 
				primary == rp.isPrimary();
	}
	
	@Override
	public int hashCode() { 
		return super.hashCode() * ((primary) ? 7 : -7);
	}
	
	public static ReportPerson createWithId(Integer id) {
		ReportPerson rp = new ReportPerson();
		rp.setId(id);
		rp.setLoadLevel(LoadLevel.ID_ONLY);
		return rp;
	}
	
}
