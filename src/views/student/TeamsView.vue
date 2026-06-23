<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getMyTeams, getAllTeams, createTeam, joinTeam } from '@/api/teams'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { signal } = useAbortController()
const teams = ref([])
const allTeams = ref([])
const loading = ref(true)
const showCreate = ref(false)
const creating = ref(false)
const joining = ref(null)
const newTeam = ref({ name: '', program_type: 'A' })

const joinableTeams = computed(() => {
  const myIds = new Set(teams.value.map(t => t.id))
  return allTeams.value.filter(t => !myIds.has(t.id))
})

const programTypes = [
  { label: 'Program A', value: 'A' },
  { label: 'Program B', value: 'B' }
]

onMounted(async () => {
  try {
    const [myRes, allRes] = await Promise.all([
      getMyTeams({ signal }),
      getAllTeams({ signal })
    ])
    teams.value = myRes.data.items
    allTeams.value = allRes.data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  creating.value = true
  try {
    await createTeam(newTeam.value)
    showCreate.value = false
    newTeam.value = { name: '', program_type: 'A' }
    const { data } = await getMyTeams({ signal })
    teams.value = data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    creating.value = false
  }
}

async function handleJoin(teamId) {
  joining.value = teamId
  try {
    await joinTeam(teamId)
    toast.add({ severity: 'success', summary: 'Joined team', life: 3000 })
    const [myRes, allRes] = await Promise.all([
      getMyTeams({ signal }),
      getAllTeams({ signal })
    ])
    teams.value = myRes.data.items
    allTeams.value = allRes.data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    joining.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">My Teams</h2>
      <Button label="Create Team" icon="pi pi-plus" @click="showCreate = true" />
    </div>

    <Dialog v-model:visible="showCreate" header="Create Team" :modal="true" :style="{ width: '400px' }">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label>Team Name</label>
          <InputText v-model="newTeam.name" />
        </div>
        <div class="flex flex-column gap-1">
          <label>Program Type</label>
          <Dropdown v-model="newTeam.program_type" :options="programTypes" optionLabel="label" optionValue="value" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showCreate = false" />
        <Button label="Create" :loading="creating" @click="handleCreate" />
      </template>
    </Dialog>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="teams.length" class="grid">
      <div v-for="team in teams" :key="team.id" class="col-12 md:col-6">
        <div class="surface-card p-3 border-round shadow-1">
          <h4 class="mb-1">{{ team.name }}</h4>
          <div class="flex gap-2 align-items-center mb-2">
            <Tag :value="team.program_type" severity="info" />
          </div>
          <router-link :to="`/student/teams/${team.id}`" class="p-button p-button-sm no-underline">View</router-link>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <i class="pi pi-users text-3xl mb-2"></i>
      <p>No teams yet. Create your first team.</p>
    </div>

    <h3 class="text-lg mt-4 mb-3">Join a Team</h3>
    <div v-if="joinableTeams.length" class="grid">
      <div v-for="team in joinableTeams" :key="team.id" class="col-12 md:col-6">
        <div class="surface-card p-3 border-round shadow-1">
          <h4 class="mb-1">{{ team.name }}</h4>
          <div class="flex gap-2 align-items-center mb-2">
            <Tag :value="team.program_type" severity="info" />
            <small class="text-color-secondary">{{ team.leader_name || 'Unknown' }} · {{ team.member_count }} members</small>
          </div>
          <Button label="Join" icon="pi pi-user-plus" size="small" :loading="joining === team.id" @click="handleJoin(team.id)" />
        </div>
      </div>
    </div>
    <div v-else class="text-center text-color-secondary p-3 surface-card border-round">
      <p>No other teams to join.</p>
    </div>
  </div>
</template>
