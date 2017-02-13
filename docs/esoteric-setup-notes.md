Here are the results of my attempt to follow the setup instructions in a locked-down environment.

# IRS PC
## Download open source software
1. I can't download Eclipse, because the firewall blocks various downloads. I could file a request for it, but I'll just move ahead with Notepad for now.
1. I can't get NodeJS 7. I can use 4. That will probably bork webpack.
1. Git is generally forbidden at the IRS, for the sake of preserving our relationship with IBM, who sells us an alternative centralized version control system.

## Download ANET source code
No git, but I can easily download the zip from Github.

## Set Up Gradle, Eclipse and NPM
`./gradlew eclipse` fails:
