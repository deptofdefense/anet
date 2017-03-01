package mil.dds.anet.beans;

public class RollupGraph {

	Organization org;
	int released;
	int cancelled;
	
	public Organization getOrg() {
		return org;
	}
	
	public void setOrg(Organization org) {
		this.org = org;
	}
	
	public int getReleased() {
		return released;
	}
	
	public void setReleased(int released) {
		this.released = released;
	}
	
	public int getCancelled() {
		return cancelled;
	}
	
	public void setCancelled(int cancelled) {
		this.cancelled = cancelled;
	}
	
}
