# Contributing to this project

Thanks for thinking about using or contributing to this software and its documentation (“Project”)!

## The legal stuff

When you submit a pull request to this repository for the first time, you need to sign a Developer Certificate of Origin ("DCO"). To read and agree to the DCO, visit `Contributors.md`. At a high level, it tells us that you have the right to submit the work you're contributing in your pull requests and says that you consent to us treating the contribution in a way consistent with the license associated with the Project. You can read the license associated with this project in `LICENSE.md`. 

You can submit contributions anonymously or under a pseudonym if you'd like, but we need to be able to reach you at the email address you list when you agree to the DCO. 

It probably goes without saying, but contributions you make to this public Department of Defense repository are completely voluntary. When you submit a pull request, you're offering your contribution without expectation of payment and you expressly waive any future pay claims against the U.S. Federal government related to your contribution. 

## The technical stuff

- Work in a branch
- Checkstyle `./gradlew check`
- JS Lint `cd client; npm run lint` 
- Backend Unit Tests `export DB_DRIVER='sqlserver'; ./gradlew test`
- Frontend Integration Tests `cd client; npm run test`
- A Good Commit Message
