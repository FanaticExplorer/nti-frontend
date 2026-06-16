<script setup>
import { ref, onMounted } from 'vue'
import { getMyProfile, updateMyProfile } from '@/api/profiles'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const profile = ref(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)

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
    const { data } = await getMyProfile()
    profile.value = data
    Object.assign(form.value, data)
  } catch (err) {
    if (err.response?.status === 404) {
      profile.value = null
    } else {
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
      skills: form.value.skills.split(',').map((s) => s.trim()).filter(Boolean)
    }
    const { data } = await updateMyProfile(payload)
    profile.value = data
    editing.value = false
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

function startEdit() {
  editing.value = true
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
  </div>
</template>
