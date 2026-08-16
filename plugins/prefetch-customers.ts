import type { Customer } from '~/composables/useCustomers'

/**
 * Primes the shared 'customers-list' useAsyncData cache before any page
 * renders. Nuxt awaits plugin promises (both SSR and CSR) before mounting,
 * so every page's synchronous reads (getCustomer, computed stats) are safe
 * the moment useCustomers() is called - no separate loading state needed
 * per page.
 */
export default defineNuxtPlugin(async () => {
  await useAsyncData<Customer[]>(
    'customers-list',
    () => $fetch<Customer[]>('/api/customers'),
    { default: () => [] }
  )
})
