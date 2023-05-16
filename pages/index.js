module.exports = ({ baseURL }) => `<html><head><title>Pximg Proxy</title></head><body><pre>Usage:

1. ${baseURL}/{path}
   - ${baseURL}/img-original/img/0000/00/00/00/00/00/12345678_p0.png

2. ${baseURL}/{pid}[/{p}]
   - ${baseURL}/12345678    (p0)
   - ${baseURL}/12345678/0  (p0)
   - ${baseURL}/12345678/1  (p1)

3. ${baseURL}/(original|regular|large|medium|small|thumb|mini)/{pid}[/{p}]
   - ${baseURL}/original/12345678   (same as ${baseURL}/12345678)
   - ${baseURL}/regular/12345678/1  (p1, master1200)</pre></body></html>`;
