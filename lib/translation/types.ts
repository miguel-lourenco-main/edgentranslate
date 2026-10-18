/**
 * Provider-agnostic translation engine types (#4).
 *
 * Everything under lib/translation is plain TypeScript with fetch and no Next.js or
 * Node-only imports, so the CLI (cli/translate.ts) and, later, the UI and a desktop
 * shell can share it. Imports use explicit `.ts` extensions and `import type` so Node
 * can run the files directly with type stripping.
 */

export type DocumentFormat = 'markdown' | 'text';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface TranslateChunkRequest {
  /** Source text of this chunk. */
  text: string;
  /** BCP 47 code, e.g. "fr" or "zh-CN". */
  targetLanguage: string;
  /** BCP 47 code; omitted means "detect". */
  sourceLanguage?: string;
  format: DocumentFormat;
  /** Terms that must be translated exactly this way (source term → target term). */
  glossary?: Record<string, string>;
  /** The previous chunk and its translation, for consistent terminology and tone. */
  context?: { source: string; translation: string };
  signal?: AbortSignal;
}

export interface TranslateChunkResult {
  text: string;
  usage?: TokenUsage;
}

export interface ConnectionInfo {
  /** Models the server reports as available. */
  models: string[];
  endpoint: string;
  latencyMs: number;
}

export interface TranslationProvider {
  /** Stable id, e.g. "ollama". */
  readonly id: string;
  /** Human-readable name, e.g. "Ollama (local)". */
  readonly label: string;
  /** Model used for translate(). */
  readonly model: string;
  /** Probes the server; throws a TranslationError on failure. */
  checkConnection(signal?: AbortSignal): Promise<ConnectionInfo>;
  translate(request: TranslateChunkRequest): Promise<TranslateChunkResult>;
}
