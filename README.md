# anet

## Getting Started
- clone this repository to your computer
- create a local file called localSettings.gradle that looks like this:
	run.environment("ANET_DB_USERNAME","<username>")
	run.environment("ANET_DB_PASSWORD", "<password>")
	run.environment("ANET_DB_SERVER", "<db server hostname>")
	run.environment("ANET_DB_NAME","<database name>")
- Run `./gradlew build` to download all dependencies and build the project
- Run `./gradlew run` to run the server
- You should now be able to go to `localhost:8080/` in your browser
