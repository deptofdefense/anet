# How the frontend works
React structures the application into components instead of technologies. This means that everything that gets rendered on the page has its own file based on its functionality instead of regular HTML, CSS, and JS files. For example, the new report form lives in `client/src/pages/reports/New.js` and contains everything needed to render that form (all the CSS, HTML, and JS). It comprises a number of other components, for example the `Form` and `FormField` components which live in `client/src/components/Form.js` and `client/src/components/FormField.js`, which likewise contains everything needed to render a form field to the screen. This makes it very easy to figure out where any given element on screen comes from; it's either in `client/src/pages` or `client/src/components`. Pages are just compositions of components written in HTML syntax, and components can also compose other components for reusability.

# How to pull down new changes and update your local server
1. Close any servers you have running (the `./gradlew` or `npm` commands)
1. Pull down any updates `git pull`
1. If you see any changes to `src/main/resources/migrations.xml` this means there are updates to the database schema.  Run `./gradlew dbMigrate` to update your database schema.
  - If you are using sqlserver then you need to run `export DB_DRIVER='sqlserver'` to tell gradle to use your sqlserver configuration
1. If you see any changes to `insertBaseData.sql` then there are updates to the base data set.
  - If you are using sqlite, then run `cat insertBaseData.sql | ./mssql2sqlite.sh | sqlite3 development.db`
  - If you are using sqlserver, then use your favorite SQL connector to run the insertBaseData.sql file.
1. Re launch the backend server with `./gradlew run`
1. Re launch the frontend server with `./npm run start`

# How to set up Selenium Builds to automatically test workflows
Selenium makes a plug-in for Firefox that lets you record the actions you take on a webpage so that it can rerun them for your later. We use Selenium builds to walk through a series of workflows to see if everything worked as expected, or if something failed. This helps us quickly identify if changes have broken something that we need to fix. Are you super excited to set this up and get testing?! Me too. Here's what you do:

1. Make sure you have Mozilla Firefox installed on your computer
1. Google and download "Selenium IDE" - this is the name of the extension you'll install
1. Install Selenium IDE
1. Once you've installed Selenium, open up Firefox and click on "Tools" on the top menu.
1. Select "Selenium IDE" from the dropdown menu.
1. From there, a window will pop up that allows you to record workflows by selecting the record icon and completing your desired actions
1. To load the existing workflows we have recorded, select "File" and then open from the top menu
1. Our existing builds are saved in client/tests/selenium

# Random Documentation!!

## How to add a new field to an object

1. Create a migration to add it to the database tables
1. Edit the bean object to add the field and getter/setters
1. Edit the Mapper class to map the field when it comes out of the database
1. Edit the Dao class to:
  a. add it to the list of Columns in the *_FIELDS variable for the class. ( ie PersonDao.PERSON_FIELDS)
  b. update any SQL to ensure the value gets INSERTed and UPDATEd correctly.
1. update the bean tests to include having this property and update the src/test/resources/testJson to include the property.
1. Update the resource unit tests to try setting, fetching, and updating the property.

## Map Layers

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
