# ANET Installation Documentation

## Scope
This document covers the steps required to deploy ANET to a server environment.  

## Environment

- **Hardware**: ANET does not have specific required hardware. Hardware recommendations are:
	- 1x Windows Application Server (300GB HDD, 64 GB RAM, 8x CPU Cores)
	- 1x Microsoft SQL Server (2014 or greater) Database Server. 
- **Software**: Software requirements: 
	- Java JRE 1.8 installed on the Application Server
	- Administration Privileges to run processes on restricted ports (80/443)
	- Optional: A valid SSL certificate for the domain name of the application server. 
	- Microsoft SQL Server 2014 or greater. 
	- Users are required to have a modern web browser (Mozilla Firefox, Google Chrome, or IE version 11 or greater)
- **Network Accessibility**
	- Users will acccess the Application Server over HTTP/HTTPS (80/443)
	- The Application Server will access the SQL Server over port 1433 (or whatever port you have SQL configured to)
	- The Application Server will need to access an Active Directory server for authentication
	- The Application Server will need to access an SMTP server for email sending. 


## Installation Prerequisites

There is no software to install on client computers, only a modern web browser (Mozilla Firefox, Google Chrome, or Microsoft IE Version 11 or greater) is required. 

You should have the following information on hand for the installation:
- A Build of ANET. This comes in the form of a `.zip` file. See BUILD.md for details on how to create this file. 
- Microsoft SQL Server:  Your Database Administrator should be able to provide you with these settings.  Just ask for an empty database. If you have access to your SQL Server directly, the command to create an empty database is `CREATE DATABASE database_name_here` 
	- hostname
	- username / password
	- database name
- SMTP Server
	- hostname
	- username / password (if necessary)
	- TLS settings (yes/no)
- Fully Qualified Domain Name of your server. 
- Information about who will Administer your ANET instance. 

## Server Installation Procedures
Pick a directory on your server to install ANET to. In that directory: 

1. Unzip anet.zip. You'll find three folders
  1. _bin_: This contains the startup scripts to start/stop the ANET server. 
  2. _lib_: This contains all of the dependencies and compiled resources. All of the ANET specific files are bundled in `lib/anet.jar`.
  3. _docs_: This is a copy of the docs folder from the git repository, so you'll have a copy of these docuemnts during installation!
2. Add an anet.yml file with appropiate settings.  Descriptions of each of the settings in anet.yml can be found in the README.md file in the ANET repository. You can find a template of anet.yml file in the `docs` folder.  
3. Verify that your configuration file is valid with `bin/anet.bat check anet.yml`
4. Install Database Schema: Run `bin/anet.bat db migrate anet.yml`
5. Seed the Database: Run `bin/anet.bat init anet.yml`.  This will ask you the following questions:
  1. _Classification String_: This is the message that will appear in the top security banner on the screen. For demo instances you should use `FOR DEMO USE ONLY`. 
  1. _Classification Color_ : This is the color of the top security banner on the screen. For demo instances you should use `green`. 
  1. _Name of Administrator Organization_: This is the name of the Organization that will be created for the Administrator.  We recommend using something like `ANET Administrators`.
  1. _Name of Administrator Position_: This is the name of the position that will be created for the Administrator.  We recommend `ANET Administrator`.
  1. _Your Name_: This is the name that will be given to the ANET Administrator, who you presumabely are. 
  1. _Your Domain Username_: This is the domain username that will be set on the ANET Administrator (who you presumabely are).  For production situations this will be your windows domain username.   If you get this wrong here, when you first log in to ANET it will create a new user for you. You can either run this database init command again, or do manual SQL commands to fix the `people` table.
6. Launch the ANET Server: `bin/anet.bat server anet.yml`

# ANET Upgrade Documentation
The steps to upgrade ANET across a minor version change are much simpler: 
To build the new anet.jar: 
- In the `client` directory run `npm run build` to build the ANET client package. 
- run `./gradlew.bat jar` to build the ANET server
- Find `anet.jar` in the `build/libs/` directory. 

On the ANET server: 
- Stop the `anet.bat server` process. 
- Take a complete backup of your SQL Database
- Backup the `anet.jar` file from the libs/ directory. 
- Copy the new `anet.jar` file into the libs/ directory. 
- Make any required changes or upgrades to your `anet.yml` file. 
- If Database Migrations are required, run `bin/anet.bat db migrate anet.yml` to migrate your database. 
- Start the server with `anet.bat server anet.yml`
- Run through verification testing to ensure there are no issues. 

# How to Rollback an ANET Upgrade. 

# How to enable SSL
It is recommended that you enable SSL support on ANET.  To do so, follow the Dropwizard Documentation here: http://www.dropwizard.io/1.0.5/docs/manual/core.html#ssl 

# How to configure imagery.

ANET uses Leaflet as a map viewer.  You can use any tile sources that work with Leaflet in ANET. In a development environment, or anywhere with access to the internet, you can configure ANET to use OSM tiles by setting the `MAP_LAYERS` Admin Setting to 

```
[{"name":"OSM","default" : true, "url":"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "type":"osm"}]
```

For offline deployments of ANET, you can configure a local imagery cache with a downloaded tile set.  Your offline imagery set should be in the form of `{z}/{x}/{y}.png` or similar.  If you download tiles from OpenStreetMaps, this is the format you'll get them in. 

1. In the ANET home directory (the same directory as `bin`, `lib` and `docs`) create a directory called `maps`. Inside that, create a directory called `imagery`. 
1. Copy your imagery set into the `imagery` directory.  You should end up with a file structure that looks like `maps/imagery/{0,1,2,...}/{0,1,2...}/{0,1,2,3...}.png`
1. Edit the `bin/anet.bat` (Windows), or `bin/anet` (Linux/Mac) file. Find the line that sets the `CLASSPATH` variable. (It's really long and lists a bunch of .jar files).  Right after that line, add the line: 

Windows (bin/anet.bat):
```
set CLASSPATH=%APP_HOME%\maps\;%CLASSPATH%

```
Linux/Mac (bin/anet): 
```
CLASSPATH=$APP_HOME/maps/:$CLASSPATH
```

This will put the imagery folder on the server's classpath.  ANET looks for a folder called imagery and will serve those tiles up on the `/imagery` path. 
1. To use this new tile source, set the `MAP_LAYERS` admin setting to 
```
[{"name":"OSM","default" : true, "url":"http://<your-anet-server-url>/imagery/{z}/{x}/{y}.png", "type":"osm"}]
```

Maps should now magically work!  You can test this by going to the url `http://<your-anet-server>/imagery/0/0/0.png` and hopefully seeing a tile appear. 
