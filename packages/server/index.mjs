import http from 'node:http';
import {timingSafeEqual, createHash} from 'node:crypto';
import {readReport} from '../core/verify.mjs';
import {checkSeal} from '../core/util.mjs';
import {renderHtml} from '../reporting/index.mjs';

const digest = x => createHash('sha256').update(x).digest();
const HEADERS = {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer', 'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"
};
// Local, read-only, single-report endpoint. Not a deployable service: no TLS, users or tenants.
export async function startServer({reportFile, token, port = 0} = {}) {
  if (!token || token.length < 16) throw new Error('Token of at least 16 characters required');
  const report = await readReport(reportFile);
  if (!checkSeal(report)) throw new Error('Report integrity failed');
  const json = Buffer.from(JSON.stringify(report));
  const html = Buffer.from(renderHtml(report));
  if (json.length > 8 * 1024 * 1024) throw new Error('Report too large');
  const expected = digest(`Bearer ${token}`);
  let boundPort = port;
  const server = http.createServer((req, res) => {
    const send = (code, headers = {}, body) => { res.writeHead(code, {...HEADERS, ...headers}); res.end(body); };
    // Reject unexpected Host headers (DNS-rebinding defence).
    const host = String(req.headers.host || '');
    if (![`127.0.0.1:${boundPort}`, `localhost:${boundPort}`, `[::1]:${boundPort}`].includes(host)) return send(421);
    if (req.method !== 'GET') return send(405, {Allow: 'GET'});
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    if (pathname === '/health') return send(200, {'Content-Type': 'application/json'}, '{"status":"ok"}');
    if (pathname !== '/report' && pathname !== '/report.html') return send(404);
    if (!timingSafeEqual(digest(req.headers.authorization || ''), expected)) return send(401, {'WWW-Authenticate': 'Bearer'});
    if (pathname === '/report.html') return send(200, {'Content-Type': 'text/html; charset=utf-8', 'Content-Length': html.length}, html);
    send(200, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': json.length}, json);
  });
  server.maxConnections = 16; server.requestTimeout = 5000; server.headersTimeout = 5000; server.keepAliveTimeout = 1000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  boundPort = server.address().port;
  return {server, address: server.address()};
}
