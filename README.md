# ANET

This repository is structured in two main, disparate components: the frontend and the backend.
The frontend is a react.js based JavaScript application that communicates with the
backend via XMLHttpRequest (ajax). The backend is a Java application based on a
framework called Dropwizard that runs on a JVM and utilizes Microsoft SQL Server for
its database.

This README is divided into three pieces:
1. Working on the backend
2. Working on the frontend
3. Deploying to production

## Java Backend

### Initial Setup
1. Clone this repository to your computer
2. `touch localSettings.gradle`. This will be a file for all of your local settings and passwords
that should not be checked into the GitHub.
3. You can either use SQLite or Microsoft SQL Server for your database. The former allows you
to run entirely on your local machine and develop offline. The latter allows you to test on
the same database and feature set that production will use. We do our best to support both
but cannot garauntee that the SQLite code will exactly match the SQL Server.
	- SQLite:
		- this is currently the default, so you don't need to do anything special
	- MSSQL:
		- Run the gradle commands in the rest of this document with the DB_DRIVER env variable, e.g.
		`DB_DRIVER=sqlserver ./gradlew run`
		- Paste the following in your `localSettings.gradle` file (with the correct values):

```
	run.environment("ANET_DB_USERNAME","username")
	run.environment("ANET_DB_PASSWORD", "password")
	run.environment("ANET_DB_SERVER", "db server hostname")
	run.environment("ANET_DB_NAME","database name")
```

4. Open anet.yml and make sure the port settings look good for you. If you change the port, also update the "proxy" field in client/package.json.
5. Run `./gradlew build` to download all dependencies and build the project
6. Run `./gradlew dbMigrate` to build and migrate the database
	- The database schema is stored in src/main/resources/migrations.xml
7. Seed the initial data:
	- SQLite: `cat insertBaseData.sql | ./mssql2sqlite.sh | sqlite3 development.db`
	- MSSQL: You'll need to manually connect to your sqlserver instance and run `insertBaseData.sql`

### Developing
1. Run `./gradlew dbMigrate` whenever you pull new changes to migrate the database.
	- You may need to occasionally destroy, re-migrate, and re-seed your database if it has fallen too far out of sync with master.
2. Run `./gradlew run` to run the server.
3. You should now be able to go to http://localhost:8080/ in your browser.

- If you're doing backend development, we recommend Eclipse:
	- Run `./gradlew eclipse` to build the Eclipse classpath.
	- Create a new project in Eclipse from the directory you checked out this repositoy to. Eclipse should automatically pick up the project definition.
	- The main method is in mil.dds.anet.AnetApplication.

## React Frontend

