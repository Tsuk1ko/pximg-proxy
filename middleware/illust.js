const NodeCache = require('node-cache');
const { pixivReverseProxy, getIllustInfo } = require('../utils/pixiv');

const illustCache = new NodeCache({ stdTTL: 3600, checkperiod: 60, useClones: false });

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

/**
 * @type {import('koa-router').IMiddleware}
 */
module.exports = async ctx => {
  const { 0: size = 'original', 1: pid, 2: p = 0 } = ctx.params;
  let urls = illustCache.get(pid);

  if (!urls) {
    const { error, illust } = await getIllustInfo(pid, {
      language: ctx.headers['accept-language'],
    }).catch(error => ({ error }));

    if (error) {
      ctx.body = typeof error === 'string' ? error : error.user_message || error.message || error.reason;
      ctx.status = 502;
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
    return pixivReverseProxy(ctx, path, () => ctx.set('content-disposition', `filename="${filename}"`));
  } catch {
    ctx.status = 404;
  }
};
