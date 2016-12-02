package mil.dds.anet.config;

import java.util.Map;
import java.util.Collections;
import com.google.common.collect.ImmutableMap;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;

public class AnetConfiguration extends Configuration {

	private boolean developmentMode;
	private String securityMarking;
	private String securityColor;

	@Valid
    @NotNull
    private DataSourceFactory database = new DataSourceFactory();

	@NotNull
	private Map<String, Map<String, String>> viewRendererConfiguration = Collections.emptyMap();

    @JsonProperty("database")
    public void setDataSourceFactory(DataSourceFactory factory) {
        this.database = factory;
    }

    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return database;
    }

	public boolean isDevelopmentMode() {
		return developmentMode;
	}

	public void setDevelopmentMode(boolean developmentMode) {
		this.developmentMode = developmentMode;
	}

	public String getSecurityMarking() {
		return securityMarking;
	}

	public void setSecurityMarking(String securityMarking) {
		this.securityMarking = securityMarking;
	}

	public String getSecurityColor() {
		return securityColor;
	}

	public void setSecurityColor(String securityColor) {
		this.securityColor = securityColor;
	}

	@JsonProperty("viewRendererConfiguration")
	public Map<String, Map<String, String>> getViewRendererConfiguration() {
		return viewRendererConfiguration;
	}

	@JsonProperty("viewRendererConfiguration")
	public void setViewRendererConfiguration(Map<String, Map<String, String>> viewRendererConfiguration) {
		final ImmutableMap.Builder<String, Map<String, String>> builder = ImmutableMap.builder();
		for (Map.Entry<String, Map<String, String>> entry : viewRendererConfiguration.entrySet()) {
			builder.put(entry.getKey(), ImmutableMap.copyOf(entry.getValue()));
		}
		this.viewRendererConfiguration = builder.build();
	}
}
