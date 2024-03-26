// https://nuxt.com/docs/api/configuration/nuxt-config
import defaultTheme from './assets/theme';
export default defineNuxtConfig({
  hooks: {
    "vite:extendConfig"(config, { isClient })  {
      config.build.rollupOptions.output.manualChunks = function (_id) {
        const chunks = {
          '@sidebase/nuxt-auth': [
            '@sidebase/nuxt-auth',
            'authjs',
            'next-auth'
          ]
        };            

        for(const [chunkName, modules] of Object.entries(chunks)) {
          if(modules.some(module => _id.includes(module))) {
            console.log(chunkName);
            return chunkName;
          }
        }
      }
    }
  },

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

  auth: {
    origin: process.env.AUTH_ORIGIN
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
