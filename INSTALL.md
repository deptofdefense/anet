# ANET Installation Documentation

## How to build ANET from Source
ANET must be build in two parts, the client, then the server: 

Linux/Mac:
```
cd client/
npm run build  # Builds the client
cd ../
./gradlew distZip  # Builds the client, server, and all dependencies into a single .zip file 
```

Windows:
```
cd client\
node.exe scripts\build.js  # Builds the client
cd ..\
gradlew.bat distZip  # Builds the client, server, and all dependencies into a single .zip file 
```

This will create a file in `build/distributions/anet.zip` which contains all the necessary files to install ANET. 

## Installation Prerequisites
- Microsoft SQL Server:  Your Database Administrator should be able to provide you with these settings.  Just ask for an empty database. If you have access to your SQL Server directly, the command to create an empty database is `CREATE DATABASE database_name_here` 
	- hostname
	- username / password
	- database name
- SMTP Server
	- hostname
	- username / password (if necessary)
	- TLS settings (yes/no)
- Java JRE (1.8 required)
- Fully Qualified Domain Name of your server. 

- [ADD DETAILS FOR NSSM] 

## Installation Steps
Pick a directory on your server to install ANET to. In that directory: 
1. Unzip anet.zip
2. Add an anet.yml file with appropiate settings.  Descriptions of each of the settings in anet.yml can be found in the README.md file in the ANET repository. 
3. Install Database Scheam: Run `bin/anet.bat db migrate anet.yml`
4. Seed the Database: Run `bin/anet.bat init anet.yml`.
5. Launch the ANET Server: `bin/anet.bat server anet.yml`

# ANET Upgrade Documentation
The steps to upgrade ANET across a minor version change are much simpler: 
- In the `client` directory run `npm run build` to build the ANET client package. 
- run `./gradlew.bat jar` to build the ANET server
- Find `anet.jar` in the `build/libs/` directory. 
## How to Rollback an ANET Upgrade. 

# How to enable SSL
It is recommended that you enable SSL support on ANET.  To do so, follow the Dropwizard Documentation here: http://www.dropwizard.io/1.0.5/docs/manual/core.html#ssl 

# How to Configure a local imagery cache
