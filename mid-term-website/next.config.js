/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    domains: ["images.unsplash.com"],
  },
};

module.exports = nextConfig;

