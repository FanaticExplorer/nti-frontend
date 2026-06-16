<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute } from 'vue-router'
import { getProgram } from '@/api/programs'
import { getCalls } from '@/api/calls'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()
const { signal } = useAbortController()
const program = ref(null)
const calls = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [progRes, callsRes] = await Promise.all([
      getProgram(route.params.id),
      getCalls({ program_id: route.params.id }, { signal })
    ])
    program.value = progRes.data
    calls.value = callsRes.data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
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
    <template v-else-if="program">
      <router-link to="/programs" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Programs
      </router-link>
      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <div class="flex align-items-center gap-2 mb-3">
          <Tag :value="program.type" severity="info" />
          <h1 class="m-0 text-2xl">{{ program.title }}</h1>
        </div>
        <p class="text-color-secondary">{{ program.description }}</p>
        <div v-if="program.rules" class="mt-3">
          <h3 class="text-lg font-bold">Rules</h3>
          <p class="text-color-secondary">{{ program.rules }}</p>
        </div>
      </div>

      <h2 class="text-xl mb-3">Open Calls</h2>
      <div v-if="calls.length" class="grid">
        <div v-for="call in calls" :key="call.id" class="col-12 md:col-6">
          <div class="surface-card p-3 border-round shadow-1">
            <h3 class="mb-2">{{ call.title }}</h3>
            <div class="flex gap-2 align-items-center mb-2">
              <StatusBadge :status="call.status" />
              <small class="text-color-secondary">Ends: {{ new Date(call.end_date).toLocaleDateString() }}</small>
            </div>
            <router-link :to="`/calls/${call.id}`" class="p-button p-button-text p-button-sm no-underline">View details</router-link>
          </div>
        </div>
      </div>
      <div v-else class="text-color-secondary">No open calls for this program.</div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Program not found.</div>
  </div>
</template>
