#ANET2 Documentation

## Maintainer Documentation

### Overview
ANET2 is comprised of three major components: the Database, an Application server, and the User Interface.

- **DB**: ANET2 uses a Microsoft SQLServer database to store all data, keep backups, provide consistency of relationships, and perform advanced search.  ANET2 requires SQLServer 2014 or higher.  More details on the Schema of the Database is available in the Developer Documentation. 
- **Application Server**: ANET2's primary server functions, business logic, and authorization is performed in a Web Application server written in Java.  This server receives requests from users, determines if they are authorized and valid, and then performs the necessary fetching or manipulation of data in the Database.  The application server runs over HTTP/HTTPS (port 80/443) and communicates with clients using standard JSON data formats.  More detail about the APIs exposed from the application server is avaiable in the Developer Documentation. The application server requires Java version 1.8 to run. 

- **User Interface**: ANET2's user interface is a website that users will access using any modern web browser (Recommended: Google Chrome version XXX or greater, Required: IE version 11 or greater, Firefox version XXX or greater).  There is no client software or special browser plugins that need to be installed to access and use the ANET2 platform.

#### Software, Licenses, Skillsets/Roles
ANET2 is built primarily using Open Source languages, frameworks, and libraries that are standard throughout the software industry.  The only proprietary software that ANET2 depends on is Microsoft SQLServer.  To successfully develop, build, run, and manage a deployment of ANET2, the following roles and skillsets are recommended: 

1. **DBA**: Somebody needs to take care of your database, this role can easily be shared with other projects and does not need to dedicated to ANET2. Responsiblities include patching and upgrading the Database software, ensuring backups are taken and reliable, and advising on query performance/tuning. 
2. **Full-stack Software Engineer**: This person/people will be the primary developer of new features on ANET2 and troubleshoot any bugs/issues that arise. This person should have a strong background in developing user-centric applications in an agile-development lifecycle and can react quickly to changing requirements.  As the lead developer, this individual will work closely with users to understand needs and issues, work closely with the ANET2 Administrator, and the Product Owner to determine the correct solution, and then implement, test, and iterate on that solution.  They should have a strong understanding, or willingness to learn, the following concepts/languages: 
	* SQL
	* Java
	* REST APIs 
	* HTTP servers 
	* Javascript, HTML, CSS
	* React
	* Git for version control

3. **System Administrator**: Somebody needs to manage your Windows server, patches, and keep the service running.  This role can easily be shared with other projects and does not need to be dedicated to ANET2.  Responsiblities include patching and upgrade of the Server Operating Systems, providing support to release new versions of the ANET2 platform on a regular basis, and ensuring performance and uptime of the server environment. 
4. **ANET2 Administrator / Level-1 Support**: This role provides the day-to-day management of the system, working with users on any issues, serving as the initial triage of incoming requests, performing management of top level data structures within the system (Organizations, Poams).  This person should have a basic understanding of, or willingness to learn, Databases, application servers, and websites. This role does not need to be overly technical in nature and should be focused on engaging with and supporting users of the platform. 


## Network Architecture
<!-- Put a picture of the network architecture here! -->

### Client
The client can be any users on the appropiate network with a modern web-browser. ANET uses HTTP/HTTPS (ports 80/443) to communicate between the client and server. (IS THERE ANY SPECIFIC BROWSER FEATURE THAT NEEDS TO BE TURNED ON?)

### Application Server
The ANET2 Application Server can run on any Windows Server operating system.  Recommended system configuration is: 300 GB HDD, 64 GB RAM, and 8x CPUs.  The Application server must be able to communicate with the Database server, the Windows Domain Controller for AD Authentication, and the SMTP server for outbound mail. 

### Database
ANET2 Requires at least a Microsoft SQL Server 2014 Database. 

### Backup
Backups should be taken daily from the SQL Database and transferred to a seperate file server for safe keeping.

### Authentication
User Authentication in production is done via Windows Domain Authentication.

### Map Imagery Server
To enable the ANET2 maps, you will need a source of Map imagery.  ANET2 supports local cached tiles, WMS servers, or ArcGIS servers with a REST API enabled. 

### Production vs Test Environments
It is recommended to have a seperate Production and Test environment that mirror each other as closely as possible. However, it is totally acceptable to have less resources for the Test environment.

