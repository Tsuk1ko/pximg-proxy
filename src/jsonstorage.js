const { last } = require('lodash');
const Axios = require('axios');

const { JSONSTORAGE } = process.env;

const BASE_URL = 'https://jsonstorage.net/api/items';

module.exports = {
  name: 'jsonstorage',
  enable: () => !!JSONSTORAGE,
  get: () => Axios.get(`${BASE_URL}/${JSONSTORAGE}`).then(({ data }) => data),
  put: obj =>
    Axios.put(`${BASE_URL}/${JSONSTORAGE}`, JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  create: (obj = {}) =>
    Axios.post(BASE_URL, JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }).then(({ data: { uri } }) => last(uri.split('/'))),
};
