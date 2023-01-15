const PixivApi = require('pixiv-api-client');
const AwaitLock = require('await-lock').default;

const loginLock = new AwaitLock();

module.exports = class PixivClient {
  /**
   * @param {string} [refreshToken]
   */
  constructor(refreshToken) {
    this.api = new PixivApi();
    this.expireTime = 0;
    this.refreshToken = refreshToken;
  }

  get available() {
    return !!this.refreshToken;
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
   */
  async illustDetail(id, language) {
    await this.login();
    if (language) this.api.setLanguage(language);
    return this.api.illustDetail(id);
  }
};
