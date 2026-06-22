<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getFaq } from '@/api/content'
import { useToast } from 'primevue/usetoast'

const items = ref([])
const loading = ref(true)
const selectedCategory = ref(null)
const toast = useToast()
const { signal } = useAbortController()

onMounted(fetchFaq)

async function fetchFaq() {
  loading.value = true
  try {
    const params = {}
    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }
    const { data } = await getFaq(params, { signal })
    items.value = data.items || data
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load FAQ', life: 5000 })
  } finally {
    loading.value = false
  }
}

const categories = computed(() => {
  const cats = new Set()
  items.value.forEach((item) => {
    if (item.category) cats.add(item.category)
  })
  return [...cats].sort()
})

function filterByCategory(cat) {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
  fetchFaq()
}
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Frequently Asked Questions</h2>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else>
      <div v-if="categories.length" class="flex flex-wrap gap-2 mb-4">
        <Button
          v-for="cat in categories"
          :key="cat"
          :label="cat"
          :severity="selectedCategory === cat ? 'primary' : 'secondary'"
          :outlined="selectedCategory !== cat"
          size="small"
          @click="filterByCategory(cat)"
        />
      </div>

      <div v-if="items.length" class="surface-card border-round shadow-1">
        <Accordion :value="[]">
          <AccordionPanel v-for="item in items" :key="item.id" :value="item.id">
            <AccordionHeader>
              <div class="flex align-items-center gap-2">
                <span class="font-medium">{{ item.question }}</span>
                <Tag v-if="item.category" :value="item.category" severity="info" class="ml-2" />
              </div>
            </AccordionHeader>
            <AccordionContent>
              <p class="text-color-secondary m-0">{{ item.answer }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
      <div v-else class="text-center text-color-secondary p-4 surface-card border-round">
        <p>No FAQs yet.</p>
      </div>
    </template>
  </div>
</template>
