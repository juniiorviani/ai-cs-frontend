/**
 * Shared toolbar title. The layout renders it and each page sets it, since
 * pages cannot pass slots to the layout through <NuxtPage />.
 */
export function usePageTitle(title?: string) {
  const pageTitle = useState<string>('page-title', () => 'Customer Success Console')

  if (title) {
    pageTitle.value = title
    useHead({ title: `${title} · AI Customer Success` })
  }

  return pageTitle
}
