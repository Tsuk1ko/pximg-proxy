const { get } = require('axios').default;

const { USER_AGENT } = process.env;

const pixivHeaders = {
  Referer: 'https://www.pixiv.net',
};
if (USER_AGENT) pixivHeaders['User-Agent'] = USER_AGENT;

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

/**
 * @param {string} pid
 * @param {{ acceptLanguage?: string }} [param1]
 */
const getIllustInfo = async (pid, { acceptLanguage } = {}) => {
  try {
    const config = acceptLanguage ? { headers: { 'Accept-Language': acceptLanguage } } : undefined;
    const { data } = await get(`https://api.obfs.dev/api/pixiv/illust?id=${pid}`, config);
    return data;
  } catch (err) {
    if (err.response) {
      throw err.response.data;
    } else {
      throw err.message;
    }
  }
};

module.exports = { pixivHeaders, pixivReverseProxy, getIllustInfo };
