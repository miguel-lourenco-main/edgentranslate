#!/usr/bin/env node
/**
 * EdgenTranslate CLI (#4, milestone 1): translate a TXT or Markdown file with a local
 * model through Ollama, or any OpenAI-compatible API with your own key.
 *
 *   pnpm translate notes.md --to fr
 *   pnpm translate notes.md --to de --model qwen2.5:7b
 *   pnpm translate notes.txt --to es --provider openai --base-url https://api.openai.com/v1 --model <model-id>
 *
 * Runs with Node >= 22.18 (built-in TypeScript type stripping); no build step.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { TranslationError } from '../lib/translation/errors.ts';
import { languageName } from '../lib/translation/prompt.ts';
import { listOllamaModels, OLLAMA_DEFAULT_URL, OllamaProvider } from '../lib/translation/providers/ollama.ts';
import { listOpenAICompatibleModels, OpenAICompatibleProvider } from '../lib/translation/providers/openai-compatible.ts';
import { translateDocument } from '../lib/translation/translate-document.ts';
import type { DocumentFormat, TranslationProvider } from '../lib/translation/types.ts';

const USAGE = `Usage: pnpm translate <file.md|file.txt> --to <lang> [options]

Options:
  --to <lang>              Target language code (fr, de, es, zh-CN, ...)
  --from <lang>            Source language code (default: detect)
  --provider <name>        ollama (default) | openai  (any OpenAI-compatible API)
  --model <name>           Model to use (ollama default: first installed model)
  --base-url <url>         Server URL (ollama default: ${OLLAMA_DEFAULT_URL})
  --api-key <key>          API key for --provider openai (or EDGENTRANSLATE_API_KEY / OPENAI_API_KEY)
  --glossary <file.json>   {"source term": "target term", ...} used for every chunk
  --out <file>             Output path (default: <name>.<lang>.<ext> next to the input)
  --force                  Overwrite the output file if it exists
  --max-chunk-chars <n>    Chunk size in characters (default 2000)
  --timeout <seconds>      Per-chunk request timeout (default 300)
  --list-models            List the models the server offers and exit
  --check                  Check the connection and model, then exit
  -h, --help               Show this help

Press Ctrl+C to cancel; nothing is written for a cancelled run.`;

class UsageError extends Error {}

const FORMATS: Record<string, DocumentFormat> = { '.md': 'markdown', '.markdown': 'markdown', '.txt': 'text' };

function parse(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      to: { type: 'string' },
      from: { type: 'string' },
      provider: { type: 'string', default: 'ollama' },
      model: { type: 'string' },
      'base-url': { type: 'string' },
      'api-key': { type: 'string' },
      glossary: { type: 'string' },
      out: { type: 'string' },
      force: { type: 'boolean', default: false },
      'max-chunk-chars': { type: 'string' },
      timeout: { type: 'string' },
      'list-models': { type: 'boolean', default: false },
      check: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  return { values, positionals };
}

type Args = ReturnType<typeof parse>['values'];

function apiKeyFrom(args: Args): string | undefined {
  return args['api-key'] ?? process.env.EDGENTRANSLATE_API_KEY ?? process.env.OPENAI_API_KEY;
}

function positiveInt(value: string | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new UsageError(`--${name} must be a positive integer`);
  return n;
}

async function createProvider(args: Args, log: (line: string) => void): Promise<TranslationProvider> {
  const timeoutMs = (positiveInt(args.timeout, 'timeout') ?? 300) * 1000;

  if (args.provider === 'ollama') {
    const baseUrl = args['base-url'] ?? OLLAMA_DEFAULT_URL;
    let model = args.model;
    if (!model) {
      const { models } = await listOllamaModels(baseUrl);
      if (models.length === 0) {
        throw new TranslationError({
          kind: 'model_missing',
          title: 'No models installed',
          hint: 'Ollama is running but has no models. Pull one, then run again.',
          fix: 'ollama pull qwen2.5:7b',
        });
      }
      model = models[0];
      log(`Using ${model} (first installed model; pass --model to choose)`);
    }
    return new OllamaProvider({ baseUrl, model, timeoutMs });
  }

  if (args.provider === 'openai') {
    const baseUrl = args['base-url'] ?? 'https://api.openai.com/v1';
    if (!args.model) throw new UsageError('--model is required with --provider openai');
    return new OpenAICompatibleProvider({ baseUrl, model: args.model, apiKey: apiKeyFrom(args), timeoutMs });
  }

  throw new UsageError(`Unknown --provider "${args.provider}" (use ollama or openai)`);
}

async function readGlossary(file: string | undefined): Promise<Record<string, string> | undefined> {
  if (!file) return undefined;
  let data: unknown;
  try {
    data = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    throw new UsageError(`Could not read glossary ${file}: ${error instanceof Error ? error.message : error}`);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.values(data).every(v => typeof v === 'string')) {
    throw new UsageError(`Glossary ${file} must be a JSON object of "source term": "target term" strings`);
  }
  return data as Record<string, string>;
}

function formatError(error: TranslationError): string {
  const lines = [`Error: ${error.title}`, `  ${error.hint}`];
  if (error.fix) lines.push(`  Try: ${error.fix}`);
  if (error.detail) lines.push(`  Detail: ${error.detail}`);
  return lines.join('\n');
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const log = (line: string) => process.stderr.write(`${line}\n`);
  try {
    const { values: args, positionals } = parse(argv);
    if (args.help) {
      process.stdout.write(`${USAGE}\n`);
      return 0;
    }

    if (args['list-models']) {
      const info = await listModels(args);
      process.stdout.write(info.models.length ? `${info.models.join('\n')}\n` : '(no models)\n');
      return 0;
    }

    const provider = await createProvider(args, log);

    if (args.check) {
      const info = await provider.checkConnection();
      log(`Connected to ${provider.label} in ${info.latencyMs} ms · model ${provider.model} available`);
      return 0;
    }

    const input = positionals[0];
    if (!input) throw new UsageError('Missing input file');
    if (positionals.length > 1) throw new UsageError(`Unexpected arguments: ${positionals.slice(1).join(' ')}`);
    if (!args.to) throw new UsageError('Missing --to <lang>');

    const ext = path.extname(input).toLowerCase();
    const format = FORMATS[ext];
    if (!format) {
      throw new UsageError(`Unsupported file type "${ext || '(none)'}". This version translates .md and .txt; PDF and DOCX come next (#4, milestone 2).`);
    }

    const out = args.out ?? path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.${args.to}${path.extname(input)}`);
    if (existsSync(out) && !args.force) throw new UsageError(`${out} already exists (use --force to overwrite)`);

    const text = await readFile(input, 'utf8');
    const glossary = await readGlossary(args.glossary);

    await provider.checkConnection();

    const controller = new AbortController();
    const onSigint = () => {
      if (controller.signal.aborted) process.exit(130);
      log('\nCancelling... (Ctrl+C again to quit now)');
      controller.abort();
    };
    process.on('SIGINT', onSigint);

    log(`Translating ${input} → ${languageName(args.to)} with ${provider.label} · ${provider.model}`);
    const started = Date.now();
    try {
      const result = await translateDocument({
        provider,
        text,
        format,
        targetLanguage: args.to,
        sourceLanguage: args.from,
        glossary,
        maxChunkChars: positiveInt(args['max-chunk-chars'], 'max-chunk-chars'),
        signal: controller.signal,
        onWarning: message => log(`  Warning: ${message}`),
        onProgress: p => {
          const pct = Math.round((p.done / p.total) * 100);
          log(`  [${p.done}/${p.total}] ${pct}% · ${p.usage.inputTokens} in / ${p.usage.outputTokens} out tokens · ${(p.lastChunkMs / 1000).toFixed(1)}s`);
        },
      });

      await writeFile(out, result.text, 'utf8');
      log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s: ${result.chunks} chunk(s), ${result.usage.inputTokens} in / ${result.usage.outputTokens} out tokens`);
      log(`Wrote ${out}`);
      return 0;
    } finally {
      process.off('SIGINT', onSigint);
    }
  } catch (error) {
    if (error instanceof UsageError || (error instanceof TypeError && 'code' in error && String(error.code).startsWith('ERR_PARSE_ARGS'))) {
      log(`Error: ${error.message}\n\n${USAGE}`);
      return 2;
    }
    if (error instanceof TranslationError) {
      log(formatError(error));
      return error.kind === 'cancelled' ? 130 : 1;
    }
    log(`Error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
    return 1;
  }
}

/** --list-models needs no model, so it skips createProvider's model resolution. */
function listModels(args: Args) {
  if (args.provider === 'ollama') return listOllamaModels(args['base-url'] ?? OLLAMA_DEFAULT_URL);
  if (args.provider === 'openai') return listOpenAICompatibleModels(args['base-url'] ?? 'https://api.openai.com/v1', apiKeyFrom(args));
  throw new UsageError(`Unknown --provider "${args.provider}" (use ollama or openai)`);
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isEntryPoint) {
  main().then(code => process.exit(code));
}
