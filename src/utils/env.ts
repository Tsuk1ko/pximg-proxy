type Env = Record<
  | 'PORT'
  | 'PROTOCOL'
  | 'HOST'
  | 'USER_AGENT'
  | 'HIDE_INDEX'
  | 'PIXIV_WEB_COOKIE'
  | 'PIXIV_CLIENT_REFRESH_TOKEN'
  | 'PIXIV_CLIENT_REFRESH_TOKEN',
  string | undefined
>;

export const env: Env = process.env as any;
