const index = require('../pages/index');

const { PROTOCOL, HOST } = process.env;

/**
 * @type {import('koa-router').IMiddleware}
 */
module.exports = ctx => {
  const baseURL = (() => {
    const url = new URL(ctx.URL.href);
    if (PROTOCOL) url.protocol = PROTOCOL;
    if (HOST) {
      const [hostname, port = ''] = HOST.split(':');
      url.hostname = hostname;
      url.port = port;
    }
    return url.href.replace(/\/[^/]*?$/, '');
  })();

  ctx.set('cache-control', 'no-cache');
  ctx.body = index({ baseURL });
};
