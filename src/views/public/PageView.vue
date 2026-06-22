<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAbortController } from '@/composables/useAbortController'
import { getPageBySlug } from '@/api/content'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()
const { signal } = useAbortController()
const page = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getPageBySlug(route.params.slug, { signal })
    page.value = data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    page.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4">
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="page">
      <h1 class="mb-4">{{ page.title }}</h1>
      <div class="surface-card p-4 border-round shadow-1">
        <div v-if="page.body" v-html="page.body" />
        <p v-else class="text-color-secondary">No content.</p>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
      <p>Page not found.</p>
    </div>
  </div>
</template>
