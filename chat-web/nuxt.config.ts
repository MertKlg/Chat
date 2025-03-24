
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules : [
    'usebootstrap',
    '@pinia/nuxt',
    [
      '@vee-validate/nuxt',
      {
        autoImports: true,
        componentNames: {
          Form: 'VeeForm',
          Field: 'VeeField',
          FieldArray: 'VeeFieldArray',
          ErrorMessage: 'VeeErrorMessage',
        },
      },
    ],
  ],

  app :{
    head : {
      link : [
        {
          href : "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
          rel : "stylesheet"
        }
      ]
    }
  },

  runtimeConfig : {
    public : {
      BASE_URL : "http://localhost:8080",
      API_URL : `http://localhost:8080/api/v1`,
      STORAGE : `http://localhost:8080/storage/`,
      FILE_SIZE : (1 * 1024 * 1024 * 4 / 3)
    }
  }

})
