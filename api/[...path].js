const { URL } = require('url');

module.exports = async (req, res) => {
  const BACKEND_URL = process.env.BACKEND_URL;
  if (!BACKEND_URL) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'BACKEND_URL env is not set' }));
    return;
  }

  const incomingUrl = req.url || '/';
  const pathAfterApi = incomingUrl.replace(/^\/api\/?/, '');
  const targetUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/${pathAfterApi}`;

  const forwardedHeaders = { ...req.headers };
  delete forwardedHeaders['host'];
  delete forwardedHeaders['accept-encoding'];

  const bodyBuffer = await new Promise((resolve) => {
    const chunks = [];
    req.on('data', (d) => chunks.push(d));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const method = req.method || 'GET';
  const hasBody = !['GET', 'HEAD'].includes(method);

  const backendRes = await fetch(targetUrl, {
    method,
    headers: forwardedHeaders,
    body: hasBody ? bodyBuffer : undefined,
    redirect: 'manual',
  });

  const respBuffer = Buffer.from(await backendRes.arrayBuffer());
  res.statusCode = backendRes.status;

  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      res.setHeader('set-cookie', value);
    } else {
      res.setHeader(key, value);
    }
  });

  res.end(respBuffer);
};
