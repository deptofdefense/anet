package mil.dds.anet.utils;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

public class AnetAuditLogger {
	private static Logger log = Log.getLogger(AnetAuditLogger.class);

	public static void log(String message, Object... args) {
		log.info(message, args);
	}
}
