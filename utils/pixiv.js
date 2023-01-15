const { get } = require('axios').default;
const PixivClient = require('./pixivClient');

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

const pixivClient = new PixivClient(process.env.PIXIV_CLIENT_REFRESH_TOKEN);

/**
 * @param {string} pid
 * @param {{ language?: string }} [param]
 */
const getIllustInfo = async (pid, { language } = {}) => {
  if (pixivClient.available) {
    console.log('use client');
    return pixivClient.illustDetail(pid, language);
  }

  try {
    console.log('use api');
    const config = language ? { headers: { 'Accept-Language': language } } : undefined;
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
