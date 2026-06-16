<script setup>
import { ref, onMounted } from 'vue'
import { getAllApplications } from '@/api/applications'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/StatusBadge.vue'

const applications = ref([])
const loading = ref(true)
const toast = useToastStore()

onMounted(async () => {
  try {
    const { data } = await getAllApplications({ status: 'under_evaluation' })
    applications.value = data.items
  } catch {
    toast.error('Error', 'Failed to load data')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2 class="mb-4">Applications to Review</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="applications.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="applications" class="p-datatable-sm">
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
        <Column header="Submitted">
          <template #body="{ data }">
            {{ data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : '-' }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <router-link :to="`/admin/applications/${data.id}`" class="p-button p-button-text p-button-sm no-underline">View</router-link>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No applications to review.</p>
    </div>
  </div>
</template>
