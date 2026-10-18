import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import { TranslationError } from './errors.ts';
import { listOllamaModels, OllamaProvider } from './providers/ollama.ts';
import { OpenAICompatibleProvider } from './providers/openai-compatible.ts';
import { translateDocument } from './translate-document.ts';
import type { TranslateChunkRequest, TranslationProvider } from './types.ts';

type Handler = (req: IncomingMessage, body: string, res: ServerResponse) => void;

/** Stub HTTP server; each test sets `handler`. */
let handler: Handler = (_req, _body, res) => res.end();
let server: Server;
let baseUrl: string;
const requests: Array<{ url: string; body: unknown; headers: IncomingMessage['headers'] }> = [];

before(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      requests.push({ url: req.url ?? '', body: body ? JSON.parse(body) : undefined, headers: req.headers });
      handler(req, body, res);
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => new Promise<void>(resolve => server.close(() => resolve())));

const json = (res: ServerResponse, status: number, data: unknown) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

async function rejectsWith(promise: Promise<unknown>, kind: string) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof TranslationError, String(error));
    assert.equal(error.kind, kind);
    return true;
  });
}

describe('OllamaProvider', () => {
  it('lists models and checks the selected one is installed', async () => {
    handler = (_req, _body, res) => json(res, 200, { models: [{ name: 'qwen2.5:7b' }, { name: 'llama3.2:latest' }] });
    assert.deepEqual((await listOllamaModels(baseUrl)).models, ['qwen2.5:7b', 'llama3.2:latest']);
    await new OllamaProvider({ baseUrl, model: 'llama3.2' }).checkConnection();
    await rejectsWith(new OllamaProvider({ baseUrl, model: 'mistral' }).checkConnection(), 'model_missing');
  });

  it('sends a chat request and returns the cleaned translation with token usage', async () => {
    requests.length = 0;
    handler = (_req, _body, res) =>
      json(res, 200, { message: { content: '<think>hmm</think>\nBonjour le monde' }, prompt_eval_count: 42, eval_count: 7 });
    const result = await new OllamaProvider({ baseUrl, model: 'qwen3:8b' }).translate({
      text: 'Hello world',
      targetLanguage: 'fr',
      format: 'text',
      glossary: { world: 'monde' },
    });
    assert.deepEqual(result, { text: 'Bonjour le monde', usage: { inputTokens: 42, outputTokens: 7 } });

    const sent = requests[0];
    assert.equal(sent.url, '/api/chat');
    const body = sent.body as { model: string; stream: boolean; think: boolean; messages: Array<{ role: string; content: string }> };
    assert.equal(body.model, 'qwen3:8b');
    assert.equal(body.stream, false);
    assert.equal(body.think, false);
    assert.match(body.messages[0].content, /into French/);
    assert.match(body.messages[0].content, /world → monde/);
    assert.equal(body.messages[1].content, 'Hello world');
  });

  it('classifies failures', async () => {
    handler = (_req, _body, res) => json(res, 404, { error: "model 'nope' not found" });
    await rejectsWith(new OllamaProvider({ baseUrl, model: 'nope' }).translate({ text: 'x', targetLanguage: 'fr', format: 'text' }), 'model_missing');

    handler = (_req, _body, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html>not ollama</html>');
    };
    await rejectsWith(listOllamaModels(baseUrl), 'bad_response');

    handler = (_req, _body, res) => json(res, 500, { error: 'boom' });
    await rejectsWith(listOllamaModels(baseUrl), 'server_error');

    await rejectsWith(listOllamaModels('http://127.0.0.1:1'), 'unreachable');

    handler = () => {}; // never answers
    await rejectsWith(listOllamaModels(baseUrl, undefined, 200), 'timeout');
  });

  it('reports a cancel as cancelled, not as a timeout', async () => {
    handler = () => {}; // never answers
    const controller = new AbortController();
    const pending = new OllamaProvider({ baseUrl, model: 'm' }).translate({ text: 'x', targetLanguage: 'fr', format: 'text', signal: controller.signal });
    setTimeout(() => controller.abort(), 50);
    await rejectsWith(pending, 'cancelled');
  });
});

describe('OpenAICompatibleProvider', () => {
  it('sends the API key and reads choices and usage', async () => {
    requests.length = 0;
    handler = (req, _body, res) => {
      if (req.url === '/v1/models') return json(res, 200, { data: [{ id: 'gpt-x' }] });
      json(res, 200, { choices: [{ message: { content: 'Hallo' } }], usage: { prompt_tokens: 10, completion_tokens: 2 } });
    };
    const provider = new OpenAICompatibleProvider({ baseUrl: `${baseUrl}/v1`, model: 'gpt-x', apiKey: 'sk-test' });
    await provider.checkConnection();
    const result = await provider.translate({ text: 'Hello', targetLanguage: 'de', format: 'text' });
    assert.deepEqual(result, { text: 'Hallo', usage: { inputTokens: 10, outputTokens: 2 } });
    assert.equal(requests[1].url, '/v1/chat/completions');
    assert.equal(requests[1].headers.authorization, 'Bearer sk-test');
  });

  it('classifies 401 and 429', async () => {
    handler = (_req, _body, res) => json(res, 401, { error: { message: 'bad key' } });
    await rejectsWith(new OpenAICompatibleProvider({ baseUrl, model: 'm' }).checkConnection(), 'unauthorized');
    handler = (_req, _body, res) => json(res, 429, { error: { message: 'slow down' } });
    await rejectsWith(new OpenAICompatibleProvider({ baseUrl, model: 'm' }).translate({ text: 'x', targetLanguage: 'fr', format: 'text' }), 'rate_limited');
  });
});

