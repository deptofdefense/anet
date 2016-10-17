# anet

## Getting Started
- Clone this repository to your computer
- Open anet.yml and make sure the port settings look good for you.  If you want to use SQLite, then leave the Database settings alone, otherwise swap out the commented config for the database. 
- If you want to use a MSSQL database  create a local file called localSettings.gradle that looks like this:
	run.environment("ANET_DB_USERNAME","<username>")
	run.environment("ANET_DB_PASSWORD", "<password>")
	run.environment("ANET_DB_SERVER", "<db server hostname>")
	run.environment("ANET_DB_NAME","<database name>")
- Run `./gradlew build` to download all dependencies and build the project
- Run `./gradlew dbMigrate` to build and migrate the database
  - The database schema is stored in src/main/resources/migrations.xml
- Run `./gradlew run` to run the server
- You should now be able to go to `localhost:8080/` in your browser

## Getting Started w/ Eclipse
- Download eclipse
- run `./gradlew eclipse` to build the eclipse classpath
- Create a new project in eclipse from the directory you checked out the anet source code to. Eclipse should automatically pick up the project definition
- The main method is in mil.dds.anet.AnetApplication
