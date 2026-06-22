<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getApplication, submitApplication, getApplicationHistory, updateApplication, getApplicationComments } from '@/api/applications'
import { uploadDocument, getDocument } from '@/api/documents'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const toast = useToast()
const { signal } = useAbortController()
const app = ref(null)
const history = ref([])
const loading = ref(true)
const submitting = ref(false)
const uploading = ref(false)
const editing = ref(false)

const comments = ref([])

const formData = ref({})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  try {
    const appRes = await getApplication(route.params.id, { signal })
    app.value = appRes.data
    formData.value = { ...app.value.form_data }

    try {
      const histRes = await getApplicationHistory(route.params.id, { signal })
      history.value = histRes.data.items || histRes.data
    } catch { /* ok if history fails */ }

    try {
      const commRes = await getApplicationComments(route.params.id, { signal })
      comments.value = commRes.data.items || commRes.data
    } catch { /* ok if comments fail */ }
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    await submitApplication(app.value.id)
    toast.add({ severity: 'success', summary: 'Application submitted', life: 3000 })
    await fetchData()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    submitting.value = false
  }
}

async function handleSave() {
  submitting.value = true
  try {
    await updateApplication(app.value.id, { form_data: formData.value })
    toast.add({ severity: 'success', summary: 'Changes saved', life: 3000 })
    editing.value = false
    await fetchData()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    submitting.value = false
  }
}

async function handleUpload(event) {
  const file = event.files[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    await uploadDocument(app.value.id, fd)
    await fetchData()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    uploading.value = false
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
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="app">
      <router-link to="/student/applications" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to Applications
      </router-link>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <div class="flex align-items-center gap-2">
            <h2 class="m-0">Application</h2>
            <StatusBadge :status="app.status" />
          </div>
          <div v-if="app.status === 'draft'" class="flex gap-2">
            <Button v-if="!editing" label="Edit" icon="pi pi-pencil" severity="secondary" @click="editing = true" />
            <Button label="Submit" icon="pi pi-send" :loading="submitting" @click="handleSubmit" />
          </div>
        </div>

        <div class="grid mb-3">
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Call</p>
            <p class="font-bold">{{ app.call?.title }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Team</p>
            <p class="font-bold">{{ app.team?.name || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Submitted</p>
            <p>{{ app.submitted_at ? new Date(app.submitted_at).toLocaleString() : '-' }}</p>
          </div>
        </div>

        <h3 class="text-lg mb-2">Form Data</h3>
        <div v-if="!editing" class="grid">
          <div v-for="(value, key) in app.form_data" :key="key" class="col-12 md:col-6">
            <p class="text-sm text-color-secondary m-0">{{ key }}</p>
            <p class="mb-2">{{ value }}</p>
          </div>
        </div>
        <div v-else class="flex flex-column gap-3 mb-3">
          <div v-for="(value, key) in formData" :key="key" class="flex flex-column gap-1">
            <label class="text-sm">{{ key }}</label>
            <Textarea v-if="typeof value === 'string' && value.length > 50" v-model="formData[key]" rows="3" />
            <InputText v-else v-model="formData[key]" />
          </div>
          <div class="flex gap-2">
            <Button label="Save Changes" :loading="submitting" @click="handleSave" />
            <Button label="Cancel" severity="secondary" @click="editing = false; formData = { ...app.form_data }" />
          </div>
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <h3 class="text-lg mb-3">Documents</h3>
        <div v-if="app.documents?.length" class="mb-3">
          <div v-for="doc in app.documents" :key="doc.id" class="flex align-items-center justify-content-between p-2 border-bottom-1 surface-border">
            <span>{{ doc.filename || doc.id }}</span>
            <Button icon="pi pi-download" text size="small" @click="downloadDocument(doc.id)" />
          </div>
        </div>
        <div v-else class="text-color-secondary mb-3">No documents uploaded.</div>
        <div v-if="app.status === 'draft'">
          <FileUpload mode="basic" accept="*/*" :maxFileSize="10000000" customUpload auto @select="handleUpload" :disabled="uploading" />
          <small v-if="uploading" class="text-color-secondary ml-2">Uploading...</small>
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
        <div v-else class="text-color-secondary">No status changes yet.</div>
      </div>

      <div class="surface-card p-4 border-round shadow-1">
        <h3 class="text-lg mb-3">Comments</h3>
        <div v-if="comments.length">
          <div v-for="c in comments" :key="c.id" class="p-2 border-bottom-1 surface-border">
            <div class="flex align-items-center gap-2 mb-1">
              <span class="font-bold">{{ c.user_name }}</span>
              <small class="text-color-secondary">{{ new Date(c.created_at).toLocaleString() }}</small>
            </div>
            <p class="text-sm m-0">{{ c.body }}</p>
          </div>
        </div>
        <div v-else class="text-color-secondary">No comments yet.</div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Application not found.</div>
  </div>
</template>