## Installation instructions
The following instructions document how to take a build of ANET2 and install it into a clean environment.  Instructions on how to build ANET2 are included in the Developer Documentation below. 

The following information will be needed in order to complete this installation
- Directory on the Application server to install ANET2 to. 
- Username/password and Database Name for the SQL database. 
- SMTP Server information (including Username/Password if required)
- Admin privelages to register a new Windows Service
- Information on External Map imagery sources, or local cached imagery tiles. 

### Application Server
- Unzip anet.zip into the installation directory
- Ensure JAVA\_HOME is set
- Update/create anet.yml with the right config params. 
- If you are using a local imagery cache, update the CLASSPATH in the anet.bat file to include the path to the imagery [THIS SHOULD BE CHANGED TO SUCK LESS]

### SQL
- To initiate the SQL database with the appropiate schema, run the command `bin\anet.bat db migrate anet.yml`. 
- [WRITE A BUNDLE PROVIDER THAT CREATES THE INITIAL ORG, POSITION, AND USER]

### NSSM
- We recommend the use of the NSSM tool to register ANET2 as a service within Windows.
- To do this [FILL IN THESE STEPS]

### Startup
- To start the ANET2 server for quick testing, you can run `bin\anet.bat server anet.yml`.  To start the ANET2 server for production use, use the NSSM tool to start the ANET2 service. The command for this is `nssm.exe start anet`

## Troubleshooting
The recommended strategy for troubleshooting is to first identify where the error is occuring, either in the javascript in the browser, or an error on the application server.  Start by opening the browser developer console and look at the network calls to look for any calls that are returning errors [ UPDATE THE GRAPHQL ENDPOINT TO THROW A NON-200 IN THE EVENT OF AN ERROR]. If there are any errors on the network calls, look to the server side log files for more information.  If no errors are being returned, look for any errors in the browser console for more information.

In the event there are still no errors, it might be necessary to troubleshoot the issue in a development environment that supports debugging breakpoints and variable watches.  More information about how to setup and configure this environment can be found in the Developer Documentation below. 

### Log Files
For any issues related to the Application Server, check the log file in `logs\anet.log`
[INCLUDE SOME DETAILS ON HOW TO READ THE ERROR LOGS]
### Browser Console
For any issues related to the web-browser front-end check the browser console (found in the Developer Tools) in the browser. 

# Developer Documetation
## Setting up your Developer Environment (Eclipse, gradle, node, Chrome/Firefox)

- Download Eclipse
- Download a JDK v1.8
- Download node
- Checkout the source code from github. 
- run `./gradlew eclipse` (linux/mac) or `./gradlew.bat eclipse` (windows) to download all the java dependencies 
- in the `client/` directory, run `npm install`  to download all the javascript dependencies. 
- Open eclipse and import the anet/ directory into eclipse as a new project. Ensure there are no compile errors. If there are, you are probably missing dependencies, try re-running `./gradlew eclipse`. 
- Update the settings in `anet.yml` for your environment. 
- To start the frontend server, in the `client/` directory, run `npm run start` (linux/mac) or `node.exe scripts/start.js` (windows).
- To start the backend server, in eclipse execute the `mil.dds.anet.AnetApplication` class as a Java Application. You'll need to edit the arguments passed to this application and set them to `server anet.yml`.

## DB (Schema)
<!-- put in a picture of the Db Schema -->
<!-- describe all of the relationships -->

## Java Application Server
This section will describe how the ANET2 Application Server works and the various components.  Two major frameworks that we use are:

