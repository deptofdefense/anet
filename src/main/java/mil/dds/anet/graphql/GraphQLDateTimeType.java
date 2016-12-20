package mil.dds.anet.graphql;

import org.joda.time.DateTime;

import graphql.schema.Coercing;
import graphql.schema.GraphQLScalarType;

public class GraphQLDateTimeType extends GraphQLScalarType {

	private static final Coercing coercing = new Coercing() {
        @Override
        public Object serialize(Object input) {
            return Long.toString(((DateTime) input).getMillis());
        }

        @Override
        public Object parseValue(Object input) {
        	return new DateTime(Long.parseLong((String)input));
        }

        @Override
        public Object parseLiteral(Object input) {
        	throw new RuntimeException("wtf is this!");
//        	return input;
        }
    };
	
	public GraphQLDateTimeType() {
		super("DateTime", null, coercing);
	}

}
