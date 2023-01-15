# pximg-proxy

[![Deploy on heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[Deploy to Glitch](https://glitch.com/~pximg-proxy)

## Environment variables

- `PROTOCOL`  
  Specify the protocol of example URLs on index page. It may be useful when you are using a HTTPS CDN, for example `https:`.
- `HOST`  
  Specify the host of example URLs on index page. Can contain port number.
- `USER_AGENT`  
  UA used to request Pixiv image. If not provided, the default UA of axios will be used. Normally, it's OK.
- `PIXIV_CLIENT_REFRESH_TOKEN`  
  Due to the limitations of Pixiv, the ajax API is not available now (see [#8](https://github.com/Tsuk1ko/pximg-proxy/issues/8)).  
  So by default this project use [HibiAPI](https://github.com/mixmoe/HibiAPI)'s public API server to get illust data, but you may also get rate limit error.  
  You can provide a Pixiv client refresh token to enable this project to directly request the Pixiv client api. **In this case, it is recommended to deploy the service in a stateful container. It is not recommended to use serverless, otherwise it may affect your pixiv account.**

## Get Pixiv client refresh token

You can use any packet capturing tool to grab from the Pixiv mobile application, or log in using the script provided by this project.

Here is how to use the login script:

1. Node.js is required. Clone this repository.
2. Run `npm i` to install dependencies, then run `npm run pixiv:login` to start the login script.
3. Open the login URL, but don't log in.
4. Open browser developer tools <kbd>F12</kbd>, switch to the "Network" tab.
5. Log in, and finally you will get a blank page.
6. Find the request with the word "login" at the bottom of the network request list.
7. Switch to the "Payload" tab on right panel, then copy the code.
8. Paste back into the command line, press <kbd>Enter</kbd>.
9. The refresh token should be printed.
