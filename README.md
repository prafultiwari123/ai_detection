# AI Line Detector

A Next.js app that runs your fine-tuned RoBERTa AI-text-detector fully inside
Vercel serverless functions (via [transformers.js](https://huggingface.co/docs/transformers.js),
no separate Python backend). It splits pasted text into lines, keeps every
model call under the 512-token limit (auto-chunking any line that's too
long), and reports a per-line AI probability plus one overall document
score.

## How it works

- `app/page.tsx` — the UI: textarea in, margin-annotated lines + overall
  meter out.
- `app/api/detect/route.ts` — Node.js serverless function that does the
  actual inference.
- `lib/chunk.ts` — splits input into lines, and re-chunks any line over
  ~500 tokens on sentence, then word, boundaries.
- `lib/model.ts` — loads your ONNX model + tokenizer once per warm
  instance, runs inference, and picks out the "AI" probability from the
  model's output labels.

The per-line score is a **token-weighted average** of its chunk scores (a
line almost never needs more than one chunk). The document-level score is
the token-weighted average across all lines — so a 40-word line counts more
than a 3-word line, which is usually what you want.

## 1. Convert your fine-tuned model to ONNX

transformers.js needs ONNX weights, not a raw PyTorch checkpoint. From a
machine with Python + your checkpoint (local folder or a private HF Hub
repo):

```bash
git clone https://github.com/huggingface/transformers.js
cd transformers.js
pip install -r scripts/requirements.txt

python -m scripts.convert \
  --quantize \
  --model_id /path/to/your/checkpoint-or-hub-id \
  --task text-classification
```

This produces a `models/<your-model>/` folder laid out the way
transformers.js expects (`config.json`, tokenizer files, and an `onnx/`
folder with `model.onnx` plus a quantized variant). The exact flags shift
between versions, so check that repo's README if this fails — the key
requirement is just: **ONNX weights + tokenizer files in the transformers.js
layout**.

Then push that folder to a new Hugging Face Hub repo:

```bash
huggingface-cli login
huggingface-cli upload your-username/your-roberta-ai-detector-onnx models/<your-model> .
```

Double-check `config.json`'s `id2label` — e.g. `{"0": "human", "1": "ai"}`.
`lib/model.ts` looks for a label containing a word like "ai" / "generated" /
"machine" and uses that as the AI probability. If your labels are generic
(`LABEL_0`/`LABEL_1`), set `AI_LABEL_INDEX` instead (see `.env.example`).

## 2. Configure

```bash
cp .env.example .env.local
# edit .env.local: set HF_MODEL_ID to the repo you just pushed
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, paste some text, hit Analyze. The first request
will be slow (downloading + loading the model); after that it's cached
in-process.

## 4. Deploy to Vercel

```bash
npm install -g vercel   # if you don't have it
vercel login
vercel                  # first deploy, follow the prompts
vercel --prod           # promote to production
```

Or push this folder to a GitHub repo and import it at
https://vercel.com/new — either way you get a `your-project.vercel.app`
domain automatically.

**Set the same environment variables in the Vercel dashboard** under
Project → Settings → Environment Variables (`HF_MODEL_ID`, `MODEL_DTYPE`,
and `AI_LABEL_INDEX` if you're using it) — `.env.local` is not deployed.

## Notes & tuning

- **Cold starts**: each cold serverless instance downloads the model from
  the HF Hub into `/tmp` before it can answer. A quantized RoBERTa-base
  model is roughly 60–100MB, which is a few seconds over a cold start. If
  that's too slow, bundle the ONNX files directly into the repo (under a
  `models/` folder) and set `env.localModelPath` / `env.allowRemoteModels =
  false` in `lib/model.ts` instead — no network call, but the deploy bundle
  gets bigger, so check it stays under Vercel's 250MB unzipped function
  limit.
- **Timeouts**: `maxDuration = 60` in `route.ts` needs a Vercel plan that
  allows it (Hobby is capped lower by default). For very long pasted
  documents, either raise your plan or batch lines client-side.
- **Accuracy caveat to put in your own UI copy**: any single-model AI
  detector — including RoBERTa-based ones — has a real false-positive rate,
  especially on short lines (a few words rarely carry enough signal). Treat
  the per-line percentages as a signal to investigate, not a verdict.
