package mil.dds.anet.utils;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.Priority;
import org.skife.jdbi.v2.DBI;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.tweak.SQLLog;

import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.database.ReportDao;

/**
 * This Logger is mostly a copy of the default logger except it specifically looks for the very long column defintions that ANET2 uses
 * and will replace them in the log with a shortened version.  This just makes the logs easier to read and debug. 
 *
 */
public class AnetDbLogger implements SQLLog {
    private final Logger log;
    private Priority level;

    /**
     * Logs to org.skife.jdbi.v2 logger at the debug level
     */
    public AnetDbLogger()
    {
        this(Logger.getLogger(DBI.class));
    }

    /**
     * Use an arbitrary logger to log to at the debug level
     */
    public AnetDbLogger(Logger log)
    {
        this(log, Level.DEBUG);
    }

    /**
     * Specify both the logger and the priority to log at
     * @param log The logger to log to
     * @param level the priority to log at
     */
    public AnetDbLogger(Logger log, Priority level) {
        this.log = log;
        this.level = level;
    }

    @Override
    public void logSQL(long time, String sql) {
        if (isEnabled()) {
        	sql = sql.replace(PersonDao.PERSON_FIELDS, " <PERSON_FIELDS> ")
        		.replace(PositionDao.POSITIONS_FIELDS, " <POSITION_FIELDS> ")
        		.replace(OrganizationDao.ORGANIZATION_FIELDS, " <ORGANIZATION_FIELDS> ")
        		.replace(ReportDao.REPORT_FIELDS, " <REPORT_FIELDS> ");
            log(String.format("statement:[%s] took %d millis", sql, time));
        }
    }
    
    protected boolean isEnabled() {
        return log.isEnabledFor(level);
    }

    protected void log(String msg) {
        log.log(level, msg);
    }
    
    @Override
    public void logBeginTransaction(Handle h) {
        if (isEnabled()) {
            log(String.format("begin transaction on [%s]", h));
        }
    }

    @Override
    public void logCommitTransaction(long time, Handle h) {
        if (isEnabled()) {
            log(String.format("commit transaction on [%s] took %d millis", h, time));
        }
    }

    @Override
    public void logRollbackTransaction(long time, Handle h) {
        if (isEnabled()) {
            log(String.format("rollback transaction on [%s] took %d millis", h, time));
        }
    }

    @Override
    public void logObtainHandle(long time, Handle h) {
        if (this.isEnabled()) {
            log(String.format("Handle [%s] obtained in %d millis", h, time));
        }
    }

    @Override
    public void logReleaseHandle(Handle h) {
        if (this.isEnabled()) {
            log(String.format("Handle [%s] released", h));
        }
    }

    @Override
    public void logCheckpointTransaction(Handle h, String name) {
        if (this.isEnabled()) {
            log(String.format("checkpoint [%s] created on [%s]", name, h));
        }
    }

    @Override
    public void logReleaseCheckpointTransaction(Handle h, String name) {
        if (this.isEnabled()) {
            log(String.format("checkpoint [%s] on [%s] released", name, h));
        }
    }

    @Override
    public void logRollbackToCheckpoint(long time, Handle h, String checkpointName) {
        if (this.isEnabled()) {
            log(String.format("checkpoint [%s] on [%s] rolled back in %d millis", checkpointName, h, time));
        }
    }

	@Override
	public void logPreparedBatch(long time, String sql, int count) {
		if (isEnabled()) {
            log(String.format("prepared batch with %d parts:[%s] took %d millis", count, sql, time));
        }
	}

	@Override
	public BatchLogger logBatch() {
		if (isEnabled()) {
            final StringBuilder builder = new StringBuilder();
            builder.append("batch:[");
            return new BatchLogger() {
                private boolean added = false;

                @Override
                public void add(String sql)
                {
                    added = true;
                    builder.append("[").append(sql).append("], ");
                }

                @Override
                public void log(long time)
                {
                    if (added) {
                        builder.delete(builder.length() - 2, builder.length());
                    }
                    builder.append("]");
                    AnetDbLogger.this.log(String.format("%s took %d millis", builder.toString(), time));
                }
            };
        }
        else {
            return new BatchLogger() {
				@Override
				public void add(String sql) { }

				@Override
				public void log(long time) { }
			};
        }
	}
}