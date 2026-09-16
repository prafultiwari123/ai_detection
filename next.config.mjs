/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Don't let webpack try to bundle the ONNX runtime / transformers.js —
    // let Node load them natively at runtime instead.
    serverComponentsExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
  },
};

export default nextConfig;
