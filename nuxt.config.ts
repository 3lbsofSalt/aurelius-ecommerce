// https://nuxt.com/docs/api/configuration/nuxt-config
import defaultTheme from './theme';
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    GITHUB_CLIENT_ID: 'dummy',
    GITHUB_CLIENT_SECRET: 'dummy',
    MONGODB_URL: 'dummy',
    MONGODB_NAME: 'dummy'
  },

  typescript: {
    shim: false
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

  mongoose: {
    uri: process.env.MONGODB_URL + '/' + process.env.DATABASE_NAME
  },

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
