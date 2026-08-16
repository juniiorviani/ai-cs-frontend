const STORAGE_KEY = 'acs-theme'

export function useThemeMode() {
  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)

  function apply(name: 'light' | 'dark') {
    theme.global.name.value = name
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, name)
  }

  function toggle() {
    apply(isDark.value ? 'light' : 'dark')
  }

  function restore() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') {
      theme.global.name.value = saved
      return
    }
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      theme.global.name.value = 'dark'
    }
  }

  return { isDark, toggle, apply, restore }
}
