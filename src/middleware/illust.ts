import { createMiddleware } from 'hono/factory';
import NodeCache from 'node-cache';
import { convertPage, getIllustPages, getPixivErrorMsg, isLegalSize, pixivReverseProxy } from '../utils/pixiv';
import type { Context } from 'hono';

const illustCache = new NodeCache({ stdTTL: 3600, checkperiod: 60, useClones: false });

export const illust = createMiddleware(async (c: Context<any, '/:size?/:pid/:p?'>) => {
  const { size = 'original', pid, p = '0' } = c.req.param();

  if (!isLegalSize(size)) return c.notFound();

  let urls = illustCache.get<string[]>(pid);

  if (!urls) {
    try {
      urls = await getIllustPages(pid, { language: c.req.header('accept-language') });
      illustCache.set(pid, urls);
    } catch (error) {
      c.status(502);
      c.header('cache-control', 'no-cache');
      return c.text(getPixivErrorMsg(error));
    }
  }

  try {
    const url = convertPage(urls[Number(p)], size);
    if (!url) return c.notFound();
    return await pixivReverseProxy(c, url);
  } catch {
    return c.notFound();
  }
});
