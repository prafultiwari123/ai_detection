export const runtime = 'nodejs';
// Give the model time to load on a cold start plus run inference over
// every line. Raise this (and check your Vercel plan's max) if you expect
// long documents.
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { splitLines, packIntoChunks } from '@/lib/chunk';
import { classifyChunk, countTokens } from '@/lib/model';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text : '';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Send some text to analyze.' }, { status: 400 });
    }

    const lines = splitLines(text);
    if (!lines.length) {
      return NextResponse.json({ error: 'No readable lines found.' }, { status: 400 });
    }

    const lineResults: { line: number; text: string; aiProbability: number; chunkCount: number }[] = [];
    let weightedSum = 0;
    let totalTokens = 0;

    for (const line of lines) {
      // Respect the model's 512-token window even if a "line" is really a
      // whole paragraph.
      const chunks = await packIntoChunks(line.text, 500);

      let lineAiSum = 0;
      let lineTokenSum = 0;

      for (const chunk of chunks) {
        const [tokenCount, { aiProbability }] = await Promise.all([
          countTokens(chunk),
          classifyChunk(chunk),
        ]);
        lineAiSum += aiProbability * tokenCount;
        lineTokenSum += tokenCount;
      }

      const lineAiProbability = lineTokenSum ? lineAiSum / lineTokenSum : 0;
      lineResults.push({
        line: line.index,
        text: line.text,
        aiProbability: Number(lineAiProbability.toFixed(4)),
        chunkCount: chunks.length,
      });

      weightedSum += lineAiProbability * lineTokenSum;
      totalTokens += lineTokenSum;
    }

    const overallAiProbability = totalTokens ? weightedSum / totalTokens : 0;

    return NextResponse.json({
      overallAiProbability: Number(overallAiProbability.toFixed(4)),
      lines: lineResults,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? 'Inference failed.' }, { status: 500 });
  }
}
