import { countTokens } from './model';

export interface Line {
  index: number;
  text: string;
}

export function splitLines(raw: string): Line[] {
  return raw
    .split(/\r?\n/)
    .map((text, index) => ({ index, text }))
    .filter((l) => l.text.trim().length > 0);
}

// Splits on sentence-ending punctuation followed by a capital/number/quote,
// which is a reasonable heuristic without pulling in a full NLP sentence
// tokenizer.
const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+(?=[A-Z0-9"'(])/;

export function splitIntoSentences(text: string): string[] {
  const parts = text
    .split(SENTENCE_SPLIT_RE)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}

/**
 * The model's context window is 512 tokens. Most "lines" (sentences,
 * bullet points, paragraph lines) will fit in a single pass, but a long
 * paragraph pasted as one line won't. This packs a line into the fewest
 * possible sub-chunks that each fit under maxTokens, splitting on sentence
 * boundaries first and falling back to word boundaries for any single
 * run-on sentence that's still too long.
 */
export async function packIntoChunks(text: string, maxTokens = 500): Promise<string[]> {
  const total = await countTokens(text);
  if (total <= maxTokens) return [text];

  const sentences = splitIntoSentences(text);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const sentenceTokens = await countTokens(sentence);

    if (sentenceTokens > maxTokens) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      const words = sentence.split(' ');
      let sub = '';
      for (const word of words) {
        const candidate = sub ? `${sub} ${word}` : word;
        if ((await countTokens(candidate)) > maxTokens) {
          if (sub) chunks.push(sub);
          sub = word;
        } else {
          sub = candidate;
        }
      }
      if (sub) chunks.push(sub);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if ((await countTokens(candidate)) > maxTokens) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
