<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToastStore } from '@/stores/toast'
import { getTeam, inviteTeamMember, removeTeamMember } from '@/api/teams'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()
const confirm = useConfirm()

const team = ref(null)
const loading = ref(true)
const inviteEmail = ref('')
const inviting = ref(false)

const isLeader = ref(false)

onMounted(async () => {
  await fetchTeam()
})

async function fetchTeam() {
  try {
    const { data } = await getTeam(route.params.id)
    team.value = data
    isLeader.value = data.leader_id === auth.user?.id
  } catch {
    toast.error('Error', 'Failed to load data')
  } finally {
    loading.value = false
  }
}

async function handleInvite() {
  if (!inviteEmail.value) return
  inviting.value = true
  try {
    await inviteTeamMember(team.value.id, { email: inviteEmail.value })
    inviteEmail.value = ''
    await fetchTeam()
  } catch {
    toast.error('Error', 'Action failed')
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
        toast.success('Member removed')
        await fetchTeam()
      } catch (err) {
        toast.error('Error', err?.response?.data?.detail || 'Action failed')
      }
    }
  })
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
