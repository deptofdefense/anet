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

4. Open anet.yml and make sure the port settings look good for you.
5. Run `./gradlew build` to download all dependencies and build the project
6. Run `./gradlew dbMigrate` to build and migrate the database
	- The database schema is stored in src/main/resources/migrations.xml
7. Seed the initial data:
	- SQLite: `sqlite3 development.db < lite_insertBaseData.sql`
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

## How the frontend works

React structures the application into components instead of technologies. This means that everything that gets rendered on the
page has its own file based on its functionality instead of regular html, css, and js files. For example, the new report form
lives in `client/pages/reports/New.js` and contains everything needed to render that form (all the CSS, HTML, and JS). It
composes a number of other components, for example the HorizontalFormField which lives in `client/components/FormField.js`,
which likewise contains everything needed to render a form field to the screen. This makes it very easy to figure out where
any given element on screen comes from; it's either in `client/pages` or `client/components`. Pages are just compositions of
components written in HTML syntax, and components can also compose other components for reusability.

## Deploying to production

Coming soon.
