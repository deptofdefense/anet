package mil.dds.anet.views;

import java.util.HashMap;
import java.util.Map;

import io.dropwizard.views.View;

public class SimpleView extends View {
	protected Map<String, Object> context;

	public SimpleView(String path) {
		super(path);
		this.context = new HashMap<String, Object>();
	}

	public Map<String,Object> getContext() {
		return context;
	}

	public void addToContext(String key, Object value) {
		context.put(key, value);
	}
}
