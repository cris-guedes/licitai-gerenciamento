import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@xenova/transformers",
    "onnxruntime-node",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@xenova/transformers/**/*",
      "./node_modules/onnxruntime-node/**/*",
    ],
  },
};

export default nextConfig;
