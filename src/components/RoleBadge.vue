<script setup>
import { computed } from 'vue'

const props = defineProps({
  role: { type: String, required: true }
})

const severity = computed(() => {
  const map = {
    student: 'info',
    team_leader: 'info',
    firm: 'warn',
    mentor: 'success',
    evaluator: 'warn',
    nti_admin: 'danger',
    super_admin: 'danger',
    content_editor: 'secondary'
  }
  return map[props.role] || 'secondary'
})
</script>

<template>
  <Tag :value="role" :severity="severity" />
</template>
