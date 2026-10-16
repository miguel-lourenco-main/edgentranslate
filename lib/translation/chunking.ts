/**
 * Splits a document into chunks at paragraph boundaries so each fits a model's context,
 * and puts the translated chunks back together with the original spacing.
 *
 * Each chunk keeps the blank lines that followed it as `separator`, so
 * `chunks.map(c => c.text + c.separator).join('')` equals the input exactly. Fenced code
 * blocks are never split. Chunks with empty `text` (leading whitespace) need no translation. A single paragraph longer than `maxChars` is split at line
 * breaks, then at sentence ends, as a last resort.
 */

export interface Chunk {
  text: string;
  /** Whitespace that followed the chunk in the source (re-used verbatim on output). */
  separator: string;
}

export const DEFAULT_MAX_CHUNK_CHARS = 2000;

interface Block {
  text: string;
  separator: string;
  /** A fenced code block: never split, even when longer than the limit. */
  fenced?: boolean;
}

/** Paragraph blocks; a fenced code block (``` or ~~~) is one block even with blank lines inside. */
function splitBlocks(input: string): Block[] {
  const blocks: Block[] = [];
  const lines = input.split(/(?<=\n)/); // keep the newline on each line
  let current = '';
  let separator = '';
  let fence: string | null = null;
  let fenced = false;

  const flush = () => {
    if (current || separator) blocks.push({ text: current, separator, fenced });
    current = '';
    separator = '';
    fenced = false;
  };

  for (const line of lines) {
    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fence) {
      current += line;
      if (fenceMatch && fenceMatch[1] === fence) fence = null;
      continue;
    }
    if (line.trim() === '') {
      // Blank line: belongs to the separator after the current block.
      if (!current) {
        if (blocks.length > 0) blocks[blocks.length - 1].separator += line;
        else separator += line;
        continue;
      }
      separator += line;
      continue;
    }
    // A fence starts a new block, and the line after a closed fence starts another.
    if (separator || (fenceMatch && current) || fenced) flush();
    if (fenceMatch) {
      fence = fenceMatch[1];
      fenced = true;
    }
    current += line;
  }
  flush();

  // A trailing newline on the last line of a block is spacing, not content.
  return blocks.map(block => {
    const trailing = /\s*$/.exec(block.text)?.[0] ?? '';
    return { ...block, text: block.text.slice(0, block.text.length - trailing.length), separator: trailing + block.separator };
  });
}

/** Splits one oversized block at line breaks, then sentence ends. */
function splitLongBlock(block: Block, maxChars: number): Block[] {
  if (block.fenced || block.text.length <= maxChars) return [block];
  const pieces: Block[] = [];
  const units = block.text.includes('\n')
    ? block.text.split(/(?<=\n)/)
    : block.text.split(/(?<=[.!?。！？])\s+/).map((s, i, all) => (i < all.length - 1 ? s + ' ' : s));

  let current = '';
  for (const unit of units) {
    if (current && current.length + unit.length > maxChars) {
      const trailing = /\s*$/.exec(current)?.[0] ?? '';
      pieces.push({ text: current.slice(0, current.length - trailing.length), separator: trailing });
      current = '';
    }
    current += unit;
  }
  pieces.push({ text: current, separator: '' });
  pieces[pieces.length - 1].separator += block.separator;
  return pieces;
}

export function chunkDocument(input: string, maxChars: number = DEFAULT_MAX_CHUNK_CHARS): Chunk[] {
  const leading = /^\s*/.exec(input)?.[0] ?? '';
  const blocks = splitBlocks(input.slice(leading.length)).flatMap(block => splitLongBlock(block, maxChars));

  const chunks: Chunk[] = [];
  let current: Chunk | null = null;
  for (const block of blocks) {
    if (current && current.text.length + current.separator.length + block.text.length <= maxChars) {
      current.text += current.separator + block.text;
      current.separator = block.separator;
    } else {
      if (current) chunks.push(current);
      current = { text: block.text, separator: block.separator };
    }
  }
  if (current) chunks.push(current);

  // Leading whitespace becomes an empty chunk, which is never sent for translation.
  if (leading) chunks.unshift({ text: '', separator: leading });
  return chunks;
}

/** Rebuilds the document from translated chunk texts, keeping the original separators. */
export function assembleChunks(chunks: Chunk[], translations: string[]): string {
  return chunks.map((chunk, i) => (translations[i] ?? chunk.text) + chunk.separator).join('');
}
