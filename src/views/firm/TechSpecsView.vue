<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getTechSpecs, createTechSpec, updateTechSpec, deleteTechSpec } from '@/api/techSpecs'
import { useToast } from 'primevue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const techSpecs = ref([])
const loading = ref(true)
const showCreate = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const editItem = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const toast = useToast()
const { signal } = useAbortController()

const form = ref({
  title: '',
  description: '',
  budget: '',
  call_id: '',
  product_owner_id: ''
})

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'In Pairing', value: 'in_pairing' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Realization', value: 'in_realization' },
  { label: 'Closed', value: 'closed' }
]

onMounted(fetchTechSpecs)

async function fetchTechSpecs() {
  loading.value = true
  try {
    const { data } = await getTechSpecs(undefined, { signal })
    techSpecs.value = data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { title: '', description: '', budget: '', call_id: '', product_owner_id: '' }
  showCreate.value = true
}

async function handleCreate() {
  saving.value = true
  try {
    await createTechSpec(form.value)
    showCreate.value = false
    await fetchTechSpecs()
    toast.add({ severity: 'success', summary: 'Created', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    title: item.title,
    description: item.description || '',
    budget: item.budget || '',
    call_id: item.call_id || '',
    product_owner_id: item.product_owner_id || ''
  }
  showEdit.value = true
}

async function handleEdit() {
  saving.value = true
  try {
    await updateTechSpec(editItem.value.id, form.value)
    showEdit.value = false
    await fetchTechSpecs()
    toast.add({ severity: 'success', summary: 'Updated', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function handleDelete() {
  deleting.value = true
  try {
    await deleteTechSpec(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchTechSpecs()
    toast.add({ severity: 'success', summary: 'Deleted', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    deleting.value = false
  }
}

function canEdit(item) {
  return item.status === 'draft'
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Tech Specs</h2>
      <Button label="Create Tech Spec" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showCreate" header="Create Tech Spec" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label class="text-sm">Title</label>
          <InputText v-model="form.title" placeholder="Title" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Description</label>
          <Textarea v-model="form.description" placeholder="Description" rows="3" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Budget</label>
          <InputText v-model="form.budget" placeholder="Budget" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Call ID</label>
          <InputText v-model="form.call_id" placeholder="Call ID (optional)" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Product Owner ID</label>
          <InputText v-model="form.product_owner_id" placeholder="Product Owner ID (optional)" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showCreate = false" />
        <Button label="Create" :loading="saving" @click="handleCreate" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showEdit" header="Edit Tech Spec" :modal="true" :style="{ width: '500px' }">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label class="text-sm">Title</label>
          <InputText v-model="form.title" placeholder="Title" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Description</label>
          <Textarea v-model="form.description" placeholder="Description" rows="3" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Budget</label>
          <InputText v-model="form.budget" placeholder="Budget" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Call ID</label>
          <InputText v-model="form.call_id" placeholder="Call ID" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Product Owner ID</label>
          <InputText v-model="form.product_owner_id" placeholder="Product Owner ID" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showEdit = false" />
        <Button label="Save" :loading="saving" @click="handleEdit" />
      </template>
    </Dialog>

    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Delete Tech Spec"
      :message="`Delete '${deleteTarget?.title}'? This cannot be undone.`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="techSpecs.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="techSpecs" class="p-datatable-sm">
        <Column field="title" header="Title" />
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column field="budget" header="Budget" />
        <Column header="Created">
          <template #body="{ data }">
            <small>{{ new Date(data.created_at).toLocaleDateString() }}</small>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button v-if="canEdit(data)" icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
              <Button v-if="canEdit(data)" icon="pi pi-trash" text size="small" severity="danger" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No tech specs yet. Create your first one.</p>
    </div>
  </div>
</template>
