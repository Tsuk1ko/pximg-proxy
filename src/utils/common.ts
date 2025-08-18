export interface PixivApi {
  illustPages: (id: string, language?: string) => Promise<string[]>;
}

export const last = <T>(array: T[]) => array[array.length - 1];

export const reverseProxy = async (url: string, headers: Record<string, string>) => {
  const res = await fetch(url, { headers });
  const newRes = new Response(res.body, res);
  // 不知道为什么需要访问一下 body 才行
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  newRes.body;
  return newRes;
};

export const isJsonResp = (res: Response) => res.headers.get('content-type')?.includes('application/json');

export const autoFetch = async (url: string, init?: RequestInit): Promise<any> => {
  const res = await fetch(url, init);
  if (isJsonResp(res)) {
    return res.json();
  }
  return res.text();
};
