import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { index } from './middleware';
import { illust } from './middleware/illust';
import { pixivReverseProxy } from './utils/pixiv';

const app = new Hono({ strict: false });

app.use('*', logger());
app.get('/', index);
app.get('/favicon.ico', c => c.notFound());
app.get('/:pid{\\d+}/:p{\\d+}?', illust);
app.get('/:size/:pid{\\d+}/:p{\\d+}?', illust);
app.get('/*', c => pixivReverseProxy(c));

const port = Number(process.env.PORT) || 8080;

console.log(`[${new Date().toLocaleString()}] server is running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
