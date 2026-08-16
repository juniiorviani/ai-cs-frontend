<script setup lang="ts">
const { mobile } = useDisplay()
const { isDark, toggle, restore } = useThemeMode()
const { atRisk } = useCustomers()
const pageTitle = usePageTitle()

const drawer = ref(true)

onMounted(() => {
  restore()
  drawer.value = !mobile.value
})

watch(mobile, (value) => {
  drawer.value = !value
})

const nav = [
  { title: 'Overview', icon: 'mdi-view-dashboard-outline', to: '/' },
  { title: 'Customers', icon: 'mdi-account-group-outline', to: '/customers' },
  { title: 'AI Insights', icon: 'mdi-brain', to: '/insights' }
]
</script>

<template>
  <VNavigationDrawer
    v-model="drawer"
    :temporary="mobile"
    width="264"
    color="surface"
    border="0"
  >
    <div class="pa-5 d-flex align-center ga-3">
      <VAvatar color="primary" rounded="lg" size="40">
        <VIcon icon="mdi-shield-account-outline" color="white" />
      </VAvatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold" style="line-height: 1.2;">AI Customer Success</div>
        <div class="text-caption text-medium-emphasis">Churn intelligence</div>
      </div>
    </div>

    <VDivider />

    <VList nav density="comfortable" class="px-3 py-4">
      <VListItem
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
        color="primary"
      >
        <template v-if="item.to === '/customers' && atRisk.length" #append>
          <VChip size="x-small" color="error" variant="flat">{{ atRisk.length }}</VChip>
        </template>
      </VListItem>
    </VList>

    <template #append>
      <div class="pa-4">
        <VCard class="acs-gradient acs-card" flat>
          <VCardText class="py-3">
            <div class="text-caption text-medium-emphasis">Signed in as</div>
            <div class="text-body-2 font-weight-medium">Priya Raman</div>
            <div class="text-caption text-medium-emphasis">Customer Success Lead</div>
          </VCardText>
        </VCard>
      </div>
    </template>
  </VNavigationDrawer>

  <VAppBar flat color="background" height="68">
    <VAppBarNavIcon @click="drawer = !drawer" />

    <VToolbarTitle class="text-body-1 font-weight-medium">
      {{ pageTitle }}
    </VToolbarTitle>

    <VSpacer />

    <VChip
      v-if="!mobile"
      class="mr-2"
      size="small"
      variant="tonal"
      color="primary"
      prepend-icon="mdi-update"
    >
      Data synced today
    </VChip>

    <VBtn
      :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      variant="text"
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="toggle"
    />

    <VAvatar color="primary" size="36" class="mr-2">
      <span class="text-caption font-weight-bold">PR</span>
    </VAvatar>
  </VAppBar>

  <VMain style="min-height: 100vh;">
    <VContainer fluid class="pa-4 pa-md-6" style="max-width: 1440px;">
      <slot />
    </VContainer>
  </VMain>
</template>