describe('translateDocument', () => {
  /** Upper-cases text and records each request. */
  function fakeProvider(calls: TranslateChunkRequest[]): TranslationProvider {
    return {
      id: 'fake',
      label: 'Fake',
      model: 'fake',
      checkConnection: async () => ({ models: ['fake'], endpoint: '/', latencyMs: 0 }),
      translate: async request => {
        calls.push(request);
        return { text: request.text.toUpperCase(), usage: { inputTokens: request.text.length, outputTokens: 1 } };
      },
    };
  }

  it('translates chunk by chunk, keeps spacing and carries context and glossary', async () => {
    const calls: TranslateChunkRequest[] = [];
    const progress: number[] = [];
    const result = await translateDocument({
      provider: fakeProvider(calls),
      text: '\nalpha\n\nbeta\n\n\ngamma\n',
      format: 'markdown',
      targetLanguage: 'fr',
      glossary: { alpha: 'ALPHA' },
      maxChunkChars: 6,
      onProgress: p => progress.push(p.done),
    });

    assert.equal(result.text, '\nALPHA\n\nBETA\n\n\nGAMMA\n');
    assert.equal(result.chunks, 3);
    assert.deepEqual(result.usage, { inputTokens: 14, outputTokens: 3 });
    assert.deepEqual(progress, [1, 2, 3]);
    assert.deepEqual(calls.map(c => c.text), ['alpha', 'beta', 'gamma']);
    assert.equal(calls[0].context, undefined);
    assert.deepEqual(calls[1].context, { source: 'alpha', translation: 'ALPHA' });
    assert.deepEqual(calls[2].context, { source: 'beta', translation: 'BETA' });
    assert.ok(calls.every(c => c.glossary?.alpha === 'ALPHA' && c.format === 'markdown'));
  });

  it('keeps a code-only Markdown chunk without sending it', async () => {
    const calls: TranslateChunkRequest[] = [];
    const result = await translateDocument({
      provider: fakeProvider(calls),
      text: 'intro\n\n```sh\nls -la\n```\n',
      format: 'markdown',
      targetLanguage: 'fr',
      maxChunkChars: 6,
    });
    assert.equal(result.text, 'INTRO\n\n```sh\nls -la\n```\n');
    assert.deepEqual(calls.map(c => c.text), ['intro']);

    // Two code blocks around a paragraph in one chunk: the chunk is still translated.
    const mixed = '```\na\n```\n\npara\n\n```\nb\n```';
    calls.length = 0;
    await translateDocument({ provider: fakeProvider(calls), text: mixed, format: 'markdown', targetLanguage: 'fr' });
    assert.deepEqual(calls.map(c => c.text), [mixed]);
  });

  it('retries a chunk once when the Markdown structure changed, then warns', async () => {
    const answers = ['Titre seul', '# Titre\n\n- un', 'perdu', 'perdu encore'];
    const sent: string[] = [];
    const warnings: string[] = [];
    const provider: TranslationProvider = {
      ...fakeProvider([]),
      translate: async request => {
        sent.push(request.text);
        return { text: answers.shift() ?? '', usage: { inputTokens: 1, outputTokens: 1 } };
      },
    };
    const result = await translateDocument({
      provider,
      text: '# Title\n\n- one\n\n## Next',
      format: 'markdown',
      targetLanguage: 'fr',
      maxChunkChars: 16,
      onWarning: w => warnings.push(w),
    });
    assert.deepEqual(sent, ['# Title\n\n- one', '# Title\n\n- one', '## Next', '## Next']);
    assert.equal(result.text, '# Titre\n\n- un\n\nperdu encore');
    assert.deepEqual(result.usage, { inputTokens: 4, outputTokens: 4 });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^Chunk 2:/);
  });

  it('stops between chunks when cancelled', async () => {
    const calls: TranslateChunkRequest[] = [];
    const controller = new AbortController();
    await rejectsWith(
      translateDocument({
        provider: fakeProvider(calls),
        text: 'one\n\ntwo\n\nthree',
        format: 'text',
        targetLanguage: 'fr',
        maxChunkChars: 3,
        signal: controller.signal,
        onProgress: p => {
          if (p.done === 1) controller.abort();
        },
      }),
      'cancelled',
    );
    assert.equal(calls.length, 1);
  });
});
