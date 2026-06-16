<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getCalls, createCall, updateCall, changeCallStatus } from '@/api/calls'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'

const calls = ref([])
const loading = ref(true)
const showDialog = ref(false)
const editItem = ref(null)
const saving = ref(false)
const form = ref({ title: '', description: '', start_date: null, end_date: null })
const toast = useToast()
const { signal } = useAbortController()

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
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}

function openCreate() {
  editItem.value = null
  form.value = { title: '', description: '', start_date: null, end_date: null }
  showDialog.value = true
}

function openEdit(call) {
  editItem.value = call
  form.value = { ...call }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editItem.value) {
      await updateCall(editItem.value.id, form.value)
    } else {
      await createCall(form.value)
    }
    showDialog.value = false
    await fetchCalls()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}

async function handleStatusChange(call, newStatus) {
  try {
    await changeCallStatus(call.id, { status: newStatus })
    await fetchCalls()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Calls</h2>
      <Button label="Create" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showDialog" :header="editItem ? 'Edit Call' : 'Create Call'" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <InputText v-model="form.title" placeholder="Title" />
        <Textarea v-model="form.description" placeholder="Description" rows="3" />
        <Calendar v-model="form.start_date" placeholder="Start Date" />
        <Calendar v-model="form.end_date" placeholder="End Date" />
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showDialog = false" />
        <Button label="Save" :loading="saving" @click="handleSave" />
      </template>
    </Dialog>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="calls.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="calls" class="p-datatable-sm" paginator :rows="10">
        <Column field="title" header="Title" />
        <Column header="Program">
          <template #body="{ data }">
            <Tag v-if="data.program" :value="data.program.type" severity="info" />
          </template>
        </Column>
        <Column header="Organization">
          <template #body="{ data }">
            {{ data.organization?.name || '-' }}
          </template>
        </Column>
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
        <Column header="">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
              <Dropdown
                :modelValue="data.status"
                :options="getAllowedTransitions(data.status)"
                optionLabel="label"
                optionValue="value"
                @change="(e) => handleStatusChange(data, e.value)"
                class="w-7rem"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No calls.</div>
  </div>
</template>
