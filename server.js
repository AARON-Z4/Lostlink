
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import server from './dist/server/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1. Serve static assets with long-term caching
app.use('/assets', express.static(path.join(__dirname, 'dist/client/assets'), {
  maxAge: '1y',
  immutable: true
}));

// 2. Serve other static files (favicon, etc.)
app.use(express.static(path.join(__dirname, 'dist/client')));

// 3. Handle all other requests with the TanStack Start handler
app.all('*', async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // Construct a standard Web Request for the TanStack Start handler
    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      // Pass the body stream for non-GET requests
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined,
      duplex: 'half',
    });

    const webRes = await server.fetch(webReq);

    // Stream the Web Response back to the Express Response
    res.status(webRes.status);
    webRes.headers.forEach((v, k) => res.setHeader(k, v));
    
    const body = await webRes.text();
    res.send(body);
  } catch (e) {
    console.error('SSR Error:', e);
    res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Production server running on http://localhost:${port}`);
});
