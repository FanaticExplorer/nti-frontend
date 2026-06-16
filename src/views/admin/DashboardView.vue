<script setup>
import { ref, onMounted } from 'vue'
import { getStats, exportApplications } from '@/api/admin'
import { useToast } from 'primevue/usetoast'
import Chart from 'primevue/chart'

const stats = ref(null)
const loading = ref(true)
const barData = ref(null)
const pieData = ref(null)
const toast = useToast()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#888' } } },
  scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#888' } } }
}

onMounted(async () => {
  try {
    const { data } = await getStats()
    stats.value = data

    if (data.applications_by_status) {
      barData.value = {
        labels: Object.keys(data.applications_by_status),
        datasets: [{
          label: 'Applications',
          data: Object.values(data.applications_by_status),
          backgroundColor: ['#64748b', '#3b82f6', '#eab308', '#22c55e', '#ef4444']
        }]
      }
    }
    if (data.users_by_role) {
      pieData.value = {
        labels: Object.keys(data.users_by_role),
        datasets: [{
          data: Object.values(data.users_by_role),
          backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#64748b', '#ec4899', '#14b8a6', '#f97316']
        }]
      }
    }
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
})

async function handleExport() {
  try {
    const res = await exportApplications()
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'applications.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Admin Dashboard</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="stats">
      <div class="grid mb-4">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-primary">{{ stats.total_users }}</div>
            <div class="text-sm text-color-secondary">Total Users</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-primary">{{ stats.total_applications }}</div>
            <div class="text-sm text-color-secondary">Total Applications</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-green-500">{{ stats.open_calls }}</div>
            <div class="text-sm text-color-secondary">Open Calls</div>
          </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center">
            <div class="text-3xl font-bold text-green-500">{{ stats.approved_applications }}</div>
            <div class="text-sm text-color-secondary">Approved</div>
          </div>
        </div>
      </div>

      <div class="flex justify-content-end mb-4">
        <Button label="Export CSV" icon="pi pi-download" @click="handleExport" />
      </div>

      <div class="grid">
        <div class="col-12 lg:col-6">
          <div class="surface-card p-3 border-round shadow-1 mb-4">
            <h3 class="text-lg mb-3">Applications by Status</h3>
            <Chart v-if="barData" type="bar" :data="barData" :options="{ ...chartOptions, indexAxis: 'y' }" style="height: 300px;" />
          </div>
        </div>
        <div class="col-12 lg:col-6">
          <div class="surface-card p-3 border-round shadow-1 mb-4">
            <h3 class="text-lg mb-3">Users by Role</h3>
            <Chart v-if="pieData" type="doughnut" :data="pieData" :options="chartOptions" style="height: 300px;" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
