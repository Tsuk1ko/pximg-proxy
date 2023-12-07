/**
 * Some code comes from https://github.com/alphasp/pixiv-api-client
 */

const Crypto = require('crypto');
const { Base64 } = require('js-base64');
const { stringify } = require('qs');
const md5 = require('blueimp-md5');
const readline = require('readline-sync');

const BASE_URL = 'https://app-api.pixiv.net';
const CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT';
const CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj';
const HASH_SECRET = '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c';

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
    loginUrl: `${BASE_URL}/web/v1/login?${stringify(params)}`,
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

  const token = await tokenRequest(code, codeVerifier);
  console.log('\nYour refresh token:', token);
};

const tokenRequest = async (code, codeVerifier) => {
  const datetime = new Date().toISOString();
  const body = stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    code_verifier: codeVerifier,
    redirect_uri: `${BASE_URL}/web/v1/users/auth/pixiv/callback`,
    grant_type: 'authorization_code',
    include_policy: true,
  });
  const options = {
    method: 'POST',
    headers: {
      'App-OS': 'android',
      'Accept-Language': 'en-us',
      'App-OS-Version': '9.0',
      'App-Version': '5.0.234',
      'User-Agent': 'PixivAndroidApp/5.0.234  (Android 9.0; Pixel 3)',
      'X-Client-Time': datetime,
      'X-Client-Hash': md5(`${datetime}${HASH_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  };
  const res = await fetch('https://oauth.secure.pixiv.net/auth/token', options);
  if (res.status !== 200) throw await res.text();
  const data = await res.json();
  return data.response.refresh_token;
};

login();
