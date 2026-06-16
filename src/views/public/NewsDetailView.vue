<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNewsArticle } from '@/api/content'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()
const article = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getNewsArticle(route.params.slug)
    article.value = data
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
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
    <template v-else-if="article">
      <router-link to="/news" class="text-color-secondary no-underline mb-3 inline-block">
        <i class="pi pi-arrow-left mr-1"></i>Back to News
      </router-link>
      <div class="surface-card p-4 border-round shadow-1">
        <h1 class="text-2xl mb-2">{{ article.title }}</h1>
        <small class="text-color-secondary">{{ new Date(article.published_at).toLocaleDateString() }}</small>
        <div class="mt-4 text-color-secondary" style="white-space: pre-wrap;" v-html="article.body"></div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">Article not found.</div>
  </div>
</template>
