<script setup>
import { ref } from 'vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  fetchFn: { type: Function, required: true },
  columns: { type: Array, required: true }
})

const emit = defineEmits(['rowClick'])

const toast = useToastStore()
const data = ref([])
const loading = ref(false)
const totalRecords = ref(0)
const skip = ref(0)
const limit = ref(10)

async function loadData() {
  loading.value = true
  try {
    const res = await props.fetchFn({ skip: skip.value, limit: limit.value })
    data.value = res.data.items || res.data
    totalRecords.value = res.data.total || data.value.length
  } catch {
    toast.error('Error', 'Failed to load data')
    data.value = []
  } finally {
    loading.value = false
  }
}

function onPage(event) {
  skip.value = event.first
  limit.value = event.rows
  loadData()
}
</script>

<template>
  <DataTable
    :value="data"
    :columns="columns"
    :loading="loading"
    :paginator="true"
    :rows="limit"
    :totalRecords="totalRecords"
    lazy
    @page="onPage"
    @row-click="(e) => emit('rowClick', e.data)"
  />
</template>
