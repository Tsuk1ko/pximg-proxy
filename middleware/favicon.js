const { get } = require('axios').default;
const { pixivHeaders } = require('../utils/pixiv');

/**
 * @type {import('koa-router').IMiddleware}
 */
module.exports = async ctx => {
  try {
    const { data, status, headers } = await get('https://www.pixiv.net/favicon.ico', {
      headers: pixivHeaders,
      responseType: 'stream',
    });

    ctx.body = data;
    ctx.status = status;
    ctx.set('cache-control', 'max-age=604800');
    ['content-length', 'content-type', 'last-modified'].forEach(k => headers[k] && ctx.set(k, headers[k]));
  } catch (error) {
    ctx.status = 502;
  }
};
