<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getPrograms, createProgram, updateProgram } from '@/api/programs'
import { useToast } from 'primevue/usetoast'

const programs = ref([])
const loading = ref(true)
const showDialog = ref(false)
const editItem = ref(null)
const saving = ref(false)
const form = ref({ title: '', type: 'A', description: '', rules: '', is_active: true })
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchPrograms)

async function fetchPrograms() {
  loading.value = true
  try {
    const { data } = await getPrograms(undefined, { signal })
    programs.value = data.items
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}

function openCreate() {
  editItem.value = null
  form.value = { title: '', type: 'A', description: '', rules: '', is_active: true }
  showDialog.value = true
}

function openEdit(prog) {
  editItem.value = prog
  form.value = { ...prog }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editItem.value) {
      await updateProgram(editItem.value.id, form.value)
    } else {
      await createProgram(form.value)
    }
    showDialog.value = false
    await fetchPrograms()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Programs</h2>
      <Button label="Create" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showDialog" :header="editItem ? 'Edit Program' : 'Create Program'" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <InputText v-model="form.title" placeholder="Title" />
        <Dropdown v-model="form.type" :options="[{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }]" optionLabel="label" optionValue="value" placeholder="Type" />
        <Textarea v-model="form.description" placeholder="Description" rows="3" />
        <Textarea v-model="form.rules" placeholder="Rules" rows="3" />
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="form.is_active" :binary="true" />
          <label>Active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showDialog = false" />
        <Button label="Save" :loading="saving" @click="handleSave" />
      </template>
    </Dialog>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="programs.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="programs" class="p-datatable-sm">
        <Column field="title" header="Title" />
        <Column header="Type">
          <template #body="{ data }">
            <Tag :value="data.type" severity="info" />
          </template>
        </Column>
        <Column header="Active">
          <template #body="{ data }">
            <Tag :value="data.is_active ? 'Yes' : 'No'" :severity="data.is_active ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No programs.</div>
  </div>
</template>
