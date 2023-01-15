# pximg-proxy

[![Deploy on heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[Deploy to Glitch](https://glitch.com/~pximg-proxy)

## ENV

- `PROTOCOL` - Specify the protocol of example URLs on index page. It may be useful when you are using a HTTPS CDN, for example `https:`.
- `HOST` - Specify the host of example URLs on index page. Can contain port number.
- `USER_AGENT` - UA used to request Pixiv. If not provided, the default UA of axios will be used.
