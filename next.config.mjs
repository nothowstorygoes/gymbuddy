import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  fallbacks: {
    document: "/~offline",
  },
});

export default withPWA({
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  output: "export",
  basePath: "/gymbuddy",
  assetPrefix: "/gymbuddy/",
  images: {
    unoptimized: true,
  },
});