import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  fallbacks: {
    document: '/~offline', // Fallback for all page requests
  },
  runtimeCaching: [
    {
      urlPattern: /.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'network-only',
        networkTimeoutSeconds: 10,
        plugins: [
          {
            cacheWillUpdate: async ({ request, response, event }) => {
              if (!response || response.status !== 200) {
                return caches.match('/~offline');
              }
              return response;
            },
          },
        ],
      },
    },
  ],
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