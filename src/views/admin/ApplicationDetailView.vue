<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute } from 'vue-router'
import { getApplication, changeApplicationStatus, getApplicationHistory } from '@/api/applications'
import { getDocument } from '@/api/documents'
import { getUsers } from '@/api/users'
import { createMentorship } from '@/api/mentorships'
import { getMilestones, createMilestone } from '@/api/milestones'
import { getEvaluations } from '@/api/evaluations'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const app = ref(null)
const history = ref([])
const evaluations = ref([])
const milestones = ref([])
const mentors = ref([])
const loading = ref(true)
const saving = ref(false)

const newStatus = ref(null)
const comment = ref('')
const selectedMentor = ref(null)
const newMilestone = ref({ title: '', due_date: null })

const statusTransitions = {
  draft: ['submitted'],
  submitted: ['formally_verified'],
  formally_verified: ['under_evaluation'],
  under_evaluation: ['approved', 'revision_requested', 'rejected'],
  revision_requested: ['submitted'],
  approved: ['onboarding'],
  onboarding: ['active'],
  active: ['completed', 'paused'],
  paused: ['active', 'completed'],
  completed: [],
  rejected: [],
  archived: []
}

const requiresComment = ['revision_requested', 'rejected']
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchData)

async function fetchData() {
  try {
    const appRes = await getApplication(route.params.id, { signal })
    app.value = appRes.data

    try {
      const histRes = await getApplicationHistory(route.params.id, { signal })
      history.value = histRes.data.items || histRes.data
    } catch { /* ok if history fails */ }

    try {
      const usersRes = await getUsers({ role: 'mentor' }, { signal })
      mentors.value = usersRes.data.items
    } catch { /* ok if user fetch fails */ }

    try {
      const [evRes, milRes] = await Promise.all([
        getEvaluations(app.value.id),
        getMilestones(app.value.id, { signal })
      ])
      evaluations.value = evRes.data.items || evRes.data
      milestones.value = milRes.data.items || milRes.data
    } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) }
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}

async function handleStatusChange() {
  if (!newStatus.value) return
  saving.value = true
  try {
    await changeApplicationStatus(app.value.id, {
      status: newStatus.value,
      comment: comment.value || undefined
    })
    newStatus.value = null
    comment.value = ''
    await fetchData()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}

async function handleAssignMentor() {
  if (!selectedMentor.value) return
  saving.value = true
  try {
    await createMentorship({
      application_id: app.value.id,
      mentor_id: selectedMentor.value
    })
    selectedMentor.value = null
    await fetchData()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}

async function handleAddMilestone() {
  if (!newMilestone.value.title) return
  saving.value = true
  try {
    await createMilestone({
      application_id: app.value.id,
      ...newMilestone.value
    })
    newMilestone.value = { title: '', due_date: null }
    await fetchData()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}

function downloadDocument(docId) {
  getDocument(docId, { signal }).then((res) => {
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = docId
    a.click()
    URL.revokeObjectURL(url)
  })
}

const availableTransitions = computed(() => {
  return statusTransitions[app.value?.status] || []
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="app">
      <router-link to="/admin/applications" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Applications
      </router-link>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <h2 class="m-0">Application Detail</h2>
          <StatusBadge :status="app.status" />
        </div>
        <div class="grid">
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Applicant</p>
            <p>{{ app.applicant?.full_name || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Call</p>
            <p>{{ app.call?.title || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Team</p>
            <p>{{ app.team?.name || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Submitted</p>
            <p>{{ app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '-' }}</p>
          </div>
        </div>

        <h3 class="text-lg mb-2 mt-3">Form Data</h3>
        <div class="grid">
          <div v-for="(value, key) in app.form_data" :key="key" class="col-12 md:col-6">
            <p class="text-sm text-color-secondary m-0">{{ key }}</p>
            <p class="mb-2">{{ value }}</p>
          </div>
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Change Status</h3>
        <div class="flex gap-2 align-items-end">
          <div class="flex flex-column gap-1">
            <label class="text-sm">New Status</label>
            <Dropdown v-model="newStatus" :options="availableTransitions" />
          </div>
          <div v-if="requiresComment.includes(newStatus)" class="flex flex-column gap-1 flex-grow-1">
            <label class="text-sm">Comment (required)</label>
            <InputText v-model="comment" />
          </div>
          <Button label="Update" :loading="saving" :disabled="!newStatus || (requiresComment.includes(newStatus) && !comment)" @click="handleStatusChange" />
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Status History</h3>
        <div v-if="history.length">
          <Timeline :value="history">
            <template #content="{ item }">
              <div>
                <div class="flex align-items-center gap-2 mb-1">
                  <StatusBadge :status="item.new_status" />
                  <small class="text-color-secondary">{{ new Date(item.created_at).toLocaleString() }}</small>
                </div>
                <p v-if="item.comment" class="text-sm text-color-secondary m-0">{{ item.comment }}</p>
              </div>
            </template>
          </Timeline>
        </div>
        <div v-else class="text-color-secondary">No status changes.</div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Documents</h3>
        <div v-if="app.documents?.length">
          <div v-for="doc in app.documents" :key="doc.id" class="flex align-items-center justify-content-between p-2 border-bottom-1 surface-border">
            <span>{{ doc.filename || doc.id }}</span>
            <Button icon="pi pi-download" text size="small" @click="downloadDocument(doc.id)" />
          </div>
        </div>
        <div v-else class="text-color-secondary">No documents.</div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Evaluations</h3>
        <div v-if="evaluations.length">
          <div v-for="ev in evaluations" :key="ev.id" class="p-2 border-bottom-1 surface-border">
            <div class="flex align-items-center gap-2 mb-1">
              <span class="font-bold">{{ ev.evaluator?.full_name }}</span>
              <Tag :value="`Score: ${ev.score}`" severity="info" />
              <Tag :value="ev.recommendation" severity="warn" />
            </div>
            <p v-if="ev.comment" class="text-sm text-color-secondary m-0">{{ ev.comment }}</p>
          </div>
        </div>
        <div v-else class="text-color-secondary">No evaluations yet.</div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Assign Mentor</h3>
        <div class="flex gap-2 align-items-end">
          <div class="flex flex-column gap-1 flex-grow-1">
            <label class="text-sm">Mentor</label>
            <Dropdown v-model="selectedMentor" :options="mentors" optionLabel="full_name" optionValue="id" placeholder="Select mentor" class="w-full" />
          </div>
          <Button label="Assign" :loading="saving" :disabled="!selectedMentor" @click="handleAssignMentor" />
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1">
        <h3 class="text-lg mb-3">Milestones</h3>
        <div v-if="milestones.length" class="mb-4">
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
          </DataTable>
        </div>
        <div class="flex gap-2 align-items-end">
          <div class="flex flex-column gap-1">
            <label class="text-sm">Title</label>
            <InputText v-model="newMilestone.title" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="text-sm">Due Date</label>
            <Calendar v-model="newMilestone.due_date" />
          </div>
          <Button label="Add" icon="pi pi-plus" :loading="saving" @click="handleAddMilestone" />
        </div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Application not found.</div>
  </div>
</template>
