package mil.dds.anet.views;

import javax.ws.rs.WebApplicationException;

import io.dropwizard.views.View;

public abstract class AbstractAnetView<T extends AbstractAnetView<?>> extends View {

	protected String templateName;
	
	public AbstractAnetView() { 
		super("");
	}
	
	@Override
	public String getTemplateName() { 
		if (templateName.equals("")) { 
			throw new WebApplicationException("Tried to render an Anet View without defining the template");
		}
		return templateName;
	}
	
	@SuppressWarnings("unchecked")
	public T render(String templateName) { 
		this.templateName = resolveName(templateName);
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
	
}
