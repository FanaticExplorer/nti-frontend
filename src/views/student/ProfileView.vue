<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { getMyProfile, updateMyProfile, createProfile } from '@/api/profiles'
import { exportMyData, deleteMyAccount } from '@/api/users'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { signal } = useAbortController()
const profile = ref(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const exporting = ref(false)
const deleteConfirmVisible = ref(false)
const deleting = ref(false)

const form = ref({
  university: '',
  faculty: '',
  study_program: '',
  year_of_study: '',
  gpa: '',
  has_academic_debt: false,
  skills: '',
  bio: ''
})

onMounted(async () => {
  try {
    const { data } = await getMyProfile({ signal })
    profile.value = data
    Object.assign(form.value, data)
  } catch (err) {
    if (err.response?.status === 404) {
      profile.value = null
    } else if (err?.code !== "ERR_CANCELED") {
      toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.detail || 'Failed to load data', life: 5000 })
    }
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      year_of_study: parseInt(form.value.year_of_study) || null,
      skills: typeof form.value.skills === 'string' ? form.value.skills.split(',').map((s) => s.trim()).filter(Boolean) : form.value.skills
    }
    const { data } = profile.value ? await updateMyProfile(payload) : await createProfile(payload)
    profile.value = data
    editing.value = false
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

function startEdit() {
  editing.value = true
}

async function handleExport() {
  exporting.value = true
  try {
    const response = await exportMyData()
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-data.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Data exported', life: 3000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Export failed', life: 5000 })
  } finally {
    exporting.value = false
  }
}

async function handleDeleteAccount() {
  deleting.value = true
  try {
    await deleteMyAccount()
    deleteConfirmVisible.value = false
    toast.add({ severity: 'success', summary: 'Account deleted', detail: 'Your account has been anonymized.', life: 5000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">My Profile</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="profile || editing" class="surface-card p-4 border-round shadow-1" style="max-width: 700px;">
      <template v-if="!editing">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="m-0">Profile Details</h3>
          <Button label="Edit" icon="pi pi-pencil" @click="startEdit" size="small" />
        </div>
        <div class="grid">
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">University</p>
            <p class="mb-2">{{ profile.university || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Faculty</p>
            <p class="mb-2">{{ profile.faculty || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Study Program</p>
            <p class="mb-2">{{ profile.study_program || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Year</p>
            <p class="mb-2">{{ profile.year_of_study || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">GPA</p>
            <p class="mb-2">{{ profile.gpa || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Academic Debt</p>
            <p class="mb-2">{{ profile.has_academic_debt ? 'Yes' : 'No' }}</p>
          </div>
          <div class="col-12">
            <p class="text-sm text-color-secondary m-0">Skills</p>
            <div class="flex gap-1 flex-wrap mt-1">
              <Tag v-for="skill in profile.skills" :key="skill" :value="skill" />
            </div>
          </div>
          <div class="col-12">
            <p class="text-sm text-color-secondary m-0">Bio</p>
            <p class="mb-0">{{ profile.bio || '-' }}</p>
          </div>
        </div>
      </template>
      <template v-else>
        <h3 class="mb-3">Edit Profile</h3>
        <div class="grid">
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">University</label>
            <InputText v-model="form.university" class="w-full" />
          </div>
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">Faculty</label>
            <InputText v-model="form.faculty" class="w-full" />
          </div>
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">Study Program</label>
            <InputText v-model="form.study_program" class="w-full" />
          </div>
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">Year of Study</label>
            <InputText v-model="form.year_of_study" class="w-full" />
          </div>
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">GPA</label>
            <InputText v-model="form.gpa" class="w-full" />
          </div>
          <div class="col-6 mb-3">
            <label class="text-sm mb-1 block">Academic Debt</label>
            <Checkbox v-model="form.has_academic_debt" :binary="true" class="mt-2" />
          </div>
          <div class="col-12 mb-3">
            <label class="text-sm mb-1 block">Skills (comma separated)</label>
            <InputText v-model="form.skills" class="w-full" />
          </div>
          <div class="col-12 mb-3">
            <label class="text-sm mb-1 block">Bio</label>
            <Textarea v-model="form.bio" class="w-full" rows="4" />
          </div>
        </div>
        <div class="flex gap-2">
          <Button label="Save" :loading="saving" @click="handleSave" />
          <Button label="Cancel" severity="secondary" @click="editing = false" />
        </div>
      </template>
    </div>
    <div v-else class="surface-card p-4 border-round shadow-1 text-center" style="max-width: 700px;">
      <i class="pi pi-user-edit text-3xl mb-2"></i>
      <p class="mb-3">No profile yet. Create one to get started.</p>
      <Button label="Create Profile" @click="editing = true" />
    </div>

    <div class="surface-card p-4 border-round shadow-1 mt-4" style="max-width: 700px;">
      <h3 class="text-lg mb-3">Privacy & Data</h3>
      <div class="flex gap-2">
        <Button label="Export My Data" icon="pi pi-download" severity="secondary" :loading="exporting" @click="handleExport" />
        <Button label="Delete My Account" icon="pi pi-trash" severity="danger" @click="deleteConfirmVisible = true" />
      </div>
    </div>

    <Dialog v-model:visible="deleteConfirmVisible" header="Delete Account" :modal="true" :style="{ width: '450px' }">
      <p>This will anonymize your account and remove all personal data. This action cannot be undone. Are you sure?</p>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteConfirmVisible = false" />
        <Button label="Delete My Account" severity="danger" :loading="deleting" @click="handleDeleteAccount" />
      </template>
    </Dialog>
  </div>
</template>
