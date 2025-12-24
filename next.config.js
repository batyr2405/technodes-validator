/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ВАЖНО: запрещаем static export
  output: "standalone",

  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
