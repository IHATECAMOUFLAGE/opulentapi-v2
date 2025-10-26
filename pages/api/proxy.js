import { HttpsProxyAgent } from 'https-proxy-agent';
import { parse } from 'node-html-parser';

export default async function handler(req, res) {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing ?url');

    const upstream = req.query.upstream || 'http://20.210.39.153:8561';
    const url = /^https?:\/\//.test(target) ? target : `https://${target}`;

    const agent = new HttpsProxyAgent(upstream);
    const resp = await fetch(url, { agent, headers: { 'user-agent': req.headers['user-agent'] || 'Mozilla/5.0' } });

    const contentType = resp.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.setHeader('Content-Type', contentType);
      return res.status(resp.status).send(buffer);
    }

    let html = await resp.text();
    const root = parse(html, { script: true, style: true, pre: true });
    const base = new URL(url);

    function rewriteAttr(node, attr) {
      const val = node.getAttribute(attr);
      if (!val || /^data:|^mailto:|^javascript:/.test(val)) return;
      try {
        const absolute = new URL(val, base).href;
        node.setAttribute(attr, `/api/proxy?url=${encodeURIComponent(absolute)}&upstream=${encodeURIComponent(upstream)}`);
      } catch {}
    }

    root.querySelectorAll('img').forEach((n) => rewriteAttr(n, 'src'));
    root.querySelectorAll('script').forEach((n) => rewriteAttr(n, 'src'));
    root.querySelectorAll('link').forEach((n) => rewriteAttr(n, 'href'));
    root.querySelectorAll('a').forEach((n) => {
      const h = n.getAttribute('href');
      if (!h || h.startsWith('#') || /^mailto:|^javascript:/.test(h)) return;
      try {
        const absolute = new URL(h, base).href;
        n.setAttribute('href', `/api/proxy?url=${encodeURIComponent(absolute)}&upstream=${encodeURIComponent(upstream)}`);
        n.setAttribute('target', '_self');
      } catch {}
    });

    const head = root.querySelector('head') || root;
    head.appendChild(parse(`<link rel="stylesheet" href="/overlay/custom.css">`));

    const body = root.querySelector('body') || root;
    body.appendChild(parse(`<script src="/overlay/overlay.js"></script>`));

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(root.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send('Proxy error: ' + err.message);
  }
}
