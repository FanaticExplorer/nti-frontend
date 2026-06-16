<script setup>
import { ref, onMounted } from 'vue'
import { getAllApplications } from '@/api/applications'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/StatusBadge.vue'

const applications = ref([])
const loading = ref(true)
const filterStatus = ref(null)
const toast = useToastStore()

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Evaluation', value: 'under_evaluation' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    const { data } = await getAllApplications(params)
    applications.value = data.items
  } catch { toast.error('Error', 'Failed to load data') } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Applications</h2>
    <div class="flex gap-3 align-items-end mb-4">
      <div class="flex flex-column gap-1">
        <label class="text-sm">Filter by Status</label>
        <Dropdown v-model="filterStatus" :options="statusOptions" optionLabel="label" optionValue="value" @change="fetchData" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="applications.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="applications" class="p-datatable-sm" paginator :rows="10">
        <Column header="Applicant">
          <template #body="{ data }">
            {{ data.applicant?.full_name || '-' }}
          </template>
        </Column>
        <Column header="Call">
          <template #body="{ data }">
            {{ data.call?.title || '-' }}
          </template>
        </Column>
        <Column header="Team">
          <template #body="{ data }">
            {{ data.team?.name || '-' }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="Submitted">
          <template #body="{ data }">
            <small>{{ data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : '-' }}</small>
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <router-link :to="`/admin/applications/${data.id}`" class="p-button p-button-text p-button-sm no-underline">View</router-link>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No applications found.</div>
  </div>
</template>
