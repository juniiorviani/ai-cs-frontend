export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  ssr: true,
  devServer: {
    host: '0.0.0.0',
    port: 80
  },
  modules: ['vuetify-nuxt-module'],
  runtimeConfig: {
    // Injected by the platform as an env var. Server-side only: the browser talks
    // to /api/customers/:id/analyze and Nitro proxies to the real backend, so the
    // URL also works when it is an internal (cluster) address.
    backendUrl: process.env.BACKEND_URL || '',
    public: {
      // Exposed only so the UI can tell the user whether the backend is configured.
      backendConfigured: Boolean(process.env.BACKEND_URL)
    }
  },
  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/settings.scss' }
    },
    vuetifyOptions: {
      icons: { defaultSet: 'mdi' },
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#4F46E5',
              secondary: '#0F172A',
              accent: '#0EA5E9',
              error: '#DC2626',
              warning: '#D97706',
              info: '#0284C7',
              success: '#059669',
              background: '#F5F7FB',
              surface: '#FFFFFF',
              'surface-variant': '#EEF2FF'
            }
          },
          dark: {
            dark: true,
            colors: {
              primary: '#818CF8',
              secondary: '#94A3B8',
              accent: '#38BDF8',
              error: '#F87171',
              warning: '#FBBF24',
              info: '#38BDF8',
              success: '#34D399',
              background: '#0B1120',
              surface: '#111827',
              'surface-variant': '#1E293B'
            }
          }
        }
      },
      defaults: {
        VCard: { rounded: 'lg' },
        VBtn: { rounded: 'lg' },
        VTextField: { variant: 'outlined', density: 'comfortable' },
        VSelect: { variant: 'outlined', density: 'comfortable' }
      }
    }
  },
  css: [
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/main.css'
  ],
  nitro: {
    preset: 'node-server'
  },
  vite: {
    optimizeDeps: {
      include: ['vuetify', 'vue-router', '@mdi/font']
    }
  },
  hooks: {
    'vite:extendConfig': (config) => {
      // The app is served under the platform's preview host, which varies per install
      // (the platform can run on ANY domain). The Vite dev server blocks unknown hosts
      // ("Blocked request ... is not allowed"); allow all — the preview is already gated
      // by the platform ingress/auth. Do NOT hardcode a domain here.
      config.server ??= {}
      config.server.allowedHosts = true
    }
  },
  experimental: {
    appManifest: false
  }
})
