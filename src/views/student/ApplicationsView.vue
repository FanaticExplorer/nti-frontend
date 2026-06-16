<script setup>
import { ref, onMounted } from 'vue'
import { getMyApplications } from '@/api/applications'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/StatusBadge.vue'

const toast = useToastStore()
const applications = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getMyApplications()
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
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">My Applications</h2>
      <router-link to="/student/applications/new" class="p-button no-underline">
        <i class="pi pi-plus mr-1"></i>New Application
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="applications.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="applications" class="p-datatable-sm" @row-click="(e) => $router.push(`/student/applications/${e.data.id}`)" selectionMode="single">
        <Column field="call.title" header="Call" />
        <Column header="Program">
          <template #body="{ data }">
            <Tag v-if="data.call?.program" :value="data.call.program.type" severity="info" />
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="Submitted">
          <template #body="{ data }">
            {{ data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : '-' }}
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <i class="pi pi-file text-3xl mb-2"></i>
      <p>No applications yet. Start by applying to an open call.</p>
    </div>
  </div>
</template>
