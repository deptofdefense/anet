package mil.dds.anet.views;

import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.IGraphQLBean;

public abstract class AbstractAnetBean implements IGraphQLBean {

	protected LoadLevel loadLevel;
	protected Integer id;
	protected DateTime createdAt;
	protected DateTime updatedAt;
 
	public AbstractAnetBean() { 
		id = null;
	}
		
	public static enum LoadLevel { ID_ONLY, PROPERTIES, INCLUDE;
		public boolean contains(LoadLevel other) { 
			return other.ordinal() <= this.ordinal();
		}
	}
	
	@GraphQLIgnore
	@JsonIgnore
	public LoadLevel getLoadLevel() { 
		return loadLevel;
	}
	
	public void setLoadLevel(LoadLevel ll) { 
		this.loadLevel = ll;
	}
	
	public Integer getId() { 
		return id;
	}
	
	public void setId(Integer id) { 
		this.id = id;
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
	
	/*Determines if two beans are "id" equal. 
	 * That is they have the same Id. (or are null)
	 */
	public static boolean idEqual(AbstractAnetBean a, AbstractAnetBean b) { 
		if (a == null && b == null) { return true; }
		if (a == null || b == null) { return false; }
		if (a.getId() != null && b.getId() != null) { 
			return Objects.equals(a.getId(), b.getId());
		}
		return a.equals(b);
	}
}
