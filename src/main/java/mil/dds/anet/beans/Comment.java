package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

public class Comment {

	private Integer id;
	
	private Person author;
	private DateTime dtg;
	
	private String text;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Person getAuthor() {
		return author;
	}

	public void setAuthor(Person author) {
		this.author = author;
	}

	public DateTime getDtg() {
		return dtg;
	}

	public void setDtg(DateTime dtg) {
		this.dtg = dtg;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}
	
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Comment.class) { 
			return false;
		}
		Comment c = (Comment) o;
		return Objects.equals(c.getId(), id) &&
				Objects.equals(c.getAuthor(), author) &&
				Objects.equals(c.getText(), text) &&
				Objects.equals(c.getDtg(), dtg);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, author, dtg, text);
	}
	
}
