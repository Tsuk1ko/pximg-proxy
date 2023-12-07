export interface PixivApi {
  illustPages: (id: string, language?: string) => Promise<string[]>;
}

export const last = <T>(array: T[]) => array[array.length - 1];

export const reverseProxy = async (url: string, headers: Record<string, string>) => {
  const res = await fetch(url, { headers });
  return new Response(res.body, res);
};

export const isJsonResp = (res: Response) => res.headers.get('content-type')?.includes('application/json');

export const autoFetch = async (url: string, init?: RequestInit): Promise<any> => {
  const res = await fetch(url, init);
  if (isJsonResp(res)) {
    return res.json();
  }
  return res.text();
};
