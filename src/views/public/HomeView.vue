<script setup>
import { ref, onMounted } from 'vue'
import { getPrograms } from '@/api/programs'
import { getNews } from '@/api/content'
import { getCalls } from '@/api/calls'
import { useToast } from 'primevue/usetoast'
import { useAbortController } from '@/composables/useAbortController'

const toast = useToast()
const { signal } = useAbortController()
const programs = ref([])
const news = ref([])
const calls = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [progRes, newsRes, callsRes] = await Promise.all([
      getPrograms(undefined, { signal }),
      getNews({ limit: 3 }, { signal }),
      getCalls({ limit: 4 }, { signal })
    ])
    programs.value = progRes.data.items
    news.value = newsRes.data.items
    calls.value = callsRes.data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load homepage content', life: 5000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <section class="py-8 text-center surface-ground border-round-bottom-2xl">
      <h1 class="text-4xl font-bold mb-3">Nitrian Technology Incubator</h1>
      <p class="text-xl text-color-secondary mb-4">Empowering innovation and entrepreneurship in the Nitra region</p>
      <div class="flex gap-3 justify-content-center">
        <router-link to="/programs" custom v-slot="{ navigate }">
          <Button label="View Programs" @click="navigate" />
        </router-link>
        <router-link to="/register" custom v-slot="{ navigate }">
          <Button label="Apply Now" severity="secondary" variant="outlined" @click="navigate" />
        </router-link>
      </div>
    </section>

    <section class="py-6">
      <h2 class="text-2xl mb-4">Our Programs</h2>
      <div v-if="programs.length" class="grid">
        <div v-for="prog in programs" :key="prog.id" class="col-12 md:col-6">
          <div class="surface-card p-4 border-round shadow-1 h-full">
            <div class="flex align-items-center gap-2 mb-2">
              <Tag :value="prog.type" severity="info" />
              <h3 class="m-0">{{ prog.title }}</h3>
            </div>
            <p class="text-color-secondary">{{ prog.description }}</p>
            <router-link :to="`/programs/${prog.id}`" custom v-slot="{ navigate }">
              <Button label="Learn more" variant="text" size="small" @click="navigate" />
            </router-link>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="text-center text-color-secondary p-4">No programs available.</div>
    </section>

    <section class="py-6">
      <h2 class="text-2xl mb-4">Latest News</h2>
      <div v-if="news.length" class="grid">
        <div v-for="item in news" :key="item.id" class="col-12 md:col-4">
          <div class="surface-card p-4 border-round shadow-1 h-full">
            <h3 class="mb-2">{{ item.title }}</h3>
            <small class="text-color-secondary">{{ new Date(item.published_at).toLocaleDateString() }}</small>
            <p class="text-color-secondary mt-2">{{ item.body?.substring(0, 150) }}...</p>
            <router-link :to="`/news/${item.slug}`" custom v-slot="{ navigate }">
              <Button label="Read more" variant="text" size="small" @click="navigate" />
            </router-link>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="text-center text-color-secondary p-4">No news yet.</div>
    </section>

    <section class="py-6">
      <h2 class="text-2xl mb-4">Open Calls</h2>
      <div v-if="calls.length" class="grid">
        <div v-for="call in calls" :key="call.id" class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-4 border-round shadow-1 h-full">
            <h3 class="mb-2">{{ call.title }}</h3>
            <Tag :value="call.program?.type || 'Unknown'" severity="info" class="mb-2" />
            <p class="text-sm text-color-secondary">Ends: {{ new Date(call.end_date).toLocaleDateString() }}</p>
            <router-link :to="`/calls/${call.id}`" custom v-slot="{ navigate }">
              <Button label="View details" variant="text" size="small" @click="navigate" />
            </router-link>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="text-center text-color-secondary p-4">No open calls at the moment.</div>
    </section>
  </div>
</template>
