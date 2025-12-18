// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000'
    }
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
    vite: {
      plugins: [
          tailwindcss(),
      ],
    },
    css: ['./app/assets/css/main.css'],


  nitro: {
    prerender: {
      crawlLinks: false,
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/fonts'
  ]
})