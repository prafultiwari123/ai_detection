'use client';

import { useState } from 'react';

type LineResult = {
  line: number;
  text: string;
  aiProbability: number;
  chunkCount: number;
};

type SuccessResponse = {
  overallAiProbability: number;
  lines: LineResult[];
};

export default function Page() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuccessResponse | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResult(data as SuccessResponse);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 sm:py-24">
      <p className="font-mono text-xs uppercase tracking-wide text-stone-500">Line-by-line authorship</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-stone-100 sm:text-5xl">
        Read between the lines.
      </h1>
      <p className="mt-4 max-w-xl text-stone-400">
        Paste a passage below. Each line gets marked in the margin — red for the lines that
        read as machine-written, green for the ones that read human — plus one number for
        the whole document.
      </p>

      <div className="mt-10 rounded-sm border border-stone-700 bg-[#faf9f4] p-1 shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text here, one line or sentence per row..."
          className="h-64 w-full resize-y bg-transparent p-5 font-serif text-[15px] leading-7 text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="rounded-sm bg-[#c23b2e] px-5 py-2.5 font-mono text-sm text-stone-50 transition hover:bg-[#a92f24] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Reading…' : 'Analyze'}
        </button>
        <span className="font-mono text-xs text-stone-500">
          {input.split(/\r?\n/).filter((l) => l.trim()).length} lines
        </span>
        {error && <p className="font-mono text-sm text-[#e2685c]">{error}</p>}
      </div>

      {result && (
        <section className="mt-14 border-t border-stone-800 pt-10">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xs uppercase tracking-wide text-stone-500">Overall verdict</p>
            <p className="font-mono text-xs text-stone-500">{result.lines.length} lines analyzed</p>
          </div>

          <div className="mt-3 flex items-end gap-4">
            <span className="font-serif text-6xl text-stone-100">
              {Math.round(result.overallAiProbability * 100)}%
            </span>
            <span className="mb-2 text-stone-400">likely AI-written</span>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
            <div
              className="h-full bg-gradient-to-r from-[#2fa89a] to-[#c23b2e]"
              style={{ width: `${Math.round(result.overallAiProbability * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-stone-500">
            <span>human</span>
            <span>ai</span>
          </div>

          <div className="mt-12">
            {result.lines.map((l) => {
              const pct = Math.round(l.aiProbability * 100);
              const isAi = l.aiProbability >= 0.5;
              const color = isAi ? '#c23b2e' : '#2fa89a';
              return (
                <div
                  key={l.line}
                  className="flex gap-4 border-l-2 py-3 pl-4"
                  style={{ borderColor: color }}
                >
                  <span className="w-12 shrink-0 pt-0.5 font-mono text-xs" style={{ color }}>
                    {pct}%
                  </span>
                  <p className="flex-1 font-serif text-[15px] leading-7 text-stone-200">{l.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
