import { createMiddleware } from 'hono/factory';
import { env } from 'hono/adapter';
import type { Context } from 'hono';

export const index = createMiddleware(async c => {
  c.header('cache-control', 'no-cache');
  const { HIDE_INDEX } = env<Env>(c);
  return HIDE_INDEX ? c.text('') : c.html(renderIndex(getBaseUrl(c)));
});

const getBaseUrl = (c: Context) => {
  const url = new URL(c.req.url);
  const { PROTOCOL, HOST } = env<Env>(c);
  if (PROTOCOL) url.protocol = PROTOCOL;
  if (HOST) {
    const [hostname, port = ''] = HOST.split(':');
    url.hostname = hostname;
    url.port = port;
  }
  return url.href.replace(/\/[^/]*?$/, '');
};

const renderIndex = (baseURL: string) => `<html><head><title>Pximg Proxy</title></head><body><pre>Usage:

1. ${baseURL}/{path}
   - ${baseURL}/img-original/img/0000/00/00/00/00/00/12345678_p0.png

2. ${baseURL}/{pid}[/{p}]
   - ${baseURL}/12345678    (p0)
   - ${baseURL}/12345678/0  (p0)
   - ${baseURL}/12345678/1  (p1)

3. ${baseURL}/(original|regular|large|medium|small|thumb|mini)/{pid}[/{p}]
   - ${baseURL}/original/12345678   (same as ${baseURL}/12345678)
   - ${baseURL}/regular/12345678/1  (p1, master1200)</pre></body></html>`;
