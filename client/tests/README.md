# Testing setup

# Requirements

## ChromeDriver
Obtain ChromeDriver from [here](https://sites.google.com/a/chromium.org/chromedriver/). Run it with `chromedriver --port=9515 --url-base=wd/hub`

## Intern
After running a fresh `npm install` from the `/anet/client/` directory you should have intern installed.

The configuration lives in `/anet/client/tests/intern.js`. It is currently set to listen to 9515 and only use chrome for functional tests.

Run the _only_ test in `/anet/client/tests/functional/` from `/anet/client/` using `./node_modules/.bin/intern-runner config=tests/intern`. This should open a new session for chrome, run a few basic setup tests, then open ANET. (TODO) Due to the login process and the way Basic Auth is performed, you must enter the name of the user you'd like the test to use. After submitting the basic auth information, the test _should_ create a new report, fill out the fields, and submit it.

## TODO
1. Let the system log in with a user programatically.
2. The current test does not use DOM id's because there are none available for many of the input fields. This makes the test fragile to page changes.
3. Add more tests.
4. Connect to more browsers.
