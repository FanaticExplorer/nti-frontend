<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getCalls, createCall, updateCall, changeCallStatus } from '@/api/calls'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const calls = ref([])
const loading = ref(true)
const showCreate = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const editCall = ref(null)
const toast = useToast()
const { signal } = useAbortController()

const form = ref({
  title: '',
  description: '',
  technical_spec: '',
  budget: '',
  start_date: null,
  end_date: null
})

const STATUS_LABELS = {
  draft: 'Draft',
  open: 'Open',
  matching: 'Matching',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  closed: 'Closed'
}

const ALLOWED_TRANSITIONS = {
  draft: ['open'],
  open: ['matching', 'closed'],
  matching: ['assigned', 'closed'],
  assigned: ['in_progress', 'closed'],
  in_progress: ['closed'],
  closed: []
}

function getAllowedTransitions(status) {
  return (ALLOWED_TRANSITIONS[status] || []).map(s => ({
    label: STATUS_LABELS[s],
    value: s
  }))
}

onMounted(fetchCalls)

async function fetchCalls() {
  loading.value = true
  try {
    const { data } = await getCalls(undefined, { signal })
    calls.value = data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { title: '', description: '', technical_spec: '', budget: '', start_date: null, end_date: null }
  showCreate.value = true
}

async function handleCreate() {
  saving.value = true
  try {
    await createCall(form.value)
    showCreate.value = false
    await fetchCalls()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

function openEdit(call) {
  editCall.value = call
  form.value = { ...call }
  showEdit.value = true
}

async function handleEdit() {
  saving.value = true
  try {
    await updateCall(editCall.value.id, form.value)
    showEdit.value = false
    await fetchCalls()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

async function handleStatusChange(call, newStatus) {
  try {
    await changeCallStatus(call.id, { status: newStatus })
    await fetchCalls()
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Our Calls</h2>
      <Button label="Create Call" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showCreate" header="Create Call" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <InputText v-model="form.title" placeholder="Title" />
        <Textarea v-model="form.description" placeholder="Description" rows="3" />
        <Textarea v-model="form.technical_spec" placeholder="Technical Specification" rows="3" />
        <InputText v-model="form.budget" placeholder="Budget" />
        <Calendar v-model="form.start_date" placeholder="Start Date" />
        <Calendar v-model="form.end_date" placeholder="End Date" />
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showCreate = false" />
        <Button label="Create" :loading="saving" @click="handleCreate" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showEdit" header="Edit Call" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <InputText v-model="form.title" placeholder="Title" />
        <Textarea v-model="form.description" placeholder="Description" rows="3" />
        <Textarea v-model="form.technical_spec" placeholder="Technical Specification" rows="3" />
        <InputText v-model="form.budget" placeholder="Budget" />
        <Calendar v-model="form.start_date" placeholder="Start Date" />
        <Calendar v-model="form.end_date" placeholder="End Date" />
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showEdit = false" />
        <Button label="Save" :loading="saving" @click="handleEdit" />
      </template>
    </Dialog>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="calls.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="calls" class="p-datatable-sm">
        <Column field="title" header="Title" />
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column header="Dates">
          <template #body="{ data }">
            <small>{{ new Date(data.start_date).toLocaleDateString() }} — {{ new Date(data.end_date).toLocaleDateString() }}</small>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
              <Dropdown v-model="data.status" :options="getAllowedTransitions(data.status)" optionLabel="label" optionValue="value" @change="(e) => handleStatusChange(data, e.value)" class="w-8rem" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No calls yet. Create your first call.</p>
    </div>
  </div>
</template>
