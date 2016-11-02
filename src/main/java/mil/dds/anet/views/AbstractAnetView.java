package mil.dds.anet.views;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.WebApplicationException;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.dropwizard.views.View;
import mil.dds.anet.AnetObjectEngine;

public abstract class AbstractAnetView<T extends AbstractAnetView<?>> extends View {

	protected String templateName;
	protected AnetObjectEngine engine;
	
	protected LoadLevel loadLevel;
	protected Integer id;
	protected Map<String,Object> context; //To throw random properties on a view. 
	
	public AbstractAnetView() { 
		super("");
		id = null;
		this.context = new HashMap<String,Object>();
	}
	
	@Override
	@JsonIgnore
	public String getTemplateName() { 
		if (templateName != null && templateName.equals("")) { 
			throw new WebApplicationException("Tried to render an Anet View without defining the template");
		}
		return templateName;
	}
	
	/* Renders this view in a way that it cannot cause more DB loads to occur */
	public T render(String templateName) { 
		return this.render(templateName, null);
	}
	
	@SuppressWarnings("unchecked")
	public T render(String templateName, AnetObjectEngine engine) { 
		this.templateName = resolveName(templateName);
		this.engine = engine;
		return (T) this;
	}
	
	//Shamelessly stolen from the parent class
	//Don't make your methods private if they don't need to be! 
	private String resolveName(String templateName) {
        if (templateName.startsWith("/")) {
            return templateName;
        }
        String className = this.getClass().getSimpleName();
        className = Character.toLowerCase(className.charAt(0)) + className.substring(1);
        return String.format("/views/%s/%s", className, templateName);
    }
	
	@JsonIgnore
	public Map<String,Object> getContext() { 
		return context;
	}
	
	public void addToContext(String key, Object value) { 
		this.context.put(key, value);
	}
	
	/******
	 * These methods are related to the fact that these are Database Objects. this should be extracted out 
	 */
	public static enum LoadLevel { ID_ONLY, PROPERTIES, INCLUDE;
		public boolean contains(LoadLevel other) { 
			return other.ordinal() <= this.ordinal();
		}
	}
	
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
	
	protected <B extends AbstractAnetView<?>> B getBeanAtLoadLevel(B bean, LoadLevel ll) {
		if (bean.getLoadLevel().contains(ll)) { 
			return bean;
		}
		@SuppressWarnings("unchecked")
		B ret = (B) AnetObjectEngine.loadBeanTo(bean, ll);
		return ret;
	}
	
}
