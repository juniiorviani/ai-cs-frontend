/**
 * Proxies the customer catalogue from the real backend defined by BACKEND_URL.
 * Server-side only: BACKEND_URL can be an internal address.
 */
export default defineEventHandler(async (event) => {
  const { backendUrl } = useRuntimeConfig(event)

  if (!backendUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BACKEND_URL is not configured for this app.'
    })
  }

  const target = `${backendUrl.replace(/\/+$/, '')}/customers`

  try {
    return await $fetch(target, { method: 'GET', timeout: 30_000 })
  } catch (error: any) {
    const statusCode = error?.response?.status ?? 502
    const upstream = error?.data ?? error?.response?._data
    const detail =
      (typeof upstream === 'string' ? upstream : upstream?.message || upstream?.error) ||
      error?.message ||
      'Unknown error'

    throw createError({
      statusCode,
      statusMessage: `Customer catalogue backend failed: ${detail}`,
      data: { target, upstream }
    })
  }
})
