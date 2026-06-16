<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getCalls } from '@/api/calls'
import { getOrganizations } from '@/api/organizations'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const auth = useAuthStore()
const toast = useToast()
const { signal } = useAbortController()
const calls = ref([])
const org = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const [orgsRes, callsRes] = await Promise.all([
      getOrganizations(undefined, { signal }),
      getCalls(undefined, { signal })
    ])
    org.value = orgsRes.data.items?.[0] || null
    calls.value = callsRes.data.items.filter((c) => c.organization_id === org.value?.id)
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2 class="mb-4">Dashboard</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else>
      <div class="grid mb-4">
        <div class="col-6">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-primary">{{ calls.length }}</div>
            <div class="text-sm text-color-secondary">Total Calls</div>
          </div>
        </div>
        <div class="col-6">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-green-500">{{ calls.filter((c) => c.status === 'open').length }}</div>
            <div class="text-sm text-color-secondary">Open Calls</div>
          </div>
        </div>
      </div>

      <div v-if="org" class="surface-card p-3 border-round shadow-1 mb-4">
        <div class="flex align-items-center gap-2">
          <span class="font-bold">{{ org.name }}</span>
          <StatusBadge :status="org.is_approved ? 'approved' : 'draft'" />
        </div>
      </div>

      <h3 class="text-lg mb-3">Our Calls</h3>
      <div v-if="calls.length" class="surface-card border-round shadow-1 p-3">
        <DataTable :value="calls" class="p-datatable-sm">
          <Column field="title" header="Title" />
          <Column header="Status">
            <template #body="{ data }">
              <StatusBadge :status="data.status" />
            </template>
          </Column>
          <Column header="Dates">
            <template #body="{ data }">
              <small>{{ new Date(data.start_date).toLocaleDateString() }} — {{ new Date(data.end_date).toLocaleDateString() }}</small>
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else class="text-center text-color-secondary p-3 surface-card border-round">
        <p>No calls yet.</p>
      </div>
    </template>
  </div>
</template>
