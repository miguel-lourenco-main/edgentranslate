import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assembleChunks, chunkDocument } from './chunking.ts';

const roundTrip = (input: string, max?: number) => {
  const chunks = chunkDocument(input, max);
  return assembleChunks(chunks, chunks.map(c => c.text));
};

describe('chunkDocument', () => {
  it('reassembles the input exactly', () => {
    const inputs = [
      '',
      'one line',
      'one line\n',
      '\n\n  leading blank lines\n\nsecond\n\n\n\nthird\n',
      '# Title\n\nPara one.\nStill para one.\n\n- a\n- b\n\n```js\nconst x = 1;\n\nconst y = 2;\n```\n\nEnd.',
      'a\r\n\r\nb\r\n',
      'text\n```\ncode\n```\nmore text\n',
    ];
    for (const input of inputs) {
      for (const max of [5, 20, 2000]) {
        assert.equal(roundTrip(input, max), input, JSON.stringify({ input, max }));
      }
    }
  });

  it('never ends a chunk on a heading', () => {
    const input = 'Intro paragraph that fills the chunk.\n\n### Section\n\nBody of the section.\n\n## Last\n';
    const chunks = chunkDocument(input, 50);
    for (const chunk of chunks.slice(0, -1)) {
      const lastLine = chunk.text.split('\n').pop() ?? '';
      assert.doesNotMatch(lastLine, /^#{1,6}\s/, JSON.stringify(chunks));
    }
    assert.ok(chunks.some(c => c.text.startsWith('### Section\n\nBody of the section.')), JSON.stringify(chunks));
    assert.equal(roundTrip(input, 50), input);
  });

  it('groups paragraphs up to the size limit', () => {
    const chunks = chunkDocument('aaaa\n\nbbbb\n\ncccc\n\ndddd', 12);
    assert.deepEqual(chunks.map(c => c.text), ['aaaa\n\nbbbb', 'cccc\n\ndddd']);
  });

  it('never splits a fenced code block', () => {
    const code = '```\nline 1\n\nline 2\n\nline 3\n```';
    const chunks = chunkDocument(`intro\n\n${code}\n\noutro`, 10);
    assert.ok(chunks.some(c => c.text === code), JSON.stringify(chunks));
  });

  it('separates a fence from text directly before and after it', () => {
    const chunks = chunkDocument('before\n```\ncode\n```\nafter', 8);
    assert.deepEqual(chunks.map(c => c.text), ['before', '```\ncode\n```', 'after']);
  });

  it('splits one oversized paragraph at sentence ends', () => {
    const paragraph = 'First sentence here. Second sentence here. Third sentence here.';
    const chunks = chunkDocument(paragraph, 25);
    assert.ok(chunks.length >= 3);
    assert.ok(chunks.every(c => c.text.length <= 25), JSON.stringify(chunks));
    assert.equal(roundTrip(paragraph, 25), paragraph);
  });

  it('keeps leading whitespace out of the text sent for translation', () => {
    const chunks = chunkDocument('\n\nHello');
    assert.deepEqual(chunks[0], { text: '', separator: '\n\n' });
    assert.equal(chunks[1].text, 'Hello');
  });
});
