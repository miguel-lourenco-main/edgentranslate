import { TranslationError, type ProviderHints } from '../errors.ts';
import { requestJson, trimSlash } from '../http.ts';
import { buildTranslationMessages, cleanModelOutput } from '../prompt.ts';
import type { ConnectionInfo, TranslateChunkRequest, TranslateChunkResult, TranslationProvider } from '../types.ts';

export const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

export interface OllamaProviderOptions {
  baseUrl?: string;
  model: string;
  /** Per-request timeout; the first request also loads the model into memory. */
  timeoutMs?: number;
  temperature?: number;
}

interface OllamaTagsResponse {
  models?: Array<{ name: string; model?: string }>;
}

interface OllamaChatResponse {
  message?: { content?: string };
  prompt_eval_count?: number;
  eval_count?: number;
  error?: string;
}

const HINTS: ProviderHints = { serverName: 'Ollama', startCommand: 'ollama serve', hasApiKey: false };

/** Lists installed models via GET /api/tags. */
export async function listOllamaModels(baseUrl: string = OLLAMA_DEFAULT_URL, signal?: AbortSignal, timeoutMs = 6000): Promise<ConnectionInfo> {
  const started = Date.now();
  const url = `${trimSlash(baseUrl)}/api/tags`;
  const data = await requestJson<OllamaTagsResponse>(url, { signal, timeoutMs, hints: HINTS });
  if (!Array.isArray(data.models)) {
    throw new TranslationError({
      kind: 'bad_response',
      title: 'Not an Ollama server',
      hint: `${url} answered without a model list. Check the URL points at Ollama (default ${OLLAMA_DEFAULT_URL}).`,
    });
  }
  return { models: data.models.map(m => m.name), endpoint: '/api/tags', latencyMs: Date.now() - started };
}

/** Local models through Ollama's native chat API (POST /api/chat). */
export class OllamaProvider implements TranslationProvider {
  readonly id = 'ollama';
  readonly label = 'Ollama (local)';
  readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly temperature: number;

  constructor(options: OllamaProviderOptions) {
    this.baseUrl = trimSlash(options.baseUrl ?? OLLAMA_DEFAULT_URL);
    this.model = options.model;
    this.timeoutMs = options.timeoutMs ?? 300_000;
    this.temperature = options.temperature ?? 0.2;
  }

  async checkConnection(signal?: AbortSignal): Promise<ConnectionInfo> {
    const info = await listOllamaModels(this.baseUrl, signal);
    const installed = info.models.some(name => name === this.model || name === `${this.model}:latest`);
    if (!installed) {
      throw new TranslationError({
        kind: 'model_missing',
        title: `Model "${this.model}" is not installed`,
        hint: info.models.length
          ? `Installed: ${info.models.join(', ')}. Pick one with --model, or pull this one.`
          : 'No models are installed yet.',
        fix: `ollama pull ${this.model}`,
      });
    }
    return info;
  }

  async translate(request: TranslateChunkRequest): Promise<TranslateChunkResult> {
    const { system, user } = buildTranslationMessages(request);
    const data = await requestJson<OllamaChatResponse>(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      body: {
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: false,
        // Reasoning models (qwen3, deepseek-r1) would otherwise spend tokens thinking.
        think: false,
        options: { temperature: this.temperature },
      },
      signal: request.signal,
      timeoutMs: this.timeoutMs,
      hints: HINTS,
    });

    const content = data.message?.content;
    if (typeof content !== 'string') {
      throw new TranslationError({
        kind: 'bad_response',
        title: 'Unexpected response',
        hint: 'Ollama answered without a message.',
        detail: JSON.stringify(data).slice(0, 500),
      });
    }

    return {
      text: cleanModelOutput(content, request.text),
      usage: { inputTokens: data.prompt_eval_count ?? 0, outputTokens: data.eval_count ?? 0 },
    };
  }
}
