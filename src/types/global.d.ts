declare module 'pixiv-api-client';

type Env = Record<
  | 'PROTOCOL'
  | 'HOST'
  | 'USER_AGENT'
  | 'HIDE_INDEX'
  | 'PIXIV_WEB_COOKIE'
  | 'PIXIV_CLIENT_REFRESH_TOKEN'
  | 'PIXIV_CLIENT_REFRESH_TOKEN',
  string | undefined
>;
