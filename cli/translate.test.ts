import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { main } from './translate.ts';

let server: Server;
let baseUrl: string;
let dir: string;

before(async () => {
  dir = mkdtempSync(path.join(tmpdir(), 'edgentranslate-cli-'));
  // Minimal Ollama stub: one model; "translates" by wrapping the text in [fr: ...].
  server = createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if (req.url === '/api/tags') return res.end(JSON.stringify({ models: [{ name: 'stub:1b' }] }));
      const { messages } = JSON.parse(body) as { messages: Array<{ content: string }> };
      res.end(JSON.stringify({ message: { content: `[fr: ${messages[1].content}]` }, prompt_eval_count: 5, eval_count: 3 }));
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  rmSync(dir, { recursive: true, force: true });
  return new Promise<void>(resolve => server.close(() => resolve()));
});

describe('cli/translate', () => {
  it('translates a Markdown file next to the input, picking the installed model', async () => {
    const input = path.join(dir, 'notes.md');
    writeFileSync(input, '# Title\n\nHello.\n');
    const code = await main([input, '--to', 'fr', '--base-url', baseUrl, '--max-chunk-chars', '8']);
    assert.equal(code, 0);
    assert.equal(readFileSync(path.join(dir, 'notes.fr.md'), 'utf8'), '[fr: # Title]\n\n[fr: Hello.]\n');

    // Refuses to overwrite without --force.
    assert.equal(await main([input, '--to', 'fr', '--base-url', baseUrl]), 2);
    assert.equal(await main([input, '--to', 'fr', '--base-url', baseUrl, '--force']), 0);
  });

  it('rejects unsupported input and missing arguments with exit code 2', async () => {
    const pdf = path.join(dir, 'report.pdf');
    writeFileSync(pdf, '%PDF-1.4');
    assert.equal(await main([pdf, '--to', 'fr', '--base-url', baseUrl]), 2);
    assert.equal(await main([path.join(dir, 'notes.md'), '--base-url', baseUrl]), 2);
    assert.equal(await main(['--bogus']), 2);
  });

  it('exits 1 with a classified error when the server is down', async () => {
    const input = path.join(dir, 'down.txt');
    writeFileSync(input, 'Hello');
    assert.equal(await main([input, '--to', 'fr', '--base-url', 'http://127.0.0.1:1', '--model', 'x']), 1);
  });

  it('checks the connection and the model', async () => {
    assert.equal(await main(['--check', '--base-url', baseUrl, '--model', 'stub:1b']), 0);
    assert.equal(await main(['--check', '--base-url', baseUrl, '--model', 'missing']), 1);
  });
});
