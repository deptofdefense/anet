package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.views.AbstractAnetView;

public class Comment extends AbstractAnetView<Comment> {

	private Integer reportId;
	
	private Person author;
	private DateTime createdAt;
	private DateTime updatedAt;
	
	private String text;

	public Integer getReportId() {
		return reportId;
	}

	public void setReportId(Integer reportId) {
		this.reportId = reportId;
	}

	public Person getAuthor() {
		return author;
	}

	public void setAuthor(Person author) {
		this.author = author;
	}

	public DateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}

	public DateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(DateTime updatedAt) {
		this.updatedAt = updatedAt;
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
				idEqual(c.getAuthor(), author) &&
				Objects.equals(c.getText(), text) &&
				Objects.equals(c.getReportId(), reportId) &&
				Objects.equals(c.getUpdatedAt(), updatedAt) &&
				Objects.equals(c.getCreatedAt(), createdAt);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, author, createdAt, text, reportId, updatedAt);
	}
	
	@Override
	public String toString() { 
		return String.format("[%d] - [Author:%d,Report:%d] - (%s)", id, author.getId(), reportId, text);
	}
	
}
