<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getPages, createPage, updatePage } from '@/api/content'
import { useToast } from 'primevue/usetoast'

const pages = ref([])
const loading = ref(true)
const showDialog = ref(false)
const editItem = ref(null)
const saving = ref(false)
const form = ref({ title: '', slug: '', body: '', meta_title: '', meta_description: '', og_image: '', is_published: false })
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchPages)

async function fetchPages() {
  loading.value = true
  try {
    const { data } = await getPages(undefined, { signal })
    pages.value = data.items
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 }) } finally {
    loading.value = false
  }
}

function openCreate() {
  editItem.value = null
  form.value = { title: '', slug: '', body: '', meta_title: '', meta_description: '', og_image: '', is_published: false }
  showDialog.value = true
}

function openEdit(page) {
  editItem.value = page
  form.value = { ...page }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editItem.value) {
      await updatePage(editItem.value.id, form.value)
    } else {
      await createPage(form.value)
    }
    showDialog.value = false
    await fetchPages()
  } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 }) } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="m-0">Content Pages</h2>
      <Button label="Create" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Dialog v-model:visible="showDialog" :header="editItem ? 'Edit Page' : 'Create Page'" :modal="true" :style="{ width: '600px' }">
      <div class="flex flex-column gap-3">
        <InputText v-model="form.title" placeholder="Title" />
        <InputText v-model="form.slug" placeholder="Slug" />
        <Textarea v-model="form.body" placeholder="Body" rows="8" />
        <InputText v-model="form.meta_title" placeholder="Meta Title" />
        <InputText v-model="form.meta_description" placeholder="Meta Description" />
        <InputText v-model="form.og_image" placeholder="OG Image URL" />
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

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="pages.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="pages" class="p-datatable-sm">
        <Column field="title" header="Title" />
        <Column field="slug" header="Slug" />
        <Column header="Published">
          <template #body="{ data }">
            <Tag :value="data.is_published ? 'Yes' : 'No'" :severity="data.is_published ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="Updated">
          <template #body="{ data }">
            <small>{{ new Date(data.updated_at).toLocaleDateString() }}</small>
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" text size="small" @click="openEdit(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No pages.</div>
  </div>
</template>
