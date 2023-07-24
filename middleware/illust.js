const NodeCache = require('node-cache');
const { pixivReverseProxy, getIllustPages, convertPage, getPixivErrorMsg } = require('../utils/pixiv');

const illustCache = new NodeCache({ stdTTL: 3600, checkperiod: 60, useClones: false });

/**
 * @type {import('koa-router').IMiddleware}
 */
module.exports = async ctx => {
  const { 0: size = 'original', 1: pid, 2: p = 0 } = ctx.params;
  let urls = illustCache.get(pid);

  if (!urls) {
    try {
      urls = await getIllustPages(pid, { language: ctx.headers['accept-language'] });
      illustCache.set(pid, urls);
    } catch (error) {
      ctx.body = getPixivErrorMsg(error);
      ctx.status = 502;
      ctx.set('cache-control', 'no-cache');
      return;
    }
  }

  try {
    if (!urls[p]) {
      ctx.status = 404;
      return;
    }
    const path = new URL(convertPage(urls[p], size)).pathname;
    const paths = path.split('/');
    const filename = paths[paths.length - 1];
    return pixivReverseProxy(ctx, path, () => ctx.set('content-disposition', `filename="${filename}"`));
  } catch {
    ctx.status = 404;
  }
};
