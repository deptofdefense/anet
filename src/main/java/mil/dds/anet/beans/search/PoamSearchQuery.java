package mil.dds.anet.beans.search;

public class PoamSearchQuery implements ISearchQuery {

	String text;
	Integer responsibleOrgId;
	String category;
	
	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Integer getResponsibleOrgId() {
		return responsibleOrgId;
	}

	public void setResponsibleOrgId(Integer responsibleOrgId) {
		this.responsibleOrgId = responsibleOrgId;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public static PoamSearchQuery withText(String text) {
		PoamSearchQuery q = new PoamSearchQuery();
		q.setText(text);
		return q;
	}

}
