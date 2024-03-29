import { env } from './env';
import { autoFetch } from './common';
import type { PixivApi } from './common';

export interface PixivAjaxIllust {
  illustId: string;
  illustTitle: string;
  userId: string;
  userName: string;
  tags: {
    tags: Array<{
      tag: string;
      translation?: Record<string, string>;
    }>;
  };
  width: number;
  height: number;
  pageCount: number;
  urls: Record<'mini' | 'thumb' | 'small' | 'regular' | 'original', string>;
  aiType: number;
}

export type PixivAjaxIllustPages = Array<{
  urls: Record<'thumb_mini' | 'small' | 'regular' | 'original', string>;
  width: number;
  height: number;
}>;

export class PixivAjax implements PixivApi {
  public constructor(private readonly cookie: string) {}

  public static getClient(cookie?: string) {
    return cookie ? new PixivAjax(cookie) : null;
  }

  public async illustPages(id: string, language?: string) {
    const illust = await this.illustDetail(id, language);
    if (illust.pageCount > 1) {
      const pages = await this.illustDetailPages(id, language);
      return pages.map(p => p.urls.original);
    }
    return [illust.urls.original];
  }

  private async illustDetail(id: string, language?: string): Promise<PixivAjaxIllust> {
    const data = await autoFetch(`https://www.pixiv.net/ajax/illust/${id}`, {
      headers: this.getHeaders(language),
    });
    if (typeof data !== 'object') throw data;
    if (data.error) throw data.message;
    return data.body;
  }

  private getHeaders(language?: string) {
    const headers: Record<string, string> = { Cookie: this.cookie };
    if (language) headers['Accept-Language'] = language;
    if (env.USER_AGENT) headers['User-Agent'] = env.USER_AGENT;
    return headers;
  }

  private async illustDetailPages(id: string, language?: string): Promise<PixivAjaxIllustPages> {
    const data = await autoFetch(`https://www.pixiv.net/ajax/illust/${id}/pages`, {
      headers: this.getHeaders(language),
    });
    if (typeof data !== 'object') throw data;
    if (data.error) throw data.message;
    return data.body;
  }
}
