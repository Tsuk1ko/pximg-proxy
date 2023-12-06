import Axios from 'axios';
import { PixivAjax } from './pixivAjax';
import { PixivClient } from './pixivClient';
import type { Context } from 'hono';

const { USER_AGENT } = process.env;

const last = <T>(array: T[]) => array[array.length - 1];

export const pixivHeaders: Record<string, string> = {
  Referer: 'https://www.pixiv.net',
};
if (USER_AGENT) pixivHeaders['User-Agent'] = USER_AGENT;

export const getPixivErrorMsg = (error: any) =>
  String((typeof error === 'string' ? error : error.user_message || error.message || error.reason) || '');

const isPixivRateLimitError = (error: any) => /rate limit/i.test(getPixivErrorMsg(error));

export const pixivReverseProxy = async (c: Context, url: string) => {
  console.log('url: ', url);
  const { data, status, headers } = await Axios.get(url, {
    headers: pixivHeaders,
    responseType: 'stream',
    validateStatus: () => true,
  });
  c.status(status);
  ['content-type', 'content-length'].forEach(k => headers[k] && c.header(k, headers[k]));
  if (status === 200) {
    ['last-modified', 'expires', 'cache-control'].forEach(k => headers[k] && c.header(k, headers[k]));
    c.header('content-disposition', `filename="${last(url.split('/'))}"`);
    return c.body(data);
  } else {
    c.header('cache-control', 'max-age=3600');
    return c.notFound();
  }
};

const pixivClients = [
  PixivAjax.getClient(process.env.PIXIV_WEB_COOKIE),
  PixivClient.getClient(process.env.PIXIV_CLIENT_REFRESH_TOKEN),
].filter(Boolean);

export const getIllustPages = async (pid: string, { language }: { language?: string } = {}) => {
  if (!pixivClients.length) throw new Error('no available api');
  let error;
  for (const client of pixivClients) {
    try {
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
