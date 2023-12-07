declare module 'pixiv-api-client';

interface PixivApi {
  illustPages: (id: string, language?: string) => Promise<string[]>;
}
