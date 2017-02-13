Here are the results of Nick's attempt to follow the setup instructions in a locked-down environment.

# EOP PC
1. Can't install Eclipse, NodeJS, or git.
1. Can't open `cmd`.

# IRS PC
## Download open source software
1. I can't download Eclipse, because the firewall blocks various downloads. I could file a request for it, but I'll just move ahead with Notepad for now. This is one of the images that the IRS displays when it blocks access to a site:
  ![IRS employee blocking access](https://cloud.githubusercontent.com/assets/829827/22891588/e0461926-f1dd-11e6-905b-3721f462c0b1.png)
1. I can't get NodeJS 7. I can use 4. That will probably bork webpack.
1. Git is generally forbidden at the IRS, for the sake of preserving our relationship with IBM, who sells us an alternative centralized version control system.

## Download ANET source code
No git, but I can easily download the zip from Github.

## Set Up Gradle, Eclipse and NPM
`./gradlew eclipse` fails:

```
C:\anet-master>.\gradlew eclipseDownloading https://services.gradle.org/distributions/gradle-3.1-bin.zipException in thread "main" java.net.ConnectException: Connection timed out: connect        
at java.net.DualStackPlainSocketImpl.connect0(Native Method)        
at java.net.DualStackPlainSocketImpl.socketConnect(DualStackPlainSocketImpl.java:79)        
at java.net.AbstractPlainSocketImpl.doConnect(AbstractPlainSocketImpl.java:345)        
at java.net.AbstractPlainSocketImpl.connectToAddress(AbstractPlainSocketImpl.java:206)        
at java.net.AbstractPlainSocketImpl.connect(AbstractPlainSocketImpl.java:188)        
at java.net.PlainSocketImpl.connect(PlainSocketImpl.java:172)        
at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:392)        at java.net.Socket.connect(Socket.java:589)        at sun.security.ssl.SSLSocketImpl.connect(SSLSocketImpl.java:656)        at sun.security.ssl.BaseSSLSocketImpl.connect(BaseSSLSocketImpl.java:173)        at sun.net.NetworkClient.doConnect(NetworkClient.java:180)        at sun.net.www.http.HttpClient.openServer(HttpClient.java:432)        at sun.net.www.http.HttpClient.openServer(HttpClient.java:527)        at sun.net.www.protocol.https.HttpsClient.<init>(HttpsClient.java:275)        at sun.net.www.protocol.https.HttpsClient.New(HttpsClient.java:371)        at sun.net.www.protocol.https.AbstractDelegateHttpsURLConnection.getNewHttpClient(AbstractDelegateHttpsURLConnection.java:191)        at sun.net.www.protocol.http.HttpURLConnection.plainConnect0(HttpURLConnection.java:1104)        at sun.net.www.protocol.http.HttpURLConnection.plainConnect(HttpURLConnection.java:998)        at sun.net.www.protocol.https.AbstractDelegateHttpsURLConnection.connect(AbstractDelegateHttpsURLConnection.java:177)        at sun.net.www.protocol.http.HttpURLConnection.getInputStream0(HttpURLConnection.java:1512)        at sun.net.www.protocol.http.HttpURLConnection.getInputStream(HttpURLConnection.java:1440)        at sun.net.www.protocol.https.HttpsURLConnectionImpl.getInputStream(HttpsURLConnectionImpl.java:254)        at org.gradle.wrapper.Download.downloadInternal(Download.java:58)        at org.gradle.wrapper.Download.download(Download.java:44)        at org.gradle.wrapper.Install$1.call(Install.java:61)        at org.gradle.wrapper.Install$1.call(Install.java:48)        at org.gradle.wrapper.ExclusiveFileAccessManager.access(ExclusiveFileAccessManager.java:65)        at org.gradle.wrapper.Install.createDist(Install.java:48)        at org.gradle.wrapper.WrapperExecutor.execute(WrapperExecutor.java:128)        at org.gradle.wrapper.GradleWrapperMain.main(GradleWrapperMain.java:61)
```

`npm install` in `client/` also fails:

```
C:\anet-master\client>npm -v2.14.2C:\anet-master\client>node -v
v4.0.0

C:\anet-master\client>npm install
npm Err! git clone --template=C:\Users\K2JRB\AppData\Roaming\npm-cache\_git-remtes\_templates --mirror git@github.com:nickjs/react-bootstrap-date-picker.git C\Users\K2JRB\AppData\Roaming\npm-cache\_git-remotes\git-github-com-nickjs-reactbootstrap-date-picker-git-b05173a5: undefined
npm Err! git clone --template=C:\Users\K2JRB\AppData\Roaming\npm-cache\_git-remtes\_templates --mirror git@github.com:nickjs/react-bootstrap-date-picker.git C\Users\K2JRB\AppData\Roaming\npm-cache\_git-remotes\git-github-com-nickjs-reactbootstrap-date-picker-git-b05173a5: undefined
npm Err! git clone --template=C:\Users\K2JRB\AppData\Roaming\npm-cache\_git-remtes\_templates --mirror git@github.com:kolodny/immutability-helper.git C:\UsersK2JRB\AppData\Roaming\npm-cache\_git-remotes\git-github-com-kolodny-immutabilit-helper-git-30f5455a: undefined
npm Err! git clone --template=C:\Users\K2JRB\AppData\Roaming\npm-cache\_git-remtes\_templates --mirror git@github.com:kolodny/immutability-helper.git C:\UsersK2JRB\AppData\Roaming\npm-cache\_git-remotes\git-github-com-kolodny-immutabilit-helper-git-30f5455a: undefined
npm Err! fetch failed https://registry.npmjs.org/babel-core/-/babel-core-6.17.0tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/autoprefixer/-/autoprefixer-6..1.tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/gzip-size/-/gzip-size-3.0.0.tgnpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/css-loader/-/css-loader-0.25.0tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/eslint/-/eslint-3.8.1.tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/babel-core/-/babel-core-6.17.0tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/autoprefixer/-/autoprefixer-6..1.tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/eslint/-/eslint-3.8.1.tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/gzip-size/-/gzip-size-3.0.0.tgnpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error
npm Err! fetch failed https://registry.npmjs.org/css-loader/-/css-loader-0.25.0tgznpm WARN retry will retry, error on last attempt: Error: tunneling socket couldnot be established, cause=Parse Error^CTerminate batch job (Y/N)? y
```

Running this command actually locked me out, preventing me from accessing any other web pages. I tried to fix this by restarting my machine, but the lockout prevented me from logging in to the machine itself.
