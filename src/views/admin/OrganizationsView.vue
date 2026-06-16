<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { getOrganizations, approveOrganization } from '@/api/organizations'

const toast = useToast()
const { signal } = useAbortController()
const confirm = useConfirm()
const orgs = ref([])
const loading = ref(true)

onMounted(fetchOrgs)

async function fetchOrgs() {
  loading.value = true
  try {
    const { data } = await getOrganizations(undefined, { signal })
    orgs.value = data.items
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}

async function handleApprove(org) {
  confirm.require({
    message: `Approve ${org.name}?`,
    header: 'Confirm Approval',
    accept: async () => {
      try {
        await approveOrganization(org.id)
        toast.add({ severity: 'success', summary: 'Organization approved', detail: '', life: 3000 })
        await fetchOrgs()
      } catch (err) { toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 }) }
    }
  })
}
</script>

<template>
  <div>
    <h2 class="mb-4">Organizations</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="orgs.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="orgs" class="p-datatable-sm" paginator :rows="10">
        <Column field="name" header="Name" />
        <Column field="sector" header="Sector" />
        <Column field="contact_email" header="Contact Email" />
        <Column header="Approved">
          <template #body="{ data }">
            <Tag :value="data.is_approved ? 'Yes' : 'No'" :severity="data.is_approved ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="Created">
          <template #body="{ data }">
            <small>{{ new Date(data.created_at).toLocaleDateString() }}</small>
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button v-if="!data.is_approved" label="Approve" size="small" @click="handleApprove(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No organizations found.</div>
  </div>
</template>
