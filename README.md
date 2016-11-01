# Anet

## Getting Started
- Clone this repository to your computer
- You can either use SQLite or Microsoft SQL Server for your database.
	- For SQLite: 
		- just run `touch localSettings.gradle` to create the local settings file.
		- you won't need to change anything.  
	- for MSSQL Server 
		- create a local file called localSettings.gradle that looks like this:

	run.environment("ANET_DB_USERNAME","username")
	run.environment("ANET_DB_PASSWORD", "password")
	run.environment("ANET_DB_SERVER", "db server hostname")
	run.environment("ANET_DB_NAME","database name")

- Open anet.yml and make sure the port settings look good for you.  
- Run `./gradlew build` to download all dependencies and build the project
- Run `./gradlew dbMigrate` to build and migrate the database
  - The database schema is stored in src/main/resources/migrations.xml
- Run `./gradlew run` to run the server
- You should now be able to go to `localhost:8080/` in your browser


##Developing in ANET
- If you're doing Front End development, you want to run the ANET server with `./gradlew run` and then launch a watch process on the front end assets with `./gradlew processResources --continuous` in another terminal. 
- If you're doing Back End development, we recommend eclipse: 
	- run `./gradlew eclipse` to build the eclipse classpath
	- Create a new project in eclipse from the directory you checked out the anet source code to. Eclipse should automatically pick up the project definition
	- The main method is in mil.dds.anet.AnetApplication

##How the heck does ANET work
This is an attempt to describe the complete start to finish of how a request makes its way through the ANET stack. ANET is built on Dropwizard (http://dropwizard.io) on the server side with Freemarker (http://freemarker.org/) templates for the front-end. 

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

