package mil.dds.anet.beans;

import org.joda.time.DateTime;

public class Comment {

	private int id;
	
	private Person author;
	private DateTime dtg;
	
	private String text;

	public int getId() {
		return id;
	}

	public void setId(int id) {
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
	
	
	
}
