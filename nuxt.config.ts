// https://nuxt.com/docs/api/configuration/nuxt-config
import defaultTheme from './assets/theme';
export default defineNuxtConfig({
  devtools: { enabled: true },

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
