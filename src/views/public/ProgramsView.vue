<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getPrograms } from '@/api/programs'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { signal } = useAbortController()
const programs = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getPrograms(undefined, { signal })
    programs.value = data.items
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Programs</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="programs.length" class="grid">
      <div v-for="prog in programs" :key="prog.id" class="col-12 md:col-6">
        <div class="surface-card p-4 border-round shadow-1">
          <div class="flex align-items-center gap-2 mb-2">
            <Tag :value="prog.type" severity="info" />
            <h3 class="m-0">{{ prog.title }}</h3>
          </div>
          <p class="text-color-secondary mb-3">{{ prog.description }}</p>
          <div v-if="prog.rules" class="mb-3">
            <h4 class="text-sm font-bold">Rules:</h4>
            <p class="text-sm text-color-secondary">{{ prog.rules }}</p>
          </div>
          <router-link :to="`/programs/${prog.id}`" custom v-slot="{ navigate }">
            <Button label="View details" size="small" @click="navigate" />
          </router-link>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No programs available.</div>
  </div>
</template>
