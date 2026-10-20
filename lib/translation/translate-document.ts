import { assembleChunks, chunkDocument, DEFAULT_MAX_CHUNK_CHARS } from './chunking.ts';
import { cancelledError } from './errors.ts';
import { keepsMarkdownStructure } from './prompt.ts';
import type { DocumentFormat, TokenUsage, TranslationProvider } from './types.ts';

export interface TranslateDocumentOptions {
  provider: TranslationProvider;
  text: string;
  format: DocumentFormat;
  targetLanguage: string;
  sourceLanguage?: string;
  glossary?: Record<string, string>;
  maxChunkChars?: number;
  /** Characters of the previous chunk (source and translation) sent as context. */
  contextChars?: number;
  signal?: AbortSignal;
  onProgress?: (progress: TranslationProgress) => void;
  /** Non-fatal problems, e.g. a chunk whose Markdown structure changed after a retry. */
  onWarning?: (message: string) => void;
}

export interface TranslationProgress {
  /** Chunks finished so far. */
  done: number;
  total: number;
  usage: TokenUsage;
  /** Milliseconds the last chunk took. */
  lastChunkMs: number;
}

export interface TranslateDocumentResult {
  text: string;
  chunks: number;
  usage: TokenUsage;
}

function tail(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(text.length - maxChars);
  // Start at a line or word boundary so the context does not open mid-word.
  const boundary = cut.search(/\s/);
  return boundary >= 0 ? cut.slice(boundary + 1) : cut;
}

/** A Markdown chunk that is only a fenced code block is kept as is. */
function needsTranslation(text: string, format: DocumentFormat): boolean {
  const trimmed = text.trim();
  if (trimmed === '') return false;
  if (format !== 'markdown') return true;
  // Exactly one fence: opens on the first line, closes on the last, none in between.
  const lines = trimmed.split(/\r?\n/);
  const fenceLines = lines.filter(line => /^\s*(```|~~~)/.test(line)).length;
  const isOnlyCode = lines.length >= 2 && fenceLines === 2 && /^\s*(```|~~~)/.test(lines[0]) && /^\s*(```|~~~)\s*$/.test(lines[lines.length - 1]);
  return !isOnlyCode;
}

/**
 * Translates a text document chunk by chunk, in order, carrying the previous chunk and
 * its translation as context so terminology stays consistent across chunks.
 */
export async function translateDocument(options: TranslateDocumentOptions): Promise<TranslateDocumentResult> {
  const chunks = chunkDocument(options.text, options.maxChunkChars ?? DEFAULT_MAX_CHUNK_CHARS);
  const contextChars = options.contextChars ?? 600;
  const translatable = chunks.filter(c => needsTranslation(c.text, options.format)).length;

  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  const translations: string[] = [];
  // Tail of the last translated chunk, passed to the next request as context.
  let previous: { source: string; translation: string } | undefined;
  let done = 0;

  for (const chunk of chunks) {
    if (options.signal?.aborted) throw cancelledError();
    if (!needsTranslation(chunk.text, options.format)) {
      translations.push(chunk.text);
      continue;
    }

    const started = Date.now();
    const request = {
      text: chunk.text,
      format: options.format,
      targetLanguage: options.targetLanguage,
      sourceLanguage: options.sourceLanguage,
      glossary: options.glossary,
      context: previous,
      signal: options.signal,
    };
    let result = await options.provider.translate(request);
    let chunkUsage = { inputTokens: result.usage?.inputTokens ?? 0, outputTokens: result.usage?.outputTokens ?? 0 };

    // Small models sometimes drop a heading or merge list items. Retry once; if the
    // structure still differs, keep the second answer and warn.
    if (options.format === 'markdown' && !keepsMarkdownStructure(chunk.text, result.text)) {
      result = await options.provider.translate(request);
      chunkUsage = {
        inputTokens: chunkUsage.inputTokens + (result.usage?.inputTokens ?? 0),
        outputTokens: chunkUsage.outputTokens + (result.usage?.outputTokens ?? 0),
      };
      if (!keepsMarkdownStructure(chunk.text, result.text)) {
        options.onWarning?.(`Chunk ${done + 1}: headings, list items or table rows differ from the source after a retry; check this part of the output.`);
      }
    }

    translations.push(result.text);
    usage.inputTokens += chunkUsage.inputTokens;
    usage.outputTokens += chunkUsage.outputTokens;
    previous = { source: tail(chunk.text, contextChars), translation: tail(result.text, contextChars) };
    done += 1;
    options.onProgress?.({ done, total: translatable, usage: { ...usage }, lastChunkMs: Date.now() - started });
  }

  return { text: assembleChunks(chunks, translations), chunks: translatable, usage };
}
