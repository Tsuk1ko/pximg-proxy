const Koa = require('koa');
const Router = require('koa-router');
const { pixivReverseProxy } = require('./utils/pixiv');
const indexMiddleware = require('./middleware/index');
const faviconMiddleware = require('./middleware/favicon');
const illustMiddleware = require('./middleware/illust');

const PORT = process.env.PORT || 8080;

const app = new Koa();
const router = new Router();

router
  .get('/', indexMiddleware)
  .get('/favicon.ico', faviconMiddleware)
  .get(/^(?:\/(original|regular|large|medium|small|thumb|mini))?\/(\d+)(?:\/(\d+))?/, illustMiddleware)
  .get(/.*/, ctx => pixivReverseProxy(ctx, ctx.path));

app.use(router.routes()).use(router.allowedMethods()).listen(PORT);

console.log(`Server is running at http://localhost:${PORT}`);
