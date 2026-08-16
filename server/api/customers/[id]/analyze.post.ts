/**
 * Proxies the churn analysis request to the real backend defined by BACKEND_URL.
 *
 * The call is proxied instead of being made straight from the browser because
 * BACKEND_URL is frequently an internal address that is only reachable from the
 * server side.
 */
export default defineEventHandler(async (event) => {
  const { backendUrl } = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')

  if (!backendUrl) {
    throw createError({
      statusCode: 503,
      statusMessage: 'BACKEND_URL is not configured for this app.'
    })
  }

  const body = await readBody(event).catch(() => ({}))
  const target = `${backendUrl.replace(/\/+$/, '')}/customers/${encodeURIComponent(id ?? '')}/analyze`

  try {
    return await $fetch(target, {
      method: 'POST',
      body: body ?? {},
      timeout: 60_000
    })
  } catch (error: any) {
    const statusCode = error?.response?.status ?? 502
    const upstream = error?.data ?? error?.response?._data
    const detail =
      (typeof upstream === 'string' ? upstream : upstream?.message || upstream?.error) ||
      error?.message ||
      'Unknown error'

    throw createError({
      statusCode,
      statusMessage: `Churn analysis backend failed: ${detail}`,
      data: { target, upstream }
    })
  }
})
