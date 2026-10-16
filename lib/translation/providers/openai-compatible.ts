import { TranslationError, type ProviderHints } from '../errors.ts';
import { requestJson, trimSlash } from '../http.ts';
import { buildTranslationMessages, cleanModelOutput } from '../prompt.ts';
import type { ConnectionInfo, TranslateChunkRequest, TranslateChunkResult, TranslationProvider } from '../types.ts';

export interface OpenAICompatibleProviderOptions {
  /** Base URL including /v1, e.g. https://api.openai.com/v1 or http://localhost:11434/v1. */
  baseUrl: string;
  model: string;
  apiKey?: string;
  timeoutMs?: number;
  temperature?: number;
}

interface ModelsResponse {
  data?: Array<{ id: string }>;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

function authHeaders(apiKey?: string): Record<string, string> {
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

/** Lists models via GET {baseUrl}/models. */
export async function listOpenAICompatibleModels(baseUrl: string, apiKey?: string, signal?: AbortSignal): Promise<ConnectionInfo> {
  const started = Date.now();
  const data = await requestJson<ModelsResponse>(`${trimSlash(baseUrl)}/models`, {
    headers: authHeaders(apiKey),
    signal,
    timeoutMs: 10_000,
    hints: { serverName: 'the server', hasApiKey: Boolean(apiKey) },
  });
  const models = Array.isArray(data.data) ? data.data.map(m => m.id) : [];
  return { models, endpoint: '/models', latencyMs: Date.now() - started };
}

/**
 * Any server that speaks the OpenAI chat-completions API: hosted APIs with a key, or
 * local servers (Ollama's /v1, LM Studio, llama.cpp, vLLM) without one.
 */
export class OpenAICompatibleProvider implements TranslationProvider {
  readonly id = 'openai-compatible';
  readonly label = 'OpenAI-compatible API';
  readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly temperature: number;
  private readonly hints: ProviderHints;

  constructor(options: OpenAICompatibleProviderOptions) {
    this.baseUrl = trimSlash(options.baseUrl);
    this.model = options.model;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 300_000;
    this.temperature = options.temperature ?? 0.2;
    this.hints = { serverName: 'the server', hasApiKey: Boolean(options.apiKey) };
  }

  async checkConnection(signal?: AbortSignal): Promise<ConnectionInfo> {
    const info = await listOpenAICompatibleModels(this.baseUrl, this.apiKey, signal);
    // Some servers list only a subset of models; only fail when a list exists and lacks it.
    if (info.models.length > 0 && !info.models.includes(this.model)) {
      throw new TranslationError({
        kind: 'model_missing',
        title: `Model "${this.model}" is not available`,
        hint: `Available: ${info.models.slice(0, 20).join(', ')}${info.models.length > 20 ? ', ...' : ''}. See --list-models.`,
      });
    }
    return info;
  }

  async translate(request: TranslateChunkRequest): Promise<TranslateChunkResult> {
    const { system, user } = buildTranslationMessages(request);
    const data = await requestJson<ChatCompletionResponse>(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: authHeaders(this.apiKey),
      body: {
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: this.temperature,
        stream: false,
      },
      signal: request.signal,
      timeoutMs: this.timeoutMs,
      hints: this.hints,
    });

    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new TranslationError({
        kind: 'bad_response',
        title: 'Unexpected response',
        hint: 'The server answered without a completion.',
        detail: JSON.stringify(data).slice(0, 500),
      });
    }
    return {
      text: cleanModelOutput(content, request.text),
      usage: { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 },
    };
  }
}
