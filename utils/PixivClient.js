const PixivApi = require('pixiv-api-client');
const AwaitLock = require('await-lock').default;

const loginLock = new AwaitLock();

module.exports = class PixivClient {
  /**
   * @param {string} refreshToken
   */
  constructor(refreshToken) {
    this.api = new PixivApi();
    this.expireTime = 0;
    this.refreshToken = refreshToken;
  }

  get loginExpired() {
    return Date.now() / 1000 > this.expireTime - 60;
  }

  async login() {
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

  /**
   * @param {string} id
   * @param {string} [language]
   * @returns {PixivClientIllust}
   */
  async illustDetail(id, language) {
    await this.login();
    if (language) this.api.setLanguage(language);
    try {
      const { illust } = await this.api.illustDetail(id);
      if (!illust.title || !illust.user.name) {
        throw new Error('unexpected illust result');
      }
      return illust;
    } catch (error) {
      throw error.error || error;
    }
  }

  /**
   * @param {string} id
   * @param {string} [language]
   */
  async illustPages(id, language) {
    const illust = await this.illustDetail(id, language);
    if (illust.meta_pages.length) {
      return illust.meta_pages.map(p => p.image_urls.original);
    }
    return [illust.meta_single_page.original_image_url];
  }

  static getClient(token) {
    return token ? new PixivClient(token) : null;
  }
};
