<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute } from 'vue-router'
import { getApplication, changeApplicationStatus, getApplicationHistory, getApplicationComments, addApplicationComment } from '@/api/applications'
import { getDocument } from '@/api/documents'
import { getUsers } from '@/api/users'
import { createMentorship } from '@/api/mentorships'
import { getMilestones, createMilestone } from '@/api/milestones'
import { getEvaluations, createEvaluation, updateEvaluation } from '@/api/evaluations'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const auth = useAuthStore()
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

const comments = ref([])
const newCommentBody = ref('')
const newCommentInternal = ref(false)
const addingComment = ref(false)

const evalForm = ref({ score: 0, recommendation: 'approve', comment: '', internal_notes: '' })
const editingEvalId = ref(null)
const savingEval = ref(false)

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
      const [evRes, milRes, commRes] = await Promise.all([
        getEvaluations(app.value.id),
        getMilestones(app.value.id, { signal }),
        getApplicationComments(app.value.id, { signal })
      ])
      evaluations.value = evRes.data.items || evRes.data
      milestones.value = milRes.data.items || milRes.data
      comments.value = commRes.data.items || commRes.data
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

async function handleCreateEvaluation() {
  savingEval.value = true
  try {
    await createEvaluation({ application_id: app.value.id, ...evalForm.value })
    evalForm.value = { score: 0, recommendation: 'approve', comment: '', internal_notes: '' }
    const { data } = await getEvaluations(app.value.id, { signal })
    evaluations.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    savingEval.value = false
  }
}

function startEditEval(ev) {
  editingEvalId.value = ev.id
  evalForm.value = { score: ev.score, recommendation: ev.recommendation, comment: ev.comment || '', internal_notes: ev.internal_notes || '' }
}

async function handleUpdateEvaluation() {
  savingEval.value = true
  try {
    await updateEvaluation(editingEvalId.value, evalForm.value)
    editingEvalId.value = null
    evalForm.value = { score: 0, recommendation: 'approve', comment: '', internal_notes: '' }
    const { data } = await getEvaluations(app.value.id, { signal })
    evaluations.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    savingEval.value = false
  }
}

async function handleAddComment() {
  if (!newCommentBody.value) return
  addingComment.value = true
  try {
    await addApplicationComment(app.value.id, {
      body: newCommentBody.value,
      is_internal: newCommentInternal.value
    })
    newCommentBody.value = ''
    newCommentInternal.value = false
    const { data } = await getApplicationComments(app.value.id, { signal })
    comments.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    addingComment.value = false
  }
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
            <div class="flex align-items-center gap-2">
              <span>{{ doc.filename || doc.id }}</span>
              <Tag v-if="doc.document_type" :value="doc.document_type" severity="info" />
              <Tag v-if="doc.classification" :value="doc.classification" :severity="doc.classification === 'confidential' ? 'danger' : doc.classification === 'internal' ? 'warn' : 'secondary'" />
            </div>
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
              <Button
                v-if="ev.evaluator_id === auth.user?.id && editingEvalId !== ev.id"
                icon="pi pi-pencil"
                text
                size="small"
                @click="startEditEval(ev)"
              />
            </div>
            <p v-if="ev.comment" class="text-sm text-color-secondary m-0">{{ ev.comment }}</p>
          </div>
        </div>
        <div v-else class="text-color-secondary mb-3">No evaluations yet.</div>

        <div v-if="['evaluator', 'nti_admin', 'super_admin'].includes(auth.userRole)" class="pt-3 border-top-1 surface-border">
          <h4 class="text-base mb-2">{{ editingEvalId ? 'Edit Evaluation' : 'Add Evaluation' }}</h4>
          <div class="flex flex-column gap-2">
            <div class="flex gap-2">
              <div class="flex flex-column gap-1">
                <label class="text-sm">Score (1-10)</label>
                <InputNumber v-model="evalForm.score" :min="1" :max="10" style="width: 100px" />
              </div>
              <div class="flex flex-column gap-1">
                <label class="text-sm">Recommendation</label>
                <Dropdown v-model="evalForm.recommendation" :options="['approve', 'revision', 'reject']" style="width: 130px" />
              </div>
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm">Comment</label>
              <Textarea v-model="evalForm.comment" rows="2" />
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm">Internal Notes</label>
              <InputText v-model="evalForm.internal_notes" />
            </div>
            <div class="flex gap-2">
              <Button
                v-if="editingEvalId"
                label="Update"
                icon="pi pi-check"
                :loading="savingEval"
                @click="handleUpdateEvaluation"
              />
              <Button
                v-else
                label="Submit"
                icon="pi pi-send"
                :loading="savingEval"
                @click="handleCreateEvaluation"
              />
              <Button
                v-if="editingEvalId"
                label="Cancel"
                severity="secondary"
                @click="editingEvalId = null"
              />
            </div>
          </div>
        </div>
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

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Comments</h3>
        <div v-if="comments.length" class="mb-3">
          <div v-for="c in comments" :key="c.id" class="p-2 border-bottom-1 surface-border">
            <div class="flex align-items-center gap-2 mb-1">
              <span class="font-bold">{{ c.user_name }}</span>
              <Tag v-if="c.is_internal" value="Internal" severity="warn" />
              <small class="text-color-secondary">{{ new Date(c.created_at).toLocaleString() }}</small>
            </div>
            <p class="text-sm m-0">{{ c.body }}</p>
          </div>
        </div>
        <div v-else class="text-color-secondary mb-3">No comments yet.</div>
        <div class="flex flex-column gap-2">
          <Textarea v-model="newCommentBody" placeholder="Add a comment..." rows="2" />
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center gap-2">
              <Checkbox v-model="newCommentInternal" :binary="true" inputId="internal" />
              <label for="internal">Internal (not visible to student)</label>
            </div>
            <Button label="Add Comment" icon="pi pi-send" :loading="addingComment" :disabled="!newCommentBody" @click="handleAddComment" />
          </div>
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