### Initial Setup
1. Make sure you have node.js v7.x installed: (http://nodejs.org)
2. All of the frontend code is in the `client/` directory. `cd client/`
3. Install the development dependencies: `npm install`
4. Run the server: `npm start`

NB: You only need node.js and the npm dependencies for developing. When we deploy
for production, everything is compiled to static files. No Javascript dependencies
are necessary on the server.

### Developing
1. Run `npm install` to make sure your dependencies are up to date.
2. Run `npm start` to start the dev server.
3. You should now be able to go to http://localhost:3000/ in your browser

## How the backend works
This is an attempt to describe the complete start to finish of how a request makes its way through the ANET stack.

1. When you boot up ANET, it will execute the mil.dds.anet.AnetApplication class.  All HTTP resources are initialized via the run() method here.  
2. Each resource is annotated with a `@Path` annotation that will tell you the URL path that the class will serve.  
3. On boot, the server will spit out all of the HTTP paths that it knows about in the form:
	GET     / (mil.dds.anet.resources.HomeResource)
	POST    /advisorOrganizations/new (mil.dds.anet.resources.AdvisorOrganizationResource)
	POST    /advisorOrganizations/update (mil.dds.anet.resources.AdvisorOrganizationResource)
	GET     /advisorOrganizations/{id} (mil.dds.anet.resources.AdvisorOrganizationResource)

4. This tells you the URL, and then the class that will serve that URL.
5. Parameters into those methods are autowired in based on the HTTP request
	- `@PathParam` will pull a named parameter out of the @Path annotation on the method
	- `@QueryParam` will pull a named parameter out of the URL query string (ie ?foo=bar)
	- Objects without annotations will be deserialized by Jackson from the HTTP entity
	- `@Auth` will pull the current logged in user
		- If Authentication is required, the Auth filter in `mil.dds.anet.AnetAuthenticator` will determine your user principal.
	- `@Produces` annotations describe which content type the method can produce. Typically this is going to be either `application/json` if the endpoint only serves JSON, or `text/html` if this endpoint can also return HTML (more on how that is determined later).
	- `@GET`, `@POST` , and similar annotations describe which HTTP methods this method will respond to.
6. Within each Resource class, there is a `dao` (Database Access Object).  Each DAO contains all of the SQL logic for actually communicating with the database.  
7. Each first-class object that ANET deals with (People, Reports, Billets, Tashkils, Comments, Poams, Advisor Organizations, etc),  is represented by a single class that contains all of the properties and methods that that object can do. These are all in the `mil.dds.anet.beans` package.
	- These objects are deserialized from JSON when they are passed in the HTTP request body as part of a POST
	- These objects can be serialized back into JSON if they are returned by a method that `@Produces(MediaType.APPLICATION_JSON)`
	- Because these objects all inherit from the dropwizard `View` class, they can be rendered into HTML if returned by a method that `@Produces(MediaType.TEXT_HTML)`
		- To get an object to render a particular view, call `.render(viewName)` on the object before returning it.  

	@GET  
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Report getReportById(@PathParam("id") int id) {
		return dao.getById(id).render("show.ftl");
	}

8. After a Resource method returns, any registered post filters will run
	- Currently `mil.dds.anet.views.ViewResponseFilter` is the only filter.  This filter will attach the user principal as well as the current URL onto the view object if that's part of the response.

## How the GraphQL API Works
GraphQL (http://graphql.org/) is a query language developed by Facebook to allow API consumers to explore a 'Graph' without requiring the server to have implemented every possible API call ahead of time.  The client developer can ask for what data they want, and the GraphQL layer w
ill figure out what data it needs to fetch and then fetch specifcally that data.  This reduces the number of round-trip HTTP calls that need to be done between a client and a server.

In ANET, we implemented GraphQL using the graphql-java (https://github.com/graphql-java/graphql-java) implementation on top of our REST interface.  Here is a brief run-through of how a graphql query gets executed:

1. All GraphQL queries go to the `GraphQLResource#graphql()` method.  This resource is initalized by being passed all of the other REST Resources within ANET.
2. The GraphQLResource will scan through all of the other REST Resources and look for methods that are annotated with the `@GraphQLFetcher` annotation. This annotation tells GraphQL that it can use this method as a "entry point" into the ANET Graph. 
    - "The Anet Graph" is the term we'll use to describe all of the data within ANET and the relationships between the different object types.  ie: A Person with id 123 has a Position which belongs to an Organization... and so on.
	- You can always pass the `f:` argument to call a Resource method, this will use either the value passed to the `@GraphQLFetcher`, or the name of the method if no value is passed.
3. Once you have an object that was returned from a Resource (these are the Beans), you can call any of the 'get' methods on that object to fetch fields.  To put this all together, the query `person(id:123) { id, name}` will look for a method on PersonResource that takes a parameter of name `id`, and then when it gets the `Person` object back, it will call the `getId()` and `getName()` methods on that Person object to fetch those fields.
4. Each of the primary objects within ANET (The Beans, or Person, Position, Organization, Report, Poam), knows about its relationships to other objects.  Similar to the above example, if you query graphql with `person(id:123) { postion {name }}` it will find the person with id 123, and then call the `getPosition()` method on the Person object to fetch that relationship.
    - This is an example of how GraphQL saves us a round-trip to the server versus using a strict REST api, where the client would have to call '/people/123' and then '/positions/XXX'.
5. For any method where arguments are required, the GraphQLResource scans all of the methods in Resources and Bean classes to look for what arguments are required and then will look for those arguments passed via the GraphQL query.
    - In a REST Resource, we use the existing `@PathParam` and `@QueryParam` annotations to pull the name of the parameters.
    - In the Bean classes, we use `@GraphQLParam` to annotate the name of the parameters.


Here's a sample GraphQL query and how ANET processes it: 
` person(id:123) {
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
}`

1. Because you POST'd this to /graphql, Dropwizard will take the JSON and deserialize it into a Map<String,Object> and pass it to the graphql method. 
2. The `graphql-java` library will parse the structure and validate the input. 
3. The `person` keyword will tell GraphQL that you want to access the `person` object type at the root level. This goes to the `PersonResource`. 
4. The `AnetResourceDataFetcher` is the class that will get asked to load the person object. It looks at all of the methods on `PersonResource` that are annotated with `@GraphQLFetcher` and figures out which one it has the right arguments to call. In this case it will be `getById(int id)`.  That method is called and it will do a database load and return the person. 
5. GraphQL next looks at the fields on the Person that we need to load, in this case `id, name, position, authoredReports`.  For each of these fields, they were defined on the person type by the `GraphQLResource.buildTypeFromBean` method, which scans a Bean class for getter methods and wires them up to be used later.  In this case it will look for methods called `getId()`, `getName()`, `getPosition()` and `getAuthoredReports()`.  Each of these exist except for the `getAuthoredReports()`, we'll get to that. 
6. Each of these other methods are called and the values returned.  For `getPosition()` this causes a DB query to fire, which loads the Position (if necessary).  
7. For `getAuthoredReports`, when `buildTypeFromBean()` was scanning the Person Bean it noticed that this method required arguments, so it kept track of those.  When you try to call this method it will inspect the query to see if you passed the correct arguments. If so it will pass those arguments, and if not then it will throw an error. 
    - Bottom line: All `get*()` methods on Beans are exposed. If they require arguments, you *MUST* annotate them with `@GraphQLParam`.  
	- You can use `@GraphQLIgnore` to tell GraphQL to not expose a getter method. 


* Note: GraphQL does _not_ use Jackson to serialize anything into JSON, it individually fetches the exact fields the client requests and transforms those into JSON using its own type system. 
* Note: While GraphQL does technically support writing data to the server through mutations, we do not have any of that implemented.  You must still use the REST api to write any data to ANET. 

## How the frontend works

React structures the application into components instead of technologies. This means that everything that gets rendered on the
page has its own file based on its functionality instead of regular html, css, and js files. For example, the new report form
lives in `client/src/pages/reports/New.js` and contains everything needed to render that form (all the CSS, HTML, and JS). It
composes a number of other components, for example the Form and FormField components which live in `client/src/components/Form.js`
and `client/src/components/FormField.js`, which likewise contains everything needed to render a form field to the screen. This
makes it very easy to figure out where any given element on screen comes from; it's either in `client/src/pages` or
`client/src/components`. Pages are just compositions of components written in HTML syntax, and components can also compose
other components for reusability.

## Deploying to production

Coming soon.

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
