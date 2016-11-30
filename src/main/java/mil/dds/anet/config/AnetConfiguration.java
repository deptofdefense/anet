package mil.dds.anet.config;

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
}