- **Dropwizard** is a framework for developing java-based web applications. ( http://www.dropwizard.io/1.0.5/docs/ ).  It is a collection of other industry standard, open source, libraries to handle things like JSON parsing, HTTP multi-threading, Authentication, Authorization, Database access, etc.  We highly recommend you read the getting started guide and briefly scan the user manual.
- **GraphQL** (http://graphql.org/) is a query language developed by Facebook to allow API consumers to explore a 'Graph' without requiring the server to have implemented every possible API call ahead of time.  The client developer can ask for what data they want, and the GraphQL layer will figure out what data it needs to fetch and then fetch specifcally that data.

Throughout the next several sections, we were refer to the *core ANET object types*, these are 

- People
- Positions
- Organizations
- Reports
- Poams
- Locations

The Java Application Server is comprised of 5 major pieces

- **Beans**: These are Java objects that are serializable and represent the major types in ANET (Person, Position, Organization, Report, Poam, etc).  They are comprised of private fields typically representing the columns in the database, getter's and setter's for those fields, and load\*() methods for the various relationships between object types (ie, on the Person bean, there is a loadPosition() method). 
- **DAOs** (Data Access Objects):  These objects are the relationship between the beans and the SQL database.  They contain all of the actual SQL statements to do the `INSERT`, `SELECT`, and `UPDATE` calls on a given object.  There is one DAO per Bean (ie PersonDao, PositionDao, OrganizationDao, etc), and that DAO returns objects (or Lists of Objects) of that particular type.  So if you are looking for a Database Query that returns Reports, look in ReportDao. 
- **Mappers**:  These are classes that store the logic on how to take a `ResultSet` from a SQL query and turn it into a Bean.  They should be fairly straightforward and basic.  There is one per Bean type. 
- **Resources**: These are classes that store all of the REST endpoints for a given object type.  These methods are expected to take in an HTTP call from a user, and provide the correct response.  In general if you are trying to get an object of a particular type, you should be calling that Resource (ie ReportResource returns Reports, PersonResource returns People). These methods can also be called by the GraphQL API if they are appropiately annotated.
- **SearchQuery**:  These classes are JavaBeans that represent the advanced searches that can be run on a particular core object type.  There are then implementations for each object type's SearchQuery to actually perform the search.  More on this later. 

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

1. When you boot up ANET, it will execute the mil.dds.anet.AnetApplication class.  All HTTP resources are initialized via the run() method here.
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
	- `@PathParam` will pull a named parameter out of the @Path annotation on the method (ie /api/people/{id} )
	- `@QueryParam` will pull a named parameter out of the URL query string (ie ?foo=bar)
	- Objects without annotations will be deserialized by Jackson from the HTTP entity
	- `@Auth` will pull the current logged in user
		- If Authentication is required, the Auth filter in `mil.dds.anet.AnetAuthenticator` will determine your user principal.
	- `@Produces` annotations describe which content type the method can produce. This is almost always going to be `application/json`.
	- `@GET`, `@POST` , and similar annotations describe which HTTP methods this method will respond to.
6. Within each Resource class, there is a `dao` (Database Access Object).  Each DAO contains all of the SQL logic for communicating with the database.
7. Each of the core ANET object types is represented by a bean that contains all of the properties and methods that that object can do. These are all in the `mil.dds.anet.beans` package.
	- These objects are deserialized from JSON when they are passed in the HTTP request body as part of a POST
	- These objects can be serialized back into JSON if they are returned by a method that is annotated with `@Produces(MediaType.APPLICATION_JSON)`
```
@GET
@Path("/{id}")
@Produces(MediaType.APPLICATION_JSON)
public Report getReportById(@PathParam("id") int id) {
	return dao.getById(id);
}
```

## How the GraphQL API Works
GraphQL is the mechanism by which most data is fetched to be displayed in the web-frontend.  In ANET, we implemented GraphQL using the graphql-java (https://github.com/graphql-java/graphql-java) implementation on top of our REST interface.  By using GraphQL we call the exact same functions that the REST API does, but we are able to be much more descriptive about what data we want back, and therefore reduce the number of round-trips between the client and the server.  Here is a brief run-through of how a graphql query gets executed:

1. All GraphQL queries go to the `GraphQLResource#graphql()` method.  This resource is initalized by being passed all of the other REST Resources within ANET.
2. The GraphQLResource will scan through all of the other REST Resources and look for methods that are annotated with the `@GraphQLFetcher` annotation. This annotation tells GraphQL that it can use this method as a "entry point" into the ANET Graph. 
    - "The Anet Graph" is the term we'll use to describe all of the data within ANET and the relationships between the different object types.  ie: A Person with id 123 has a Position which belongs to an Organization... and so on.
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

1. Because you POST'd this to /graphql, Dropwizard will take the JSON and deserialize it into a Map<String,Object> and pass it to the graphql method. 
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
* Note: While GraphQL does technically support writing data to the server through mutations, we do not have any of that implemented.  You must still use the REST api to write any data to ANET. 


### Advanced Search
## React
### Pages, Components, API (oh my?)
### Webpack & the build


# Administration Documentation
## The Object Model
## How To's

