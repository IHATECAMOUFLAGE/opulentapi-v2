import { HttpsProxyAgent } from 'https-proxy-agent';

export default async function handler(req, res) {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing ?url');

    const upstream = req.query.upstream || 'http://20.210.39.153:8561';
    const agent = new HttpsProxyAgent(upstream);
    const resp = await fetch(target, { agent });

    const buf = Buffer.from(await resp.arrayBuffer());
    const ct = resp.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', ct);
    res.status(resp.status).send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).send('Asset error');
  }
}
