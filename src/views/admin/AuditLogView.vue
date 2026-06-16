<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getAuditLog } from '@/api/admin'
import { useToast } from 'primevue/usetoast'

const logs = ref([])
const loading = ref(true)
const filterAction = ref('')
const filterDateFrom = ref(null)
const filterDateTo = ref(null)

const expandedRows = ref([])
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchLogs)

async function fetchLogs() {
  loading.value = true
  try {
    const params = {}
    if (filterAction.value) params.action = filterAction.value
    if (filterDateFrom.value) params.date_from = filterDateFrom.value.toISOString().split('T')[0]
    if (filterDateTo.value) params.date_to = filterDateTo.value.toISOString().split('T')[0]
    const { data } = await getAuditLog(params, { signal })
    logs.value = data.items
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Audit Log</h2>

    <div class="flex gap-3 align-items-end mb-4 flex-wrap">
      <div class="flex flex-column gap-1">
        <label class="text-sm">Action</label>
        <InputText v-model="filterAction" @keyup.enter="fetchLogs" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm">From</label>
        <Calendar v-model="filterDateFrom" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm">To</label>
        <Calendar v-model="filterDateTo" />
      </div>
      <Button label="Filter" icon="pi pi-search" @click="fetchLogs" />
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="logs.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="logs" class="p-datatable-sm" paginator :rows="10" v-model:expandedRows="expandedRows" dataKey="id">
        <Column expander />
        <Column header="Date">
          <template #body="{ data }">
            <small>{{ new Date(data.created_at).toLocaleString() }}</small>
          </template>
        </Column>
        <Column header="User">
          <template #body="{ data }">
            {{ data.user?.email || '-' }}
          </template>
        </Column>
        <Column field="action" header="Action" />
        <Column field="entity_type" header="Entity" />
        <Column field="entity_id" header="Entity ID" />
        <Column field="ip_address" header="IP" />
        <template #expansion="{ data }">
          <div class="p-3">
            <h4 class="text-sm font-bold mb-2">Details</h4>
            <pre class="text-sm text-color-secondary m-0" style="max-height: 300px; overflow-y: auto;">{{ JSON.stringify(data.details, null, 2) }}</pre>
          </div>
        </template>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No audit log entries.</div>
  </div>
</template>
