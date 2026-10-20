import { classifyFetchError, classifyHttpError, TranslationError, type ProviderHints } from './errors.ts';

export interface RequestJsonOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  /** Caller's cancel signal. */
  signal?: AbortSignal;
  timeoutMs: number;
  hints: ProviderHints;
}

/** fetch + JSON with a timeout and classified errors. */
export async function requestJson<T>(url: string, options: RequestJsonOptions): Promise<T> {
  // The request aborts on whichever comes first: the timeout or the caller's cancel.
  const signals = [AbortSignal.timeout(options.timeoutMs)];
  if (options.signal) signals.push(options.signal);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.any(signals),
    });
  } catch (error) {
    throw classifyFetchError(error, url, options.hints, options.signal);
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    throw classifyFetchError(error, url, options.hints, options.signal);
  }

  if (!response.ok) throw classifyHttpError(response.status, text, url, options.hints);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new TranslationError({
      kind: 'bad_response',
      title: 'Not a model server',
      hint: `${url} answered, but not with JSON. Check that the URL points at ${options.hints.serverName}.`,
      status: response.status,
      detail: text.slice(0, 500),
    });
  }
}

export function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
