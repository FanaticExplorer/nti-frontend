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
    <h2 class="mb-4">Dashboard</h2>
    <div class="grid mb-4">
      <div class="col-6">
        <div class="surface-card p-3 border-round shadow-1 text-center">
          <div class="text-3xl font-bold text-primary">{{ applications.length }}</div>
          <div class="text-sm text-color-secondary">Pending Review</div>
        </div>
      </div>
    </div>

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
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <router-link :to="`/admin/applications/${data.id}`" class="p-button p-button-text p-button-sm no-underline">Review</router-link>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No applications to review.</p>
    </div>
  </div>
</template>
