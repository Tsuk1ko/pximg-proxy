export const last = <T>(array: T[]) => array[array.length - 1];

export const reverseProxy = async (url: string, headers: Record<string, string>) => {
  const res = await fetch(url, { headers });
  return new Response(res.body, res);
};

export const autoFetch = async (url: string, init?: RequestInit): Promise<any> => {
  const res = await fetch(url, init);
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json();
  }
  return res.text();
};
