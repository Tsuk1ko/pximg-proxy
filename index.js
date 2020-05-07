const { get } = require('axios');
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

const pHeaders = {
  Referer: 'https://www.pixiv.net',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36',
};

const reverseProxy = async (ctx, path) => {
  const { data, status, headers } = await get(path, {
    baseURL: 'https://i-cf.pximg.net',
    headers: pHeaders,
    responseType: 'stream',
    validateStatus: () => true,
  });
  ctx.body = data;
  ctx.status = status;
  ['content-type', 'content-length', 'last-modified', 'expires', 'cache-control'].forEach(
    k => headers[k] && ctx.set(k, headers[k])
  );
};

router
  .get('/', ctx => (ctx.body = 'OK'))
  .get('/favicon.ico', ctx => ctx.throw(404))
  .get(/^(?:\/(mini|original|regular|small|thumb))?\/(\d+)(?:\/(\d+))?/, async ctx => {
    const { 0: size = 'original', 1: pid, 2: p = 0 } = ctx.params;
    const {
      data: { error, message, body },
      status,
    } = await get(`https://www.pixiv.net/ajax/illust/${pid}`, {
      headers: pHeaders,
      validateStatus: () => true,
    });
    if (error) {
      ctx.body = message;
      ctx.status = status;
      return;
    }
    const path = new URL(body.urls[size].replace('_p0', `_p${p}`)).pathname;
    const paths = path.split('/');
    const filename = paths[paths.length - 1];
    ctx.set('content-disposition', `filename="${filename}"`);
    return reverseProxy(ctx, path);
  })
  .get(/.*/, ctx => reverseProxy(ctx, ctx.path));

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(process.env.PORT || 8080);
