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

const reverseProxy = async (ctx, path, okCb) => {
  const { data, status, headers } = await get(path, {
    baseURL: 'https://i-cf.pximg.net',
    headers: pHeaders,
    responseType: 'stream',
    validateStatus: () => true,
  });
  ctx.status = status;
  ['content-type', 'content-length'].forEach(k => headers[k] && ctx.set(k, headers[k]));
  if (status == 200) {
    ctx.body = data;
    ['last-modified', 'expires', 'cache-control'].forEach(k => headers[k] && ctx.set(k, headers[k]));
    if (typeof okCb === 'function') okCb();
  } else ctx.set('cache-control', 'max-age=3600');
};

router
  .get('/', ctx => {
    const baseURL = (() => {
      const paths = ctx.URL.href.split('/');
      paths.pop();
      return paths.join('/');
    })();
    ctx.set('cache-control', 'max-age=3600');
    ctx.body = `Usage:

1. ${baseURL}/{path}
   - ${baseURL}/img-original/img/0000/00/00/00/00/00/12345678_p0.png

2. ${baseURL}/{pid}[/{p}]
   - ${baseURL}/12345678    (p0)
   - ${baseURL}/12345678/0  (p0)
   - ${baseURL}/12345678/1  (p1)

3. ${baseURL}/(original|regular|small|thumb|mini)/{pid}[/{p}]
   - ${baseURL}/original/12345678   (same as ${baseURL}/12345678)
   - ${baseURL}/regular/12345678/1  (p1, master1200)
`;
  })
  .get('/favicon.ico', ctx => {
    return get('https://www.pixiv.net/favicon.ico', {
      headers: pHeaders,
      responseType: 'stream',
    })
      .then(({ data, status, headers }) => {
        ctx.body = data;
        ctx.status = status;
        ctx.set('cache-control', 'max-age=604800');
        ['content-length', 'content-type', 'last-modified'].forEach(k => headers[k] && ctx.set(k, headers[k]));
      })
      .catch(() => {
        ctx.status = 404;
      });
  })
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
      ctx.set('cache-control', 'no-cache');
      return;
    }
    const path = new URL(body.urls[size].replace('_p0', `_p${p}`)).pathname;
    const paths = path.split('/');
    const filename = paths[paths.length - 1];
    return reverseProxy(ctx, path, () => ctx.set('content-disposition', `filename="${filename}"`));
  })
  .get(/.*/, ctx => reverseProxy(ctx, ctx.path));

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(process.env.PORT || 8080);
