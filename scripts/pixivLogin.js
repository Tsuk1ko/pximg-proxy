const Crypto = require('crypto');
const { Base64 } = require('js-base64');
const { stringify } = require('qs');
const readline = require('readline-sync');
const PixivApi = require('pixiv-api-client');

const LOGIN_URL = 'https://app-api.pixiv.net/web/v1/login';

const randToken = (len = 32) => Crypto.randomBytes(len);
const sha256 = data => Crypto.createHash('sha256').update(data).digest();

const generateOauthCode = () => {
  const code_verifier = Base64.fromUint8Array(randToken(), true);
  const code_challenge = Base64.encodeURI(sha256(code_verifier));
  return { code_verifier, code_challenge };
};

const getLoginInfo = () => {
  const { code_verifier, code_challenge } = generateOauthCode();
  const params = {
    code_challenge,
    code_challenge_method: 'S256',
    client: 'pixiv-android',
  };
  return {
    loginUrl: `${LOGIN_URL}?${stringify(params)}`,
    codeVerifier: code_verifier,
  };
};

const login = async () => {
  const { loginUrl, codeVerifier } = getLoginInfo();
  console.log('Login URL:', loginUrl);
  const code = (() => {
    while (true) {
      const input = readline.question('Code: ');
      if (input) return input;
    }
  })();

  const pixiv = new PixivApi();
  await pixiv.tokenRequest(code, codeVerifier);
  console.log('\nYour refresh token:', pixiv.authInfo().refresh_token);
};

login();
