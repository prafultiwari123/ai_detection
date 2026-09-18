/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'onnxruntime-common'],
  outputFileTracingIncludes: {
    '/api/detect': [
      './node_modules/onnxruntime-node/**/*',
      './node_modules/onnxruntime-common/**/*',
      './node_modules/@huggingface/transformers/**/*',
    ],
  },
};

export default nextConfig;