/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  cleanDistDir: true,
  output: "standalone",
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
