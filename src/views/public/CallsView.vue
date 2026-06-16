<script setup>
import { ref, onMounted } from 'vue'
import { getCalls } from '@/api/calls'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const toast = useToast()
const calls = ref([])
const loading = ref(true)
const filterProgram = ref(null)
const filterStatus = ref(null)

const programOptions = [
  { label: 'All', value: null },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' }
]

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' }
]

async function fetchCalls() {
  loading.value = true
  try {
    const params = {}
    if (filterProgram.value) params.program_type = filterProgram.value
    if (filterStatus.value) params.status = filterStatus.value
    const { data } = await getCalls(params)
    calls.value = data.items
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

onMounted(fetchCalls)
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Open Calls</h2>

    <div class="flex gap-3 mb-4">
      <div class="flex flex-column gap-1">
        <label class="text-sm">Program Type</label>
        <Dropdown v-model="filterProgram" :options="programOptions" optionLabel="label" optionValue="value" @change="fetchCalls" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm">Status</label>
        <Dropdown v-model="filterStatus" :options="statusOptions" optionLabel="label" optionValue="value" @change="fetchCalls" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="calls.length" class="grid">
      <div v-for="call in calls" :key="call.id" class="col-12 md:col-6 lg:col-4">
        <div class="surface-card p-3 border-round shadow-1 h-full">
          <h3 class="mb-2">{{ call.title }}</h3>
          <div class="flex gap-2 align-items-center mb-2 flex-wrap">
            <Tag v-if="call.program" :value="call.program.type" severity="info" />
            <StatusBadge :status="call.status" />
          </div>
          <p v-if="call.organization" class="text-sm text-color-secondary mb-1">{{ call.organization.name }}</p>
          <div class="text-xs text-color-secondary mb-3">
            {{ new Date(call.start_date).toLocaleDateString() }} — {{ new Date(call.end_date).toLocaleDateString() }}
          </div>
          <router-link :to="`/calls/${call.id}`" custom v-slot="{ navigate }">
            <Button label="View details" size="small" @click="navigate" />
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No calls found.</div>
  </div>
</template>
