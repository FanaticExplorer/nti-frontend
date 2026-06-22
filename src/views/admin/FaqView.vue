<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getFaq, createFaq, updateFaq, deleteFaq } from '@/api/content'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const items = ref([])
const loading = ref(true)
const showDialog = ref(false)
const editItem = ref(null)
const saving = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const form = ref({ question: '', answer: '', category: '', sort_order: 0, is_published: false })
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchItems)

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await getFaq(undefined, { signal })
    items.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editItem.value = null
  form.value = { question: '', answer: '', category: '', sort_order: 0, is_published: false }
  showDialog.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = { ...item }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editItem.value) {
      await updateFaq(editItem.value.id, form.value)
    } else {
      await createFaq(form.value)
    }
    showDialog.value = false
    await fetchItems()
    toast.add({ severity: 'success', summary: editItem.value ? 'Updated' : 'Created', life: 3000 })
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
    await deleteFaq(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchItems()
    toast.add({ severity: 'success', summary: 'Deleted', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">FAQ</h2>
      <Button label="Create" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showDialog" :header="editItem ? 'Edit FAQ' : 'Create FAQ'" :modal="true" :style="{ width: '600px' }">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label class="text-sm">Question</label>
          <InputText v-model="form.question" placeholder="Question" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Answer</label>
          <Textarea v-model="form.answer" placeholder="Answer" rows="5" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Category</label>
          <InputText v-model="form.category" placeholder="Category" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm">Sort Order</label>
          <InputNumber v-model="form.sort_order" :min="0" />
        </div>
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="form.is_published" :binary="true" />
          <label>Published</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showDialog = false" />
        <Button label="Save" :loading="saving" @click="handleSave" />
      </template>
    </Dialog>

    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Delete FAQ"
      :message="`Delete '${deleteTarget?.question}'?`"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="items.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="items" class="p-datatable-sm">
        <Column field="question" header="Question" />
        <Column field="category" header="Category" />
        <Column header="Published">
          <template #body="{ data }">
            <Tag :value="data.is_published ? 'Yes' : 'No'" :severity="data.is_published ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column field="sort_order" header="Order" />
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
              <Button icon="pi pi-trash" text size="small" severity="danger" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No FAQ entries.</p>
    </div>
  </div>
</template>
