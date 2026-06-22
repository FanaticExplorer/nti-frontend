<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getTechSpecBacklog } from '@/api/techSpecs'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const items = ref([])
const loading = ref(true)
const total = ref(0)
const skip = ref(0)
const limit = 20
const toast = useToast()
const { signal } = useAbortController()

onMounted(() => fetchBacklog())

async function fetchBacklog() {
  loading.value = true
  try {
    const { data } = await getTechSpecBacklog({ skip: skip.value, limit }, { signal })
    items.value = data.items
    total.value = data.total
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tech specs', life: 5000 })
  } finally {
    loading.value = false
  }
}

function onPageChange(event) {
  skip.value = event.first
  fetchBacklog()
}
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Tech Specs Backlog</h2>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="items.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="items" class="p-datatable-sm" paginator :rows="limit" :totalRecords="total" :first="skip" @page="onPageChange">
        <Column field="title" header="Title" />
        <Column header="Organization">
          <template #body="{ data }">
            {{ data.organization?.name || '-' }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column field="budget" header="Budget" />
        <Column header="Description">
          <template #body="{ data }">
            <div class="max-w-20rem overflow-hidden text-overflow-ellipsis white-space-nowrap">
              {{ data.description || '-' }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No published tech specs yet.</p>
    </div>
  </div>
</template>
