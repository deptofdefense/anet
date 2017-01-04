package mil.dds.anet.beans.search;

public class LocationSearchQuery implements ISearchQuery {

	private String text;
	
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}

	public static LocationSearchQuery withText(String text) {
		LocationSearchQuery q = new LocationSearchQuery();
		q.setText(text);
		return q;
	}

}
