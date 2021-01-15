const { omitBy } = require('lodash');
const Axios = require('axios');
const { v4: uuid } = require('uuid');

const { JSONBOX } = process.env;
const BASE_URL = 'https://jsonbox.io/heroku_pximg_proxy';

const getJsonboxUrl = () => `${BASE_URL}_${JSONBOX.replace('_', '/')}`;

module.exports = {
  name: 'jsonbox',
  enable: () => !!JSONBOX,
  get: () => Axios.get(getJsonboxUrl()).then(({ data }) => omitBy(data, (v, k) => k.startsWith('_'))),
  put: obj =>
    Axios.put(getJsonboxUrl(), JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  create: async (obj = {}) => {
    const bid = uuid().replace(/-/g, '');
    const {
      data: { _id },
    } = await Axios.post(`${BASE_URL}_${bid}`, JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
    return `${bid}_${_id}`;
  },
};
