import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register:true,
});
      
export default withPWA({

    webpack: (config) => {
      config.resolve.alias.canvas = false;
   
      return config;
    },

  basePath:"/gymbuddy",
  assetPrefix: "/gymbuddy/",
  images: {
    unoptimized: true,
  },

});