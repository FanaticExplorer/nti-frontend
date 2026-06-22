<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getContactMessages, markContactMessageRead } from '@/api/contact'
import { useToast } from 'primevue/usetoast'

const messages = ref([])
const loading = ref(true)
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchMessages)

async function fetchMessages() {
  loading.value = true
  try {
    const { data } = await getContactMessages(undefined, { signal })
    messages.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load messages', life: 5000 })
  } finally {
    loading.value = false
  }
}

async function handleMarkRead(id) {
  try {
    await markContactMessageRead(id)
    const msg = messages.value.find((m) => m.id === id)
    if (msg) msg.is_read = true
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Contact Messages</h2>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="messages.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="messages" class="p-datatable-sm">
        <Column header="Read">
          <template #body="{ data }">
            <Tag :value="data.is_read ? 'Read' : 'New'" :severity="data.is_read ? 'secondary' : 'info'" />
          </template>
        </Column>
        <Column field="name" header="Name" />
        <Column field="email" header="Email" />
        <Column field="message" header="Message">
          <template #body="{ data }">
            <div class="max-w-20rem overflow-hidden text-overflow-ellipsis white-space-nowrap">
              {{ data.message }}
            </div>
          </template>
        </Column>
        <Column header="Date">
          <template #body="{ data }">
            <small>{{ new Date(data.created_at).toLocaleString() }}</small>
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button
              v-if="!data.is_read"
              label="Mark read"
              size="small"
              variant="text"
              @click="handleMarkRead(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>No messages.</p>
    </div>
  </div>
</template>
