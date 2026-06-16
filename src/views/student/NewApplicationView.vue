<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getCalls } from '@/api/calls'
import { getMyTeams } from '@/api/teams'
import { createApplication } from '@/api/applications'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { signal } = useAbortController()

const step = ref(1)
const calls = ref([])
const teams = ref([])
const loading = ref(true)
const saving = ref(false)

const selectedCall = ref(null)
const selectedTeam = ref(null)
const formData = ref({
  project_title: '',
  project_description: '',
  motivation: '',
  expected_outcome: ''
})

onMounted(async () => {
  try {
    const [callsRes, teamsRes] = await Promise.all([
      getCalls(undefined, { signal }),
      getMyTeams(undefined, { signal })
    ])
    calls.value = callsRes.data.items
    teams.value = teamsRes.data.items

    const callId = route.query.call_id
    if (callId) {
      selectedCall.value = calls.value.find((c) => c.id.toString() === callId.toString()) || null
    }
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 5000 })
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  try {
    const { data } = await createApplication({
      call_id: selectedCall.value.id,
      team_id: selectedTeam.value.id,
      form_data: formData.value,
      is_draft: true
    })
    router.push(`/student/applications/${data.id}`)
    toast.add({ severity: 'success', summary: 'Application saved as draft', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">New Application</h2>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else>
      <div class="surface-card p-4 border-round shadow-1" style="max-width: 700px;">
        <Steps :model="[
          { label: 'Select Call' },
          { label: 'Select Team' },
          { label: 'Application Form' }
        ]" :activeStep="step - 1" class="mb-4" />

        <div v-if="step === 1">
          <h3 class="mb-3">Select Call</h3>
          <Dropdown v-model="selectedCall" :options="calls" optionLabel="title" placeholder="Select a call" class="w-full mb-3" :disabled="!!route.query.call_id" />
          <div class="flex justify-content-end">
            <Button label="Next" :disabled="!selectedCall" @click="step = 2" />
          </div>
        </div>

        <div v-if="step === 2">
          <h3 class="mb-3">Select Team</h3>
          <Dropdown v-model="selectedTeam" :options="teams" optionLabel="name" placeholder="Select a team" class="w-full mb-3" />
          <div class="flex justify-content-between">
            <Button label="Back" severity="secondary" @click="step = 1" />
            <Button label="Next" :disabled="!selectedTeam" @click="step = 3" />
          </div>
        </div>

        <div v-if="step === 3">
          <h3 class="mb-3">Application Form</h3>
          <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-1">
              <label>Project Title</label>
              <InputText v-model="formData.project_title" />
            </div>
            <div class="flex flex-column gap-1">
              <label>Project Description</label>
              <Textarea v-model="formData.project_description" rows="4" />
            </div>
            <div class="flex flex-column gap-1">
              <label>Motivation</label>
              <Textarea v-model="formData.motivation" rows="3" />
            </div>
            <div class="flex flex-column gap-1">
              <label>Expected Outcome</label>
              <Textarea v-model="formData.expected_outcome" rows="3" />
            </div>
          </div>
          <div class="flex justify-content-between mt-4">
            <Button label="Back" severity="secondary" @click="step = 2" />
            <Button label="Save as Draft" icon="pi pi-save" :loading="saving" @click="handleSave" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
