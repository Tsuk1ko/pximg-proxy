const { get } = require('axios');
const Koa = require('koa');
const Router = require('koa-router');
const NodeCache = require('node-cache');

const app = new Koa();
const router = new Router();
const illustCache = new NodeCache({ stdTTL: 3600, checkperiod: 60, useClones: false });

const { PROTOCOL } = process.env;
const PORT = process.env.PORT || 8080;

const index = require('./pages/index');

const pHeaders = {
  Referer: 'https://www.pixiv.net',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36',
};

const reverseProxy = async (ctx, path, okCb) => {
  const { data, status, headers } = await get(path, {
    baseURL: 'https://i.pximg.net',
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

const convertPages = pages =>
  pages.map(({ image_urls: { medium, large, original } }) => ({
    mini: large.replace('/600x1200_90/img-master/', '/48x48/custom-thumb/').replace('_master1200.', '_custom1200.'),
    thumb: large
      .replace('/600x1200_90/img-master/', '/250x250_80_a2/custom-thumb/')
      .replace('_master1200.', '_custom1200.'),
    small: large.replace('/600x1200_90/', '/540x540_70/'),
    medium,
    large,
    regular: large.replace('/c/600x1200_90/', '/'),
    original,
  }));

router
  .get('/', ctx => {
    const baseURL = (() => {
      if (PROTOCOL) ctx.URL.protocol = PROTOCOL;
      const paths = ctx.URL.href.split('/');
      paths.pop();
      return paths.join('/');
    })();
    ctx.set('cache-control', 'no-cache');
    ctx.body = index({ baseURL });
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
        ctx.status = 502;
      });
  })
  .get(/^(?:\/(original|regular|large|medium|small|thumb|mini))?\/(\d+)(?:\/(\d+))?/, async ctx => {
    const { 0: size = 'original', 1: pid, 2: p = 0 } = ctx.params;
    let urls = illustCache.get(pid);
    if (!urls) {
      const {
        data: { error, illust },
        status,
      } = await get(`https://api.obfs.dev/api/pixiv/illust?id=${pid}`, {
        headers: pHeaders,
        validateStatus: () => true,
      });
      if (error) {
        ctx.body = error.user_message || error.message || error.reason;
        ctx.status = status;
        ctx.set('cache-control', 'no-cache');
        return;
      }
      const pages = illust.meta_pages.length
        ? illust.meta_pages
        : [{ image_urls: { ...illust.image_urls, original: illust.meta_single_page.original_image_url } }];
      urls = convertPages(pages);
      illustCache.set(pid, urls);
    }
    try {
      const path = new URL(urls[p][size]).pathname;
      const paths = path.split('/');
      const filename = paths[paths.length - 1];
      return reverseProxy(ctx, path, () => ctx.set('content-disposition', `filename="${filename}"`));
    } catch {
      ctx.status = 404;
    }
  })
  .get(/.*/, ctx => reverseProxy(ctx, ctx.path));

app.use(router.routes()).use(router.allowedMethods()).listen(PORT);

console.log(`Server is running at http://localhost:${PORT}`);
