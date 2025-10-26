export default async function handler(req, res) {
  try {
    const target = req.query.url;
    if (!target) {
      return res.status(400).send("Missing ?url parameter");
    }

    // Ensure it starts with http/https
    const url = /^https?:\/\//.test(target) ? target : `https://${target}`;

    // Forward through your Japan proxy
    const proxy = "http://20.210.39.153:8561";

    const response = await fetch(url, {
      method: "GET",
      headers: { ...req.headers },
      // Use the Japan proxy for outgoing requests
      dispatcher: new (await import("undici")).ProxyAgent(proxy),
    });

    const contentType = response.headers.get("content-type") || "text/html";
    const body = await response.text();

    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(body);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error: " + err.message);
  }
}
