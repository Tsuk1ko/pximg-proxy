import PixivApi from 'pixiv-api-client';
import AwaitLock from 'await-lock';

export interface PixivClientIllust {
  id: number;
  title: string;
  user: {
    id: number;
    name: string;
  };
  tags: Array<{
    name: string;
    translated_name: string | null;
  }>;
  create_date: string;
  width: number;
  height: number;
  meta_single_page: { original_image_url: string };
  meta_pages: Array<{
    image_urls: Record<'square_medium' | 'medium' | 'large' | 'original', string>;
  }>;
  illust_ai_type: number;
}

const loginLock = new AwaitLock();

export class PixivClient {
  private readonly api = new PixivApi();
  private expireTime = 0;

  public constructor(private readonly refreshToken: string) {}

  private get loginExpired() {
    return Date.now() / 1000 > this.expireTime - 60;
  }

  public static getClient(token?: string) {
    return token ? new PixivClient(token) : null;
  }

  public async illustDetail(id: string, language?: string): Promise<PixivClientIllust> {
    await this.login();
    if (language) this.api.setLanguage(language);
    try {
      const { illust } = await this.api.illustDetail(id);
      if (!illust.title || !illust.user.name) {
        throw new Error('unexpected illust result');
      }
      return illust;
    } catch (error: any) {
      throw error.error || error;
    }
  }

  public async illustPages(id: string, language?: string) {
    const illust = await this.illustDetail(id, language);
    if (illust.meta_pages.length) {
      return illust.meta_pages.map(p => p.image_urls.original);
    }
    return [illust.meta_single_page.original_image_url];
  }

  private async login() {
    if (!this.loginExpired) return;
    await loginLock.acquireAsync();
    if (!this.loginExpired) {
      loginLock.release();
      return;
    }
    try {
      const { expires_in: expiresIn } = await this.api.refreshAccessToken(this.refreshToken);
      this.expireTime = Date.now() / 1000 + expiresIn;
    } finally {
      loginLock.release();
    }
  }
}
