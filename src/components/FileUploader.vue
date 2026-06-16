<script setup>
import { ref } from 'vue'
import { uploadDocument } from '@/api/documents'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  applicationId: { type: String, required: true }
})

const toast = useToastStore()
const uploading = ref(false)

async function onFileSelect(event) {
  const file = event.files[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('application_id', props.applicationId)
    await uploadDocument(fd)
  } catch {
    toast.error('Error', 'Failed to upload file')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <FileUpload
    mode="basic"
    accept="*/*"
    :maxFileSize="10000000"
    customUpload
    auto
    @select="onFileSelect"
    :disabled="uploading"
  />
</template>
