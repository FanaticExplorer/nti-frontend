<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCall } from '@/api/calls'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const call = ref(null)
const loading = ref(true)

const canApply = computed(() => {
  if (!auth.isLoggedIn) return false
  return ['student', 'team_leader'].includes(auth.userRole)
})

onMounted(async () => {
  try {
    const { data } = await getCall(route.params.id)
    call.value = data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4">
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="call">
      <router-link to="/calls" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Calls
      </router-link>
      <div class="surface-card p-4 border-round shadow-1">
        <div class="flex align-items-center gap-2 mb-3 flex-wrap">
          <Tag v-if="call.program" :value="call.program.type" severity="info" />
          <StatusBadge :status="call.status" />
        </div>
        <h1 class="text-2xl mb-3">{{ call.title }}</h1>
        <p class="text-color-secondary mb-4">{{ call.description }}</p>

        <div v-if="call.technical_spec" class="mb-3">
          <h3 class="text-lg font-bold">Technical Specification</h3>
          <p class="text-color-secondary">{{ call.technical_spec }}</p>
        </div>
        <div v-if="call.budget" class="mb-3">
          <h3 class="text-lg font-bold">Budget</h3>
          <p class="text-color-secondary">{{ call.budget }}</p>
        </div>
        <div class="flex gap-4 text-sm text-color-secondary mb-4">
          <span>Start: {{ new Date(call.start_date).toLocaleDateString() }}</span>
          <span>End: {{ new Date(call.end_date).toLocaleDateString() }}</span>
        </div>

        <div v-if="canApply">
          <router-link :to="`/student/applications/new?call_id=${call.id}`" class="p-button no-underline">Apply for this call</router-link>
        </div>
        <div v-else-if="!auth.isLoggedIn" class="p-3 surface-ground border-round">
          <p class="m-0">
            <router-link to="/login">Login</router-link> or
            <router-link to="/register">register</router-link> as a student to apply.
          </p>
        </div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Call not found.</div>
  </div>
</template>
