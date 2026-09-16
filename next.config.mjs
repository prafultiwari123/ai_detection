/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@huggingface/transformers', 'onnxruntime-node'],
    outputFileTracingIncludes: {
      '/api/detect': ['./node_modules/onnxruntime-node/**/*'],
    },
  },
};

export default nextConfig;