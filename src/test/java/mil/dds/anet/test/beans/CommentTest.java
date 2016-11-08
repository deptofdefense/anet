package mil.dds.anet.test.beans;

import static org.assertj.core.api.Assertions.fail;

import org.junit.Test;

import mil.dds.anet.beans.Comment;

public class CommentTest extends BeanTester<Comment> {

	public static Comment fromText(String string) {
		Comment c = new Comment();
		c.setText(string);
		return c;
	}
	
	@Test
	public void implementMe() { 
		fail("implement me");
	}
	
}
