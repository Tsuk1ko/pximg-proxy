const { get } = require('axios').default;

module.exports = class PixivAjax {
  /**
   * @param {string} [cookie]
   */
  constructor(cookie) {
    this.cookie = cookie;
  }

  /**
   * @param {string} [language]
   */
  getHeaders(language) {
    const headers = { Cookie: this.cookie };
    if (language) headers['Accept-Language'] = language;
    if (process.env.USER_AGENT) headers['User-Agent'] = process.env.USER_AGENT;
    return headers;
  }

  /**
   * @param {string} id
   * @param {string} [language]
   * @returns {PixivAjaxIllust}
   */
  async illustDetail(id, language) {
    const { data } = await get(`https://www.pixiv.net/ajax/illust/${id}`, {
      validateStatus: () => true,
      headers: this.getHeaders(language),
    });
    if (typeof data !== 'object') throw data;
    if (data.error) throw data.message;
    return data.body;
  }

  /**
   * @param {string} id
   * @param {string} [language]
   * @returns {PixivAjaxIllustPages}
   */
  async illustDetailPages(id, language) {
    const { data } = await get(`https://www.pixiv.net/ajax/illust/${id}/pages`, {
      validateStatus: () => true,
      headers: this.getHeaders(language),
    });
    if (typeof data !== 'object') throw data;
    if (data.error) throw data.message;
    return data.body;
  }

  /**
   * @param {string} id
   * @param {string} [language]
   */
  async illustPages(id, language) {
    const illust = await this.illustDetail(id, language);
    if (illust.pageCount > 1) {
      const pages = await this.illustDetailPages(id, language);
      return pages.map(p => p.urls.original);
    }
    return [illust.urls.original];
  }

  static getClient(cookie) {
    return cookie ? new PixivAjax(cookie) : null;
  }
};
