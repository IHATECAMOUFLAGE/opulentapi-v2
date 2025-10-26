import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [proxy, setProxy] = useState('http://20.210.39.153:8561');

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>🌐 OpulentFile-V2 Proxy</h1>
      <p>Enter a URL to browse through the configured upstream proxy.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ flex: 1, padding: 8 }}
        />
        <select value={proxy} onChange={(e) => setProxy(e.target.value)}>
          <option value="http://20.210.39.153:8561">Japan (JP)</option>
          <option value="http://1.2.3.4:8080">US (Example)</option>
          <option value="http://5.6.7.8:8080">UK (Example)</option>
        </select>
        <button
          onClick={() => {
            if (!url) return alert('Enter a URL');
            const full = `/api/proxy?url=${encodeURIComponent(url)}&upstream=${encodeURIComponent(proxy)}`;
            window.open(full, '_blank');
          }}
        >
          Open
        </button>
      </div>
    </main>
  );
}
