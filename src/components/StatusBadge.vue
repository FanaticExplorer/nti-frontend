<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const severity = computed(() => {
  const map = {
    draft: 'secondary',
    submitted: 'info',
    formally_verified: 'info',
    under_evaluation: 'warn',
    revision_requested: 'warn',
    approved: 'success',
    rejected: 'danger',
    onboarding: 'success',
    active: 'success',
    paused: 'warn',
    completed: 'success',
    archived: 'secondary'
  }
  return map[props.status] || 'secondary'
})
</script>

<template>
  <Tag :value="status" :severity="severity" />
</template>
