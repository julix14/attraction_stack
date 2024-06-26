// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      version: process.env.TOOL_VERSION,
    },
  },
  devtools: { enabled: true },
  ssr: false,

  routeRules: { "/add-attraction": { ssr: true } },
  modules: ["@nuxt/ui", "nuxt-vuefire"],

  vuefire: {
    auth: {
      enabled: true,
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    appCheck: {
      debug: process.env.NODE_ENV !== "production",
      isTokenAutoRefreshEnabled: true,
      provider: "ReCaptchaEnterprise",
      key: "6LcKHMopAAAAAHfazxKPus78WHpM4hZ1Q0GStd6G",
    },
  },
  nitro: {
    firebase: {
      gen: 2,
    },
  },
});
