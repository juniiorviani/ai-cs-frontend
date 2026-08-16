<script setup lang="ts">
defineProps<{
  stage: string
  company: string
}>()
</script>

<template>
  <VCard class="acs-card acs-gradient" elevation="0">
    <VCardText class="pa-8 text-center">
      <div class="acs-thinking mb-6">
        <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="Analyzing">
          <circle class="acs-pulse-ring" cx="70" cy="70" r="46" fill="none" stroke="rgb(var(--v-theme-primary))" stroke-width="2" />
          <circle class="acs-pulse-ring acs-pulse-ring--delay-1" cx="70" cy="70" r="46" fill="none" stroke="rgb(var(--v-theme-primary))" stroke-width="2" />
          <circle class="acs-pulse-ring acs-pulse-ring--delay-2" cx="70" cy="70" r="46" fill="none" stroke="rgb(var(--v-theme-accent))" stroke-width="2" />
          <circle cx="70" cy="70" r="34" fill="rgb(var(--v-theme-primary))" opacity="0.12" />
        </svg>
        <VIcon icon="mdi-brain" size="40" color="primary" class="acs-thinking__icon" />
      </div>

      <div class="text-h6 font-weight-bold mb-1">
        Analyzing {{ company }}
      </div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        {{ stage }}
        <span class="acs-typing"><span>.</span><span>.</span><span>.</span></span>
      </div>

      <VProgressLinear indeterminate color="primary" rounded height="6" class="mx-auto" style="max-width: 320px;" />
    </VCardText>
  </VCard>
</template>

<style scoped>
.acs-thinking {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
}

.acs-thinking__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
