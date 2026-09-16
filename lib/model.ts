import { AutoTokenizer, AutoModelForSequenceClassification, env } from '@huggingface/transformers';

// Vercel's serverless filesystem is read-only except /tmp — cache downloaded
// model files there so repeat calls within the same warm instance are fast.
env.cacheDir = '/tmp/.transformers-cache';
env.allowRemoteModels = true;

// Point this at YOUR fine-tuned model, exported to ONNX and pushed to the
// Hugging Face Hub (see README.md for the conversion steps). You can override
// it per-environment from the Vercel dashboard without touching code.
const MODEL_ID = process.env.HF_MODEL_ID || 'your-username/your-roberta-ai-detector-onnx';

// "q8" (8-bit) is a good default: much smaller/faster than fp32 with a small
// accuracy hit. Use "fp32" if your ONNX export doesn't include a quantized
// weight file. See README.md.
const DTYPE = (process.env.MODEL_DTYPE as 'fp32' | 'fp16' | 'q8' | 'q4') || 'q8';

type Tokenizer = Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>>;
type Model = Awaited<ReturnType<typeof AutoModelForSequenceClassification.from_pretrained>>;

let tokenizerPromise: Promise<Tokenizer> | null = null;
let modelPromise: Promise<Model> | null = null;

export function getTokenizer(): Promise<Tokenizer> {
  if (!tokenizerPromise) tokenizerPromise = AutoTokenizer.from_pretrained(MODEL_ID);
  return tokenizerPromise;
}

export function getModel(): Promise<Model> {
  if (!modelPromise) {
    modelPromise = AutoModelForSequenceClassification.from_pretrained(MODEL_ID, { dtype: DTYPE });
  }
  return modelPromise;
}

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// Figures out which label/logit corresponds to "AI-written". Works
// automatically if your config.json's id2label contains a recognizable word
// (ai / generated / machine / gpt / synthetic / llm). If your labels are
// generic (LABEL_0 / LABEL_1), set AI_LABEL_INDEX in the environment instead.
function pickAiProbability(scores: { label: string; score: number }[]): number {
  const aiMatch = scores.find((s) => /ai|fake|generated|machine|gpt|synthetic|llm/i.test(s.label));
  if (aiMatch) return aiMatch.score;
  const fallbackIndex = Number(process.env.AI_LABEL_INDEX ?? 1);
  return scores[fallbackIndex]?.score ?? scores[scores.length - 1].score;
}

export async function classifyChunk(text: string) {
  const [tokenizer, model] = await Promise.all([getTokenizer(), getModel()]);
  const inputs = await tokenizer(text, { truncation: true, max_length: 512 });
  const output: any = await model(inputs);

  const logitsData = Array.from(output.logits.data as Float32Array | number[]);
  const probs = softmax(logitsData as number[]);

  const id2label: Record<string, string> = (model as any).config?.id2label ?? {};
  const scores = probs.map((score, i) => ({
    label: id2label[i] ?? id2label[String(i)] ?? `LABEL_${i}`,
    score,
  }));

  return { aiProbability: pickAiProbability(scores), scores };
}

export async function countTokens(text: string): Promise<number> {
  const tokenizer = await getTokenizer();
  const encoded: any = await tokenizer(text, { add_special_tokens: false });
  const dims = encoded.input_ids?.dims;
  return dims ? dims[dims.length - 1] : encoded.input_ids?.data?.length ?? 0;
}
