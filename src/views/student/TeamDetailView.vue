<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { getTeam, inviteTeamMember, removeTeamMember, joinTeam } from '@/api/teams'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const { signal } = useAbortController()
const confirm = useConfirm()

const team = ref(null)
const loading = ref(true)
const inviteEmail = ref('')
const inviting = ref(false)

const isLeader = ref(false)
const isMember = ref(false)
const joining = ref(false)

onMounted(async () => {
  await fetchTeam()
})

async function fetchTeam() {
  try {
    const { data } = await getTeam(route.params.id, { signal })
    team.value = data
    isLeader.value = data.leader_id === auth.user?.id
    isMember.value = data.members?.some((m) => m.id === auth.user?.id) ?? false
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

async function handleInvite() {
  if (!inviteEmail.value) return
  inviting.value = true
  try {
    await inviteTeamMember(team.value.id, inviteEmail.value)
    inviteEmail.value = ''
    await fetchTeam()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    inviting.value = false
  }
}

async function handleRemove(userId, userName) {
  confirm.require({
    message: `Remove ${userName} from the team?`,
    header: 'Confirm Removal',
    accept: async () => {
      try {
        await removeTeamMember(team.value.id, userId)
        toast.add({ severity: 'success', summary: 'Member removed', life: 3000 })
        await fetchTeam()
      } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
      }
    }
  })
}

async function handleJoin() {
  joining.value = true
  try {
    await joinTeam(team.value.id)
    toast.add({ severity: 'success', summary: 'Joined team', life: 3000 })
    await fetchTeam()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="team">
      <router-link to="/student/teams" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Teams
      </router-link>
      <div class="surface-card p-4 border-round shadow-1">
        <h2 class="mb-2">{{ team.name }}</h2>
        <div class="flex gap-2 align-items-center mb-3">
          <Tag :value="team.program_type" severity="info" />
          <small class="text-color-secondary">Leader: {{ team.leader?.full_name }}</small>
        </div>

        <h3 class="text-lg mb-2">Members</h3>
        <div v-if="team.members?.length" class="mb-4">
          <DataTable :value="team.members" class="p-datatable-sm">
            <Column field="full_name" header="Name" />
            <Column field="email" header="Email" />
            <Column v-if="isLeader" header="">
              <template #body="{ data }">
                <Button
                  v-if="data.id !== auth.user?.id"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  @click="handleRemove(data.id, data.full_name)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-else class="text-color-secondary mb-3">No members yet.</div>

        <div v-if="!isMember && ['student', 'team_leader'].includes(auth.userRole)" class="mb-3">
          <Button label="Join Team" icon="pi pi-user-plus" :loading="joining" @click="handleJoin" />
        </div>

        <div v-if="isLeader" class="flex gap-2 align-items-end">
          <div class="flex flex-column gap-1 flex-grow-1">
            <label class="text-sm">Invite by email</label>
            <InputText v-model="inviteEmail" placeholder="member@example.com" />
          </div>
          <Button label="Invite" icon="pi pi-send" :loading="inviting" @click="handleInvite" />
        </div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Team not found.</div>
  </div>
</template>
