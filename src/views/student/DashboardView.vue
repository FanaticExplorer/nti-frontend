<script setup>
import { ref, onMounted } from 'vue'
import { getMyApplications } from '@/api/applications'
import { getMyTeams } from '@/api/teams'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/StatusBadge.vue'

const toast = useToastStore()
const applications = ref([])
const teams = ref([])
const loading = ref(true)

const totalApps = ref(0)
const draftCount = ref(0)
const submittedCount = ref(0)
const approvedCount = ref(0)

onMounted(async () => {
  try {
    const [appRes, teamRes] = await Promise.all([
      getMyApplications(),
      getMyTeams()
    ])
    applications.value = appRes.data.items
    teams.value = teamRes.data.items

    totalApps.value = applications.value.length
    draftCount.value = applications.value.filter((a) => a.status === 'draft').length
    submittedCount.value = applications.value.filter((a) => a.status === 'submitted').length
    approvedCount.value = applications.value.filter((a) => a.status === 'approved').length
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
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else>
      <div class="grid mb-4">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-primary">{{ totalApps }}</div>
            <div class="text-sm text-color-secondary">Total Applications</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-500">{{ draftCount }}</div>
            <div class="text-sm text-color-secondary">Drafts</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-primary">{{ submittedCount }}</div>
            <div class="text-sm text-color-secondary">Submitted</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-green-500">{{ approvedCount }}</div>
            <div class="text-sm text-color-secondary">Approved</div>
          </div>
        </div>
      </div>

      <h3 class="text-lg mb-3">Recent Applications</h3>
      <div v-if="applications.length" class="surface-card border-round shadow-1 p-3 mb-4">
        <DataTable :value="applications.slice(0, 5)" class="p-datatable-sm">
          <Column field="call.title" header="Call" />
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
          <Column header="">
            <template #body="{ data }">
              <router-link :to="`/student/applications/${data.id}`" class="p-button p-button-text p-button-sm no-underline">View</router-link>
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else class="text-center text-color-secondary p-3 mb-4 surface-card border-round">
        <i class="pi pi-file text-3xl mb-2"></i>
        <p>No applications yet. Start by applying to an open call.</p>
      </div>

      <h3 class="text-lg mb-3">My Teams</h3>
      <div v-if="teams.length" class="grid">
        <div v-for="team in teams" :key="team.id" class="col-12 md:col-6">
          <div class="surface-card p-3 border-round shadow-1">
            <h4 class="mb-1">{{ team.name }}</h4>
            <p class="text-sm text-color-secondary mb-2">{{ team.member_count }} members</p>
            <Tag v-if="team.program_type" :value="team.program_type" severity="info" class="mb-2" />
            <router-link :to="`/student/teams/${team.id}`" class="p-button p-button-text p-button-sm no-underline">View team</router-link>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-color-secondary p-3 surface-card border-round">
        <i class="pi pi-users text-3xl mb-2"></i>
        <p>No teams yet. Create your first team.</p>
      </div>
    </template>
  </div>
</template>
