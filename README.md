# pximg-proxy

## Requirement

Node >= 18 or Bun

In theory, the entry `src/app.ts` can be used to deploy to various serverless platforms but may need some changes. See Hono's [document](https://hono.dev/getting-started/cloudflare-workers).

## Environment variables

- `PORT`
  Optional. Default is `8080`.
- `PROTOCOL`  
  Optional. Specify the protocol of example URLs on index page. It may be useful when you are using a HTTPS CDN, for example `https:`.
- `HOST`  
  Optional. Specify the host of example URLs on index page. Can contain port number.
- `USER_AGENT`  
  Optional. User-Agent header for Pixiv request. If not provided, the default UA of fetch will be used. Normally, it's OK.
- `HIDE_INDEX`  
  Optional. If you don't want to show a usage help on index, set this to any non-null value.
- `PIXIV_WEB_COOKIE`  
  Pixiv website cookie, only the PHPSESSID is required. **At least one of `PIXIV_WEB_COOKIE` and `PIXIV_CLIENT_REFRESH_TOKEN` need to be set.**
- `PIXIV_CLIENT_REFRESH_TOKEN`  
  You can provide a Pixiv client refresh token to allow it to access the Pixiv client api. **In this case, it is recommended to deploy the service in a stateful container. It is not recommended to deploy in serverless, otherwise it may affect your pixiv account.**

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
