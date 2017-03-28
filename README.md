## What is ANET?

The Advisor Network ("ANET") is a tool to track relationships between advisors and advisees. ANET was built by the Defense Digital Service in support of the the USFOR-A and Resolute Support mission to train, advise, and assist the Afghan government. 

Although this tool was built in a very specific context, ANET has many potential applications. At its core, ANET is a way of tracking  reports and tying them to authors, organizations, and goals. It also simplifies relationships between members of an organization, and members of different organizations -- like NATO and the Afghan government. 

In making this software available to the open source community, it is our hope that other groups are able to use ANET to meet their needs. We would also welcome contributions that help improve functionality, add features, and mature this work. 


## Setting up your development environment
This repository is structured in two main, disparate components: the frontend and the backend. The frontend is a react.js based JavaScript application that communicates with the backend via XMLHttpRequest (ajax). The backend is a Java application based the Dropwizard framework that runs on a JVM and utilizes Microsoft SQL Server for its database.


We recommend reading through the documentation in the following order:

1. [Getting your Development Environment Set Up](./docs/dev-setup.md)
1. [Working on the backend](./docs/backend-overview.md)
1. [Working on the frontend](./docs/frontend-overview.md)
1. See [DOCUMENTATION.md](./docs/DOCUMENTATION.md) and [INSTALL.md](./docs/INSTALL.md) for additional information.
1. See [User Workflows](./docs/User_Workflows_and_Documentation.md) for details on user workflows. 


## Contributing
We welcome contributions to this repository. If you are interested in contributing to this project, please review CONTRIBUTING.md and LICENSE.md so that you're aware of what it means, and how, to contribute to a work by the U.S. Department of Defense.
