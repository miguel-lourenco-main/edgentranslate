import type { TranslateChunkRequest } from './types.ts';

/** English name for a BCP 47 code ("fr" → "French", "zh-CN" → "Chinese (China)"). */
export function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** System and user messages for one chunk. Shared by every chat-style provider. */
export function buildTranslationMessages(request: TranslateChunkRequest): { system: string; user: string } {
  const target = languageName(request.targetLanguage);
  const source = request.sourceLanguage ? languageName(request.sourceLanguage) : null;

  const rules = [
    `You are a professional translator. Translate the user's text ${source ? `from ${source} ` : ''}into ${target}.`,
    'Reply with the translation only: no preamble, no notes, no quotes around it.',
    'Keep the meaning, tone and register. Translate every line, including headings and list items; do not add, drop, merge or summarise anything.',
    request.format === 'markdown'
      ? 'The text is Markdown. Keep every Markdown construct exactly (headings, lists, tables, links, emphasis, line breaks). Do not translate code blocks, inline code, URLs or HTML tags.'
      : 'Keep the line breaks and paragraph breaks of the original.',
    'Keep numbers, dates, product names and placeholders such as {name} or %s unchanged unless the target language requires another format.',
  ];

  const glossaryEntries = Object.entries(request.glossary ?? {});
  if (glossaryEntries.length > 0) {
    rules.push(
      'Always use this glossary (source → target):\n' +
        glossaryEntries.map(([from, to]) => `- ${from} → ${to}`).join('\n'),
    );
  }

  if (request.context) {
    rules.push(
      'For consistency, this is the passage just before the text, with the translation already used. Do not translate it again.\n' +
        `<previous_source>\n${request.context.source}\n</previous_source>\n` +
        `<previous_translation>\n${request.context.translation}\n</previous_translation>`,
    );
  }

  return { system: rules.join('\n\n'), user: request.text };
}

/**
 * Removes wrappers small models sometimes add despite the instructions: a <think> block
 * and a single fence around the whole reply when the source was not fenced.
 */
export function cleanModelOutput(output: string, source: string): string {
  let text = output.replace(/^\s*<think>[\s\S]*?<\/think>\s*/i, '');
  const fenced = /^```[\w-]*\n([\s\S]*?)\n```\s*$/.exec(text.trim());
  if (fenced && !source.trim().startsWith('```')) text = fenced[1];
  return text.trim();
}

/** Markdown heading, list and table lines: these must survive translation one for one. */
function structureSignature(text: string): string {
  return text
    .split(/\r?\n/)
    .map(line => (/^\s{0,3}#{1,6}\s/.test(line) ? '#' : /^\s*([-*+]|\d+[.)])\s/.test(line) ? '-' : /^\s*\|/.test(line) ? '|' : ''))
    .filter(Boolean)
    .join('');
}

/** Whether a Markdown translation kept the source's headings, list items and table rows. */
export function keepsMarkdownStructure(source: string, translation: string): boolean {
  return structureSignature(source) === structureSignature(translation);
}
