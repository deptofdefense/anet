# ANET

This repository is structured in two main, disparate components: the frontend and the backend.
The frontend is a react.js based JavaScript application that communicates with the
backend via XMLHttpRequest (ajax). The backend is a Java application based the Dropwizard 
framework that runs on a JVM and utilizes Microsoft SQL Server for
its database.

See [DOCUMENTATION.md](./DOCUMENTATION.md) and [INSTALL.md](./INSTALL.md) for additional information.

This README is divided into three pieces:

1. [Getting your Development Environment Set Up](#setting-up-your-developer-environment-eclipse-gradle-node-chromefirefox)
1. [Working on the backend](#java-backend)
1. [Working on the frontend](#react-frontend)

## Setting up your Developer Environment (Eclipse, gradle, node, Chrome/Firefox)
This section describes the recommended Developer Environment and how to set it up.  You are welcome to use any other tools you prefer. 

### Download Software
Download the following:

- [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html).  This can also be either installed, or downloaded as a .zip.  If you do not use the installer, be sure to set the `JAVA_HOME` environment variable to the location of the JDK. 
- [Eclipse](http://www.eclipse.org/downloads/).  Eclipse is a Java IDE.  It can be downloaded as an installer or as a .zip file that does not require installation.  
	- When the installer asks which version you'd like to install, choose "Eclipse IDE for Java Developers".
- [node.js 7.x](https://nodejs.org/en/).
- [git](https://git-scm.com/).  While this is not required, it is highly recommended if you will be doing active development on ANET. 

### Get source code
- Checkout the [source code](https://github.com/deptofdefense/anet) from github.
	```
	git clone git@github.com:deptofdefense/anet.git
	```

#### Possible Problems
- **You cannot access [the source code repo](https://github.com/deptofdefense/anet).** Solution: Get someone who does have admin access to add you as a collaborator.
- **The git clone command takes a long time, then fails.** Solution: Some networks block ssh. Try connecting to a different network.

### Set Up Workspace
1. Open a command line in the `anet` directory that was retrieved from github.  
	1. Create a new empty file at `localSettings.gradle`. (`touch localSettings.gradle` on linux/mac).  This will be a file for all of your local settings and passwords that should not be checked into the GitHub.
	1. Run `./gradlew eclipse` (linux/mac) or `./gradlew.bat eclipse` (windows) to download all the java dependencies.  This can take several minutes depending on your internet connection.
1. Change Directories into the `client/` directory
	1. Run `npm install`  to download all the javascript dependencies.  This can take several minutes depending on your internet connection. If the command hangs, it may be because your network blocks ssh. Try the command again on a different network.
1. Open Eclipse
	1. Eclipse will ask you for a `workspace` directory. You can choose any empty directory.
	1. Import the `anet/` directory into eclipse as a new project.
	1. Ensure there are no compile errors. If there are, you are probably missing dependencies. Try re-running `./gradlew eclipse`. 
	1. The main method is in `mil.dds.anet.AnetApplication`.
1. Update the settings in `anet.yml` for your environment.  See the section on ANET Configuration in [documentation.md](https://github.com/deptofdefense/anet/blob/master/DOCUMENTATION.md#anet-configuration) for more details on these configuration options. 

### Java Backend

#### Initial Setup
1. You can either use SQLite or Microsoft SQL Server for your database. The former allows you
to run entirely on your local machine and develop offline. The latter allows you to test on
the same database and feature set that production will use. We do our best to support both
but cannot guarantee that the SQLite code will exactly match the SQL Server.
	- SQLite
		- This is currently the default, so you don't need to do anything special
		- To re-force gradle to use SQLite you can set the `DB_DRIVER` environment variable to `sqlite` (e.g. `export DB_DRIVER=sqlite`)
	- MSSQL
		- Run the gradle commands in the rest of this document with the DB_DRIVER env variable (e.g.
		`DB_DRIVER=sqlserver ./gradlew run`)
		- Paste the following in your `localSettings.gradle` file (with the correct values):

			```java
			run.environment("ANET_DB_USERNAME","username")
			run.environment("ANET_DB_PASSWORD", "password")
			run.environment("ANET_DB_SERVER", "db server hostname")
			run.environment("ANET_DB_NAME","database name")
			```
1. Run `./gradlew dbMigrate` to build and migrate the database.
	- The database schema is stored in `src/main/resources/migrations.xml`.
1. Seed the initial data:
	- SQLite: `cat insertBaseData.sql | ./mssql2sqlite.sh | sqlite3 development.db`
	- MSSQL: You'll need to manually connect to your sqlserver instance and run `insertBaseData.sql`
1. Run `./gradlew build` to download all dependencies and build the project.
	- Some tests will fail if you are using SQLite, because it has a bad implementation of some timezone stuff. You'll need to use MSSQL to see all the tests passing.

#### The Base Data Set
Provided with the ANET source code is the file `insertBaseData.sql`.  This file contains a series of raw SQL commands that insert some sample data into the database that is both required in order to pass all the unit tests, and also helpful for quickly developing and testing new features.  The Base Data Set includes a set of fake users, organizations, locations, and reports.  Here are some of the accounts that you can use to log in and test with: 

| User | username | organization | position | role |
|------|----------|--------------|----------|------|
| Erin Erinson | erin | EF2.2 | EF2.2 Advisor D | Advisor who can also approve their own reports
| Rebecca Beccabon | rebecca | EF2.2 | EF2.2 Final Reviewer | Super User
| Arthur Dmin | arthur | ANET Admins | ANET Administrator | Administrator
| Jack Jackson | jack | EF2.1 | EF2.1 Advisor B | Advisor
| Henry Henderson | henry | EF2.1 | EF2.1 SuperUser | Super User
| Steve Steveson | | MoD | Cost Adder | Principal

To log in as one of the base data users, when prompted for a username and password, just enter their name as the username and leave the password blank. 

#### Developing
1. Run `./gradlew dbMigrate` whenever you pull new changes to migrate the database.
	- You may need to occasionally destroy, re-migrate, and re-seed your database if it has fallen too far out of sync with master. TODO: How do you destroy the database?
1. Run `./gradlew run` to run the server.
	- You can ignore exceptions like the following, because the SMTP server is not necessary for local development:
		```
		ERROR [2017-02-10 16:39:38,044] mil.dds.anet.AnetEmailWorker: Sending email to [hunter+liz@dds.mil] re: ANET Report Approved
		javax.mail.MessagingException: Unknown SMTP host: ${ANET_SMTP_SERVER};
		```
	- The following output indicates that the server is ready:
		```
		INFO  [2017-02-10 16:44:59,902] org.eclipse.jetty.server.Server: Started @4098ms
		> Building 75% > :run
		```
1. Go to [http://localhost:8080/](http://localhost:8080/) in your browser.
	- When prompted for credentials:
		- **Username:** `erin`
		- **Password:** Leave it blank
	- You will get an error about a missing `index.ftl` file; this is expected and means the backend server is working. The error looks like:
		```
		ERROR [2017-02-10 16:49:33,967] javax.ws.rs.ext.MessageBodyWriter: Template Error
		! freemarker.template.TemplateNotFoundException: Template not found for name "/views/index.ftl".
		```

		The web page will say ***Template Error***

1. If you want to see the app running, continue to the [React Frontend](#react-frontend) instructions.

### React Frontend
#### Initial Setup
1. Make sure you have node.js v7.x installed: ( http://nodejs.org )
1. `cd client/`
    - All of the frontend code is in the `client/` directory. 
1. Install the development dependencies: `npm install`
1. Run the server: `npm start`
1. Go to [http://localhost:3000/](http://localhost:3000/) in your browser.
	- When prompted for credentials:
		- **Username:** `erin`
		- **Password:** Leave it blank

NB: You only need node.js and the npm dependencies for developing. When we deploy
for production, everything is compiled to static files. No javascript dependencies
are necessary on the server.

## Java Application Server
This section will describe how the ANET2 Application Server works and the various components.  Two major frameworks that we use are:

- [**Dropwizard**](http://www.dropwizard.io/1.0.5/docs/) is a framework for developing java-based web applications.  It is a collection of other industry standard, open source, libraries to handle things like JSON parsing, HTTP multi-threading, Authentication, Authorization, Database access, etc.  We highly recommend you read the getting started guide and briefly scan the user manual.
- [**GraphQL**](http://graphql.org/) is a query language developed by Facebook to allow API consumers to explore a 'Graph' without requiring the server to have implemented every possible API call ahead of time.  The client developer can ask for what data they want, and the GraphQL layer will figure out what data it needs to fetch and then fetch specifcally that data.

Throughout the next several sections, we were refer to the *core ANET object types*. These are: 

- People
- Positions
- Organizations
- Reports
- Poams
- Locations

The Java Application Server is composed of 5 major pieces:

- **Beans**: Serializable Java objects that represent the major types in ANET (Person, Position, Organization, Report, Poam, etc).  They are comprised of private fields typically representing the columns in the database, getters and setters for those fields, and `load*()` methods for the various relationships between object types (e.g. on the Person bean, there is a `loadPosition()` method). 
- **DAOs** (Data Access Objects):  These objects are the relationship between the beans and the SQL database.  They contain all of the actual SQL statements to do the `INSERT`, `SELECT`, and `UPDATE` calls on a given object.  There is one DAO per Bean (e.g. `PersonDao`, `PositionDao`, `OrganizationDao`, etc), and that DAO returns objects (or Lists of Objects) of that particular type.  So if you are looking for a Database Query that returns Reports, look in `ReportDao`. 
- **Mappers**:  These are classes that store the logic on how to take a `ResultSet` from a SQL query and turn it into a Bean.  They should be fairly straightforward and basic.  There is one per Bean type. 
- **Resources**: These are classes that store all of the REST endpoints for a given object type.  These methods are expected to take in an HTTP call from a user, and provide the correct response.  In general, if you are trying to get an object of a particular type, you should be calling that Resource (e.g. `ReportResource` returns Reports, `PersonResource` returns People). These methods can also be called by the GraphQL API if they are appropiately annotated.
- **SearchQuery**:  These classes are JavaBeans that represent the advanced searches that can be run on a particular core object type.  There are then implementations for each object type's `SearchQuery` to actually perform the search.  More on this later. 

Here's a quick rundown of where to find each of these pieces: 

| Object Type | Bean | Dao | Mapper | Resource | SearchQuery |
| -----|-----|----|----|----|----|
| People | People.java  | PersonDao.java | PersonMapper.java | PersonResource.java | PersonSearchQuery.java |
| Positions | Positions.java | PositionDao.java | PositionMapper.java | PositionResource.java | PositionSearchQuery.java | 
| Organizations | Organizations.java | OrganizationDao.java | OrganizationMapper.java | OrganizationResource.java | OrganizationSearchQuery.java |
| Reports | Reports.java | ReportDao.java | ReportMapper.java | ReportResource.java | ReportSearchQuery.java | 
| Poams | Poams.java  | PoamDao.java | PoamMapper.java | PoamResource.java | PoamSearchQuery.java |
| Locations | Locations.java | LocationDao.java | LocationMapper.java | LocationResource.java | LocationSearchQuery.java |

## How the backend works
This is an attempt to describe the complete start to finish of how a request makes its way through the ANET stack.

1. When you boot up ANET, it will execute the `mil.dds.anet.AnetApplication class`.  All HTTP resources are initialized via the `run()` method here.
2. Each resource is annotated with a `@Path` annotation that will tell you the URL path that the class will serve.
3. On boot, the server will spit out all of the HTTP paths that it knows about in the form:
```
	GET     / (mil.dds.anet.resources.HomeResource)
	POST    /advisorOrganizations/new (mil.dds.anet.resources.AdvisorOrganizationResource)
	POST    /advisorOrganizations/update (mil.dds.anet.resources.AdvisorOrganizationResource)
	GET     /advisorOrganizations/{id} (mil.dds.anet.resources.AdvisorOrganizationResource)
	..... (continued) ....
```

4. This tells you the URL, and then the class that will serve that URL.
5. Parameters into those methods are autowired in based on the HTTP request
	- `@PathParam` will pull a named parameter out of the `@Path` annotation on the method (e.g. `/api/people/{id}`)
	- `@QueryParam` will pull a named parameter out of the URL query string (e.g. `?foo=bar`)
	- Objects without annotations will be deserialized by Jackson from the HTTP entity
	- `@Auth` will pull the current logged in user
		- If Authentication is required, the Auth filter in `mil.dds.anet.AnetAuthenticator` will determine your user principal.
	- `@Produces` annotations describe which content type the method can produce. This is almost always going to be `application/json`.
	- `@GET`, `@POST`, and similar annotations describe which HTTP methods this method will respond to.
6. Within each Resource class, there is a `dao` (Database Access Object).  Each DAO contains all of the SQL logic for communicating with the database.
7. Each of the core ANET object types is represented by a bean that contains all of the properties and methods that that object can do. These are all in the `mil.dds.anet.beans` package.
	- These objects are deserialized from JSON when they are passed in the HTTP request body as part of a POST
	- These objects can be serialized back into JSON if they are returned by a method that is annotated with `@Produces(MediaType.APPLICATION_JSON)`

```java
@GET
@Path("/{id}")
@Produces(MediaType.APPLICATION_JSON)
public Report getReportById(@PathParam("id") int id) {
	return dao.getById(id);
}
```

## How the GraphQL API Works
GraphQL is the mechanism by which most data is fetched to be displayed in the web-frontend.  In ANET, we implemented GraphQL using the [graphql-java](https://github.com/graphql-java/graphql-java) implementation on top of our REST interface.  By using GraphQL we call the exact same functions that the REST API does, but we are able to be much more descriptive about what data we want back, and therefore reduce the number of round-trips between the client and the server.  Here is a brief run-through of how a graphql query gets executed:

1. All GraphQL queries go to the `GraphQLResource#graphql()` method.  This resource is initalized by being passed all of the other REST Resources within ANET.
2. The GraphQLResource will scan through all of the other REST Resources and look for methods that are annotated with the `@GraphQLFetcher` annotation. This annotation tells GraphQL that it can use this method as a "entry point" into the ANET Graph. 
    - "The Anet Graph" is the term we'll use to describe all of the data within ANET and the relationships between the different object types. e.g.: A Person with id 123 has a Position which belongs to an Organization... and so on.
	- You can always pass the `f:` argument (f is for Function) to call a Resource method, this will use either the value passed to the `@GraphQLFetcher`, or the name of the method if no value is passed.
3. Once you have an object that was returned from a Resource (these are the Beans), you can call any of the 'get' methods on that object to fetch fields.  To put this all together, the query `person(id:123) { id, name}` will look for a method on PersonResource that takes a parameter of name `id`, and then when it gets the `Person` object back, it will call the `getId()` and `getName()` methods on that Person object to fetch those fields.
4. Each of the primary objects within ANET (The Beans, or Person, Position, Organization, Report, Poam), knows about its relationships to other objects.  Similar to the above example, if you query graphql with `person(id:123) { postion {name }}` it will find the person with id 123, and then call the `getPosition()` method on the Person object to fetch that relationship.
    - This is an example of how GraphQL saves us a round-trip to the server versus using a strict REST api, where the client would have to call '/people/123' and then '/positions/XXX'.
5. For any method where arguments are required, the GraphQLResource scans all of the methods in Resources and Bean classes to look for what arguments are required and then will look for those arguments passed via the GraphQL query.
    - In a REST Resource, we use the existing `@PathParam` and `@QueryParam` annotations to pull the name of the parameters.
    - In the Bean classes, we use `@GraphQLParam` to annotate the name of the parameters.

Here's a sample GraphQL query and how ANET processes it: 
```
person(id:123) {
	id,
	name,
	position { 
		id,
		name,
	},
	authoredReports(pageNum:0, pageSize:10) { 
		id, 
		intent
	}
}
````

1. Because you POST'd this to `/graphql`, Dropwizard will take the JSON and deserialize it into a `Map<String, Object>` and pass it to the GraphQL method. 
2. The `graphql-java` library will parse the structure and validate the input. 
3. The `person` keyword will tell GraphQL that you want to access the `person` object type at the root level. This goes to the `PersonResource`. 
4. The `AnetResourceDataFetcher` is the class that will get asked to load the person object. It looks at all of the methods on `PersonResource` that are annotated with `@GraphQLFetcher` and figures out which one has the right arguments to call. In this case it will be `getById(int id)`.  That method is called and it will do a database load and return the person. 
5. GraphQL next looks at the fields on the Person that we need to load, in this case `id, name, position, authoredReports`.  For each of these fields, they were defined on the person type by the `GraphQLResource.buildTypeFromBean` method, which scans a Bean class for getter methods and wires them up to be used later.  In this case it will look for methods called `getId()`, `getName()`.  For `authoredReports` and `positions` it will find the methods `loadAuthoredReports()` and `loadPosition` because they are annotated with `@GraphQLFetcher`.  
	- As a convention, methods starting with `get` will never perform a database load and always return the value currently in memory.  `load` functions will execute a database query if necessary in order to return the correct value. 
6. Each of these methods are called and the values returned.  
7. For `getAuthoredReports`, when `buildTypeFromBean()` was scanning the Person Bean it noticed that this method required arguments, so it kept track of those.  When you try to call this method it will inspect the query to see if you passed the correct arguments. If so it will pass those arguments, and if not then it will throw an error. 
    - Bottom line: All `get*()` methods on Beans are exposed. If they require arguments, you *MUST* annotate them with `@GraphQLParam`.
	- You can use `@GraphQLIgnore` to tell GraphQL to not expose a getter method. 

* Note: GraphQL does _not_ use Jackson to serialize anything into JSON, it individually fetches the exact fields the client requests and transforms those into JSON using its own type system. 
* Note: While GraphQL does technically support writing data to the server through mutations, we do not have any of that implemented.  You must still use the REST API to write any data to ANET. 

## How the frontend works
React structures the application into components instead of technologies. This means that everything that gets rendered on the
page has its own file based on its functionality instead of regular HTML, CSS, and JS files. For example, the new report form
lives in `client/src/pages/reports/New.js` and contains everything needed to render that form (all the CSS, HTML, and JS). It
comprises a number of other components, for example the `Form` and `FormField` components which live in `client/src/components/Form.js`
and `client/src/components/FormField.js`, which likewise contains everything needed to render a form field to the screen. This
makes it very easy to figure out where any given element on screen comes from; it's either in `client/src/pages` or
`client/src/components`. Pages are just compositions of components written in HTML syntax, and components can also compose
other components for reusability.

## How to pull down new changes and update your local server
1. Close any servers you have running (the `./gradlew` or `npm` commands)
2. Pull down any updates `git pull`
3. If you see any changes to `src/main/resources/migrations.xml` this means there are updates to the database schema.  Run `./gradlew dbMigrate` to update your database schema. 
	- If you are using sqlserver then you need to run `export DB_DRIVER='sqlserver'` to tell gradle to use your sqlserver configuration
4. If you see any changes to `insertBaseData.sql` then there are updates to the base data set. 
	- If you are using sqlite, then run `cat insertBaseData.sql | ./mssql2sqlite.sh | sqlite3 development.db`
	- If you are using sqlserver, then use your favorite SQL connector to run the insertBaseData.sql file. 
5. Re launch the backend server with `./gradlew run`
6. Re launch the frontend server with `./npm run start`

## How to set up Selenium Builds to automatically test workflows
Selenium makes a plug-in for Firefox that lets you record the actions you take on a webpage so that it can rerun them for your later. We use Selenium builds to walk through a series of workflows to see if everything worked as expected, or if something failed. This helps us quickly identify if changes have broken something that we need to fix. Are you super excited to set this up and get testing?! Me too. Here's what you do:

1. Make sure you have Mozilla Firefox installed on your computer
2. Google and download "Selenium IDE" - this is the name of the extension you'll install
3. Install Selenium IDE
4. Once you've installed Selenium, open up Firefox and click on "Tools" on the top menu. 
5. Select "Selenium IDE" from the dropdown menu. 
6. From there, a window will pop up that allows you to record workflows by selecting the record icon and completing your desired actions
7. To load the existing workflows we have recorded, select "File" and then open from the top menu
8. Our existing builds are saved in client/tests/selenium


## Random Documentation!! 

### How to add a new field to an object

1. Create a migration to add it to the database tables
2. Edit the bean object to add the field and getter/setters
3. Edit the Mapper class to map the field when it comes out of the database
4. Edit the Dao class to 
	a. add it to the list of Columns in the *_FIELDS variable for the class. ( ie PersonDao.PERSON_FIELDS)
	b. update any SQL to ensure the value gets INSERTed and UPDATEd correctly. 
6. update the bean tests to include having this property and update the src/test/resources/testJson to include the property. 
5. Update the resource unit tests to try setting, fetching, and updating the property. 

### Map Layers

Set the `MAP_LAYERS` admin Setting to a JSON object that looks like this: 

```json
[
	{
		"type": "wms", 
		"url" : "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi",
		"layer": "nexrad-n0r-900913",
		"name" : "nexrad"
	}
]
````


