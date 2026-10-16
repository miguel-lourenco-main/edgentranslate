/**
 * Classified provider errors, after edgenchat !6: every failure carries a kind, a short
 * title, one line of guidance and, where there is one, a copy-pasteable fix.
 */

export type TranslationErrorKind =
  | 'invalid_url'
  | 'unreachable'
  | 'timeout'
  | 'cancelled'
  | 'not_found'
  | 'unauthorized'
  | 'model_missing'
  | 'rate_limited'
  | 'server_error'
  | 'bad_response';

export class TranslationError extends Error {
  readonly kind: TranslationErrorKind;
  readonly title: string;
  readonly hint: string;
  readonly fix?: string;
  readonly status?: number;
  readonly detail?: string;

  constructor(init: {
    kind: TranslationErrorKind;
    title: string;
    hint: string;
    fix?: string;
    status?: number;
    detail?: string;
  }) {
    super(`${init.title}: ${init.hint}`);
    this.name = 'TranslationError';
    this.kind = init.kind;
    this.title = init.title;
    this.hint = init.hint;
    this.fix = init.fix;
    this.status = init.status;
    this.detail = init.detail;
  }
}

export interface ProviderHints {
  /** e.g. "Ollama" or "the server". */
  serverName: string;
  /** Command that starts the server, if there is one. */
  startCommand?: string;
  /** Whether an API key was sent. */
  hasApiKey: boolean;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

export function cancelledError(): TranslationError {
  return new TranslationError({ kind: 'cancelled', title: 'Cancelled', hint: 'The translation was cancelled.' });
}

/**
 * Turns a thrown fetch error into a TranslationError. `userSignal` is the caller's
 * cancel signal (not the request timeout), so an abort can be told apart from a timeout.
 */
export function classifyFetchError(error: unknown, url: string, hints: ProviderHints, userSignal?: AbortSignal): TranslationError {
  if (error instanceof TranslationError) return error;
  if (userSignal?.aborted) return cancelledError();
  if (isAbortError(error)) {
    return new TranslationError({
      kind: 'timeout',
      title: 'Request timed out',
      hint: `${hints.serverName} did not answer in time. Large models can be slow on first load; try again, raise --timeout, or use a smaller model.`,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  const detail = error instanceof Error
    ? `${error.message}${error.cause instanceof Error ? ` (${error.cause.message})` : ''}`
    : String(error);
  return new TranslationError({
    kind: 'unreachable',
    title: 'Server unreachable',
    hint: `Nothing answered at ${url}. Check that ${hints.serverName} is running and the URL and port are right.`,
    fix: hints.startCommand,
    detail,
  });
}

/** Turns a non-2xx response into a TranslationError. */
export function classifyHttpError(status: number, body: string, url: string, hints: ProviderHints): TranslationError {
  const detail = body.slice(0, 500);
  if (status === 401 || status === 403) {
    return new TranslationError({
      kind: 'unauthorized',
      title: status === 401 ? 'API key required (401)' : 'Access denied (403)',
      hint: hints.hasApiKey
        ? 'The server rejected the API key. Check the key and that it has access to this model.'
        : 'This server needs an API key. Set it with --api-key or the EDGENTRANSLATE_API_KEY environment variable.',
      status,
      detail,
    });
  }
  if (status === 404) {
    if (/model .*not found|model_not_found|does not exist/i.test(body)) {
      return new TranslationError({
        kind: 'model_missing',
        title: 'Model not found',
        hint: `${hints.serverName} does not have this model. Pick one from --list-models or install it.`,
        status,
        detail,
      });
    }
    return new TranslationError({
      kind: 'not_found',
      title: 'Endpoint not found (404)',
      hint: `No API at ${url}. Use the server's base URL without extra paths.`,
      status,
      detail,
    });
  }
  if (status === 429) {
    return new TranslationError({
      kind: 'rate_limited',
      title: 'Rate limited (429)',
      hint: 'The server is throttling requests. Wait a moment and try again.',
      status,
      detail,
    });
  }
  return new TranslationError({
    kind: 'server_error',
    title: `Server error (${status})`,
    hint: `${hints.serverName} returned an error. See the detail below.`,
    status,
    detail,
  });
}

export function validateBaseUrl(baseUrl: string): URL {
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('not http(s)');
    return url;
  } catch {
    throw new TranslationError({
      kind: 'invalid_url',
      title: 'Invalid URL',
      hint: `"${baseUrl}" is not an http(s) URL, e.g. http://localhost:11434.`,
    });
  }
}
