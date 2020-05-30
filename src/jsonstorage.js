const { last } = require('lodash');
const Axios = require('axios');

const { JSONSTORAGE } = process.env;

const baseURL = 'https://jsonstorage.net/api/items';

module.exports = {
  enable: () => !!JSONSTORAGE,
  get: () => Axios.get(`${baseURL}/${JSONSTORAGE}`).then(({ data }) => data),
  put: obj =>
    Axios.put(`${baseURL}/${JSONSTORAGE}`, JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  create: (obj = {}) =>
    Axios.post(baseURL, JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }).then(({ data: { uri } }) => last(uri.split('/'))),
};
