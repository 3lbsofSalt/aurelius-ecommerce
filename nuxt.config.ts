// https://nuxt.com/docs/api/configuration/nuxt-config
import defaultTheme from './assets/theme';
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    GITHUB_CLIENT_ID: 'dummy',
    GITHUB_CLIENT_SECRET: 'dummy',
    MONGODB_URL: 'dummy',
    MONGODB_NAME: 'dummy'
  },

  css: [
    '~/assets/variables.scss'
  ],

  modules: [
    '@pinia/nuxt',
    'vuetify-nuxt-module',
    '@sidebase/nuxt-auth',
    'nuxt-mongoose'
  ],

  vuetify: {
    moduleOptions: {

    },
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa',
        sets: [{
          name: 'fa',
          cdn: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css'
        }]
      },
      theme: {
        defaultTheme: 'defaultTheme',
        themes: {
          defaultTheme
        }
      }
    }
  }
})
