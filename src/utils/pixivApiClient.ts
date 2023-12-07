/**
 * Code comes from https://github.com/alphasp/pixiv-api-client
 */

import md5 from 'blueimp-md5';
import { stringify } from 'qs';
import { isJsonResp } from './common';

const BASE_URL = 'https://app-api.pixiv.net';
const CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT';
const CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj';
const HASH_SECRET = '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c';

export class PixivApiClient {
  private auth?: Record<string, any>;

  private readonly headers = {
    'App-OS': 'android',
    'App-OS-Version': '9.0',
    'App-Version': '5.0.234',
    'User-Agent': 'PixivAndroidApp/5.0.234  (Android 9.0; Pixel 3)',
  };

  public async refreshAccessToken(refreshToken: string = this.auth?.refresh_token) {
    if (!refreshToken) throw new Error('refresh_token required');
    const body = stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      get_secure_url: true,
      include_policy: true,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const data = await callApi('https://oauth.secure.pixiv.net/auth/token', {
      method: 'POST',
      headers: {
        ...this.getDefaultHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    this.auth = data.response;
    return data;
  }

  public illustDetail(id: string | number, language?: string) {
    if (!id) throw new Error('illust_id required');
    const queryString = stringify({ illust_id: id });
    return this.requestUrl(`/v1/illust/detail?${queryString}`, undefined, language);
  }

  private getDefaultHeaders(language: string = 'en-us') {
    const datetime = new Date().toISOString();
    return {
      ...this.headers,
      'Accept-Language': language,
      'X-Client-Time': datetime,
      'X-Client-Hash': md5(`${datetime}${HASH_SECRET}`),
    };
  }

  private requestUrl(url: string, options?: RequestInit, language?: string) {
    if (!url) throw new Error('Url cannot be empty');
    options = options || {};
    const headers: Record<string, string> = {
      ...this.getDefaultHeaders(language),
      ...(options.headers as any),
    };
    options.headers = headers;
    if (this.auth?.access_token) {
      headers.Authorization = `Bearer ${this.auth.access_token}`;
    }
    return callApi(url, options);
  }
}

async function callApi(url: string, options?: RequestInit): Promise<any> {
  try {
    const finalUrl = /^https?:\/\//i.test(url) ? url : BASE_URL + url;
    const res = await fetch(finalUrl, options);
    if (res.status !== 200) {
      throw isJsonResp(res) ? await res.json() : await res.text();
    }
    return res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
