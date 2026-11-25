import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = path.join(root, 'documents/html');
const exists = p => access(p).then(() => true, () => false);
const pages = async () => (await readdir(html)).filter(f => f.endsWith('.html'));

test('documentation site has 15 pages, home and 404', async () => {
  const p = await pages();
  assert.ok(p.includes('index.html') && p.includes('404.html'));
  assert.equal(p.filter(f => /^\d\d-/.test(f)).length, 15);
});
test('light theme is the default and dark is remembered by choice only', async () => {
  const home = await readFile(path.join(html, 'index.html'), 'utf8');
  assert.match(home, /<html lang="en" data-theme="light">/);
  assert.match(home, /t==='dark'\?'dark':'light'/);
  assert.match(home, /class="icon-btn theme-btn"/);
});
test('every internal link and asset in the site resolves', async () => {
  const broken = [];
  for (const f of await pages()) {
    const text = await readFile(path.join(html, f), 'utf8');
    for (const m of text.matchAll(/(?:href|src)="([^"#?]+)(?:#[^"]*)?"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|data:|\/)/.test(u)) continue;
      if (!(await exists(path.join(html, u)))) broken.push(`${f} -> ${u}`);
    }
  }
  assert.deepEqual(broken, []);
});
test('no unfilled placeholders or unknown directives remain', async () => {
  for (const f of await pages()) {
    const text = await readFile(path.join(html, f), 'utf8');
    assert.doesNotMatch(text.replace(/<script[\s\S]*?<\/script>/g, ''), /\{\{[^}]+\}\}/, f);
  }
});
test('docs pages contain diagrams, charts and flowcharts', async () => {
  const arch = await readFile(path.join(html, '05-architecture.html'), 'utf8');
  assert.ok((arch.match(/<svg class="dia"/g) || []).length >= 6);
  const scn = await readFile(path.join(html, '04-real-world-scenarios.html'), 'utf8');
  assert.ok((scn.match(/<ol class="flow/g) || []).length >= 9);
  assert.match(scn, /class="chart"/);
  assert.match(await readFile(path.join(html, 'index.html'), 'utf8'), /class="bars"/);
});
test('site has accessibility basics: skip link, labelled nav, svg roles, mobile viewport', async () => {
  const text = await readFile(path.join(html, '03-user-guide.html'), 'utf8');
  assert.match(text, /class="skip"/); assert.match(text, /aria-label="Documentation"/);
  assert.match(text, /name="viewport" content="width=device-width,initial-scale=1"/);
  const arch = await readFile(path.join(html, '05-architecture.html'), 'utf8');
  for (const m of arch.matchAll(/<svg class="dia"([^>]*)>/g)) assert.match(m[1], /role="img"/);
});
test('site claims stay honest: no unverified IDE activation or adoption claims', async () => {
  for (const f of await pages()) {
    const text = (await readFile(path.join(html, f), 'utf8')).replace(/<script[\s\S]*?<\/script>/g, '');
    assert.doesNotMatch(text, /natively (verified|tested) in/i, f);
    assert.doesNotMatch(text, /\b(testimonial|trusted by \d|\d+[,\d]* (downloads|stars|users))\b/i, f);
  }
});
test('pages workflow deploys the built site folder', async () => {
  const w = await readFile(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(w, /path: documents\/html/);
});
