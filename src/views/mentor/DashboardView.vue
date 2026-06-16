<script setup>
import { ref, onMounted } from 'vue'
import { getMyMentorships } from '@/api/mentorships'
import { useToast } from 'primevue/usetoast'

const mentorships = ref([])
const loading = ref(true)
const toast = useToast()

onMounted(async () => {
  try {
    const { data } = await getMyMentorships()
    mentorships.value = data.items
  } catch {
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
            <div class="text-3xl font-bold text-primary">{{ mentorships.filter((m) => m.is_active).length }}</div>
            <div class="text-sm text-color-secondary">Active Mentorships</div>
          </div>
        </div>
      </div>

      <h3 class="text-lg mb-3">My Mentorships</h3>
      <div v-if="mentorships.length" class="surface-card border-round shadow-1 p-3">
        <DataTable :value="mentorships" class="p-datatable-sm">
          <Column header="Application">
            <template #body="{ data }">
              {{ data.application?.call?.title || '-' }}
            </template>
          </Column>
          <Column header="Student">
            <template #body="{ data }">
              {{ data.application?.applicant?.full_name || '-' }}
            </template>
          </Column>
          <Column header="Active">
            <template #body="{ data }">
              <Tag :value="data.is_active ? 'Active' : 'Inactive'" :severity="data.is_active ? 'success' : 'secondary'" />
            </template>
          </Column>
          <Column header="">
            <template #body="{ data }">
              <router-link :to="`/mentor/mentorships/${data.id}`" class="p-button p-button-text p-button-sm no-underline">View</router-link>
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
        <p>No mentorships assigned yet.</p>
      </div>
    </template>
  </div>
</template>
