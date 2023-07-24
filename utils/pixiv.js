const { get } = require('axios').default;
const PixivAjax = require('./PixivAjax');
const PixivClient = require('./PixivClient');

const { USER_AGENT } = process.env;

const pixivHeaders = {
  Referer: 'https://www.pixiv.net',
};
if (USER_AGENT) pixivHeaders['User-Agent'] = USER_AGENT;

const getPixivErrorMsg = error =>
  String((typeof error === 'string' ? error : error.user_message || error.message || error.reason) || '');

const isPixivRateLimitError = error => /rate limit/i.test(getPixivErrorMsg(error));

/**
 *
 * @param {Parameters<import('koa-router').IMiddleware>['0']} ctx
 * @param {string} path
 * @param {Function} [okCb]
 */
const pixivReverseProxy = async (ctx, path, okCb) => {
  const { data, status, headers } = await get(path, {
    baseURL: 'https://i.pximg.net',
    headers: pixivHeaders,
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

const pixivClients = [
  PixivAjax.getClient(process.env.PIXIV_WEB_COOKIE),
  PixivClient.getClient(process.env.PIXIV_CLIENT_REFRESH_TOKEN),
].filter(Boolean);

/**
 * @param {string} pid
 * @param {{ language?: string }} [param]
 */
const getIllustPages = async (pid, { language } = {}) => {
  if (!pixivClients.length) throw new Error('no available api');
  let error;
  for (const client of pixivClients) {
    try {
      return client.illustPages(pid, language);
    } catch (e) {
      if (!isPixivRateLimitError(e)) throw e;
      error = e;
    }
  }
  throw error;
};

const convertTable = {
  mini: ['/c/48x48/img-master/', '_square1200'],
  thumb: ['/c/250x250_80_a2/img-master/', '_square1200'],
  small: ['/c/360x360_70/img-master/', '_master1200'],
  medium: ['/c/540x540_70/img-master/', '_master1200'],
  large: ['/c/600x1200_90/img-master/', '_master1200'],
  regular: ['/img-master/', '_master1200'],
};

/**
 * @param {string} original
 * @param {string} size
 */
const convertPage = (original, size) => {
  if (size in convertTable) {
    const [first, second] = convertTable[size];
    return original.replace('/img-original/', first).replace(/(?<=_p\d+)/, second);
  }
  return original;
};

module.exports = {
  pixivHeaders,
  pixivReverseProxy,
  getIllustPages,
  convertPage,
  getPixivErrorMsg,
};
