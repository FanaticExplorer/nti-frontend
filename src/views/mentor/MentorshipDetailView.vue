<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMentorship, getMentorshipLogs, addMentorshipLog } from '@/api/mentorships'
import { getMilestones, updateMilestoneStatus } from '@/api/milestones'
import { useToastStore } from '@/stores/toast'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const toast = useToastStore()
const mentorship = ref(null)
const milestones = ref([])
const logs = ref([])
const loading = ref(true)
const logText = ref('')
const logging = ref(false)

onMounted(fetchData)

async function fetchData() {
  try {
    const [mRes, lRes] = await Promise.all([
      getMentorship(route.params.id),
      getMentorshipLogs(route.params.id)
    ])
    mentorship.value = mRes.data
    logs.value = lRes.data.items || lRes.data
    if (mRes.data.application_id) {
      const { data } = await getMilestones(mRes.data.application_id)
      milestones.value = data.items || data
    }
  } catch {
    toast.error('Error', 'Failed to load data')
  } finally {
    loading.value = false
  }
}

async function handleAddLog() {
  if (!logText.value) return
  logging.value = true
  try {
    await addMentorshipLog(mentorship.value.id, { content: logText.value })
    logText.value = ''
    await fetchData()
  } catch {
    toast.error('Error', 'Action failed')
  } finally {
    logging.value = false
  }
}

async function handleMilestoneStatus(milestone, newStatus) {
  try {
    await updateMilestoneStatus(milestone.id, { status: newStatus })
    await fetchData()
  } catch {
    toast.error('Error', 'Action failed')
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="mentorship">
      <router-link to="/mentor/mentorships" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Mentorships
      </router-link>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h2 class="mb-3">Mentorship Details</h2>
        <div class="grid">
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Application</p>
            <p>{{ mentorship.application?.call?.title || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Student</p>
            <p>{{ mentorship.application?.applicant?.full_name || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Assigned</p>
            <p>{{ new Date(mentorship.assigned_at).toLocaleDateString() }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Status</p>
            <Tag :value="mentorship.is_active ? 'Active' : 'Inactive'" :severity="mentorship.is_active ? 'success' : 'secondary'" />
          </div>
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Milestones</h3>
        <div v-if="milestones.length" class="mb-3">
          <DataTable :value="milestones" class="p-datatable-sm">
            <Column field="title" header="Title" />
            <Column header="Status">
              <template #body="{ data }">
                <StatusBadge :status="data.status" />
              </template>
            </Column>
            <Column header="Due Date">
              <template #body="{ data }">
                {{ data.due_date ? new Date(data.due_date).toLocaleDateString() : '-' }}
              </template>
            </Column>
            <Column header="">
              <template #body="{ data }">
                <Dropdown
                  :modelValue="data.status"
                  :options="[
                    { label: 'Pending', value: 'pending' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Completed', value: 'completed' }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  @change="(e) => handleMilestoneStatus(data, e.value)"
                  class="w-8rem"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-else class="text-color-secondary">No milestones yet.</div>
      </div>

      <div class="surface-card p-4 border-round shadow-1">
        <h3 class="text-lg mb-3">Consultation Log</h3>
        <div class="flex gap-2 mb-3">
          <Textarea v-model="logText" placeholder="Add consultation note..." rows="2" class="flex-grow-1" />
          <Button label="Add" icon="pi pi-send" :loading="logging" @click="handleAddLog" />
        </div>
        <div v-if="logs.length">
          <div v-for="log in logs" :key="log.id" class="p-2 border-bottom-1 surface-border">
            <small class="text-color-secondary">{{ new Date(log.created_at).toLocaleString() }}</small>
            <p class="m-0 mt-1">{{ log.content }}</p>
          </div>
        </div>
        <div v-else class="text-color-secondary">No consultation logs yet.</div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Mentorship not found.</div>
  </div>
</template>
