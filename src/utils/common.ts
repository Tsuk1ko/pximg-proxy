import Axios from 'axios';

const HAS_FETCH = typeof fetch !== 'undefined';

export const last = <T>(array: T[]) => array[array.length - 1];

export const reverseProxy = async (url: string, headers: Record<string, string>) => {
  if (HAS_FETCH) {
    const res = await fetch(url, { headers });
    return new Response(res.body, res);
  }
  const {
    data,
    status,
    statusText,
    headers: resHeaders,
  } = await Axios.get(url, {
    headers,
    responseType: 'stream',
    validateStatus: () => true,
  });
  return new Response(data, { status, statusText, headers: resHeaders as any });
};
