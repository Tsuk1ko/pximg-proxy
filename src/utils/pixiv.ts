import { PixivAjax } from './pixivAjax';
import { PixivClient } from './pixivClient';
import { last, reverseProxy } from './common';
import { env } from './env';
import type { Context } from 'hono';

export const pixivHeaders: Record<string, string> = {
  referer: 'https://www.pixiv.net',
};
if (env.USER_AGENT) pixivHeaders['user-agent'] = env.USER_AGENT;

export const getPixivErrorMsg = (error: any) =>
  String((typeof error === 'string' ? error : error.user_message || error.message || error.reason) || '');

const isPixivRateLimitError = (error: any) => /rate limit/i.test(getPixivErrorMsg(error));

export const pixivReverseProxy = async (c: Context, url = `https://i.pximg.net${c.req.path}`) => {
  console.log('      > url', url);
  try {
    const res = await reverseProxy(url, pixivHeaders);
    if (res.status === 200) {
      res.headers.set('content-disposition', `filename="${last(url.split('/'))}"`);
    }
    return res;
  } catch (error) {
    c.status(500);
    c.text(String(error));
  }
};

const pixivClients = [
  PixivAjax.getClient(env.PIXIV_WEB_COOKIE),
  PixivClient.getClient(env.PIXIV_CLIENT_REFRESH_TOKEN),
].filter(Boolean);

export const getIllustPages = async (pid: string, { language }: { language?: string } = {}) => {
  if (!pixivClients.length) throw new Error('no available api');
  let error;
  for (const client of pixivClients) {
    try {
      console.log('      > use', client.constructor.name);
      return await client.illustPages(pid, language);
    } catch (e) {
      if (!isPixivRateLimitError(e)) throw e;
      error = e;
    }
  }
  throw error;
};

const convertTable: Record<string, [string, string]> = {
  mini: ['/c/48x48/img-master/', '_square1200'],
  thumb: ['/c/250x250_80_a2/img-master/', '_square1200'],
  small: ['/c/360x360_70/img-master/', '_master1200'],
  medium: ['/c/540x540_70/img-master/', '_master1200'],
  large: ['/c/600x1200_90/img-master/', '_master1200'],
  regular: ['/img-master/', '_master1200'],
};

export const isLegalSize = (size: string) => size === 'original' || size in convertTable;

export const convertPage = (original: string | undefined, size: string) => {
  if (!original) return;
  if (size in convertTable) {
    const [first, second] = convertTable[size];
    return original
      .replace('/img-original/', first)
      .replace(/(?<=_p\d+)/, second)
      .replace(/\.[^.]+$/, '.jpg');
  }
  return original;
};
