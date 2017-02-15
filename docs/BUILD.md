# How to build ANET from Source

ANET must be build in two parts, the client, then the server.  This document assumes you have a complete development environment set up and working.  You should always run all tests before generating a build!

Linux/Mac:
```
./gradlew check # Runs checkstyle test and unit tests
cd client/
npm run build  # Builds the client
cd ../
./gradlew distZip  # Builds the client, server, and all dependencies into a single .zip file 
```

Windows:
```
./gradlew check # Runs checkstyle test and unit tests
cd client\
node.exe scripts\build.js  # Builds the client
cd ..\
gradlew.bat distZip  # Builds the client, server, and all dependencies into a single .zip file 
```

This will create a file in `build/distributions/anet-<version>.zip` which contains all the necessary files to install ANET. 

