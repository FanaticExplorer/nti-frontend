<script setup>
import { ref, onMounted } from 'vue'
import { getNews } from '@/api/content'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const news = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getNews()
    news.value = data.items
  } catch {
    toast.error('Error', 'Failed to load data')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">News</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="news.length" class="flex flex-column gap-3">
      <div v-for="item in news" :key="item.id" class="surface-card p-4 border-round shadow-1">
        <h3 class="mb-1">{{ item.title }}</h3>
        <small class="text-color-secondary">{{ new Date(item.published_at).toLocaleDateString() }}</small>
        <p class="text-color-secondary mt-2">{{ item.body?.substring(0, 200) }}...</p>
        <router-link :to="`/news/${item.slug}`" custom v-slot="{ navigate }">
          <Button label="Read more" variant="text" size="small" @click="navigate" />
        </router-link>
      </div>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No news articles.</div>
  </div>
</template>
