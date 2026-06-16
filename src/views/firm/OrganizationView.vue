<script setup>
import { ref, onMounted } from 'vue'
import { useAbortController } from '@/composables/useAbortController'
import { useToast } from 'primevue/usetoast'
import { getOrganizations, updateOrganization, addOrganizationMember } from '@/api/organizations'
import StatusBadge from '@/components/StatusBadge.vue'

const toast = useToast()
const { signal } = useAbortController()
const org = ref(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const form = ref({})

const newMemberEmail = ref('')
const newMemberRole = ref('')
const addingMember = ref(false)

onMounted(async () => {
  try {
    const { data } = await getOrganizations(undefined, { signal })
    org.value = data.items?.[0] || null
    if (org.value) {
      form.value = { ...org.value }
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
    const { data } = await updateOrganization(org.value.id, form.value)
    org.value = data
    editing.value = false
    toast.add({ severity: 'success', summary: 'Organization updated', life: 3000 })
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Action failed', life: 5000 })
  } finally {
    saving.value = false
  }
}

async function handleAddMember() {
  if (!newMemberEmail.value) return
  addingMember.value = true
  try {
    await addOrganizationMember(org.value.id, { email: newMemberEmail.value, role_in_org: newMemberRole.value })
    newMemberEmail.value = ''
    newMemberRole.value = ''
    const { data } = await getOrganizations(undefined, { signal })
    org.value = data.items?.[0] || null
  } catch (err) {
    if (err?.code === "ERR_CANCELED") return
    toast.add({ severity: 'error', summary: 'Error', detail: 'Action failed', life: 5000 })
  } finally {
    addingMember.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">My Organization</h2>
    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <template v-else-if="org">
      <div v-if="!org.is_approved" class="p-3 bg-yellow-100 border-round mb-3 text-yellow-900">
        Pending admin approval
      </div>

      <div class="surface-card p-4 border-round shadow-1 mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="m-0">Organization Details</h3>
          <Button v-if="!editing" label="Edit" icon="pi pi-pencil" size="small" @click="editing = true" />
        </div>

        <div v-if="!editing" class="grid">
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Name</p>
            <p class="mb-2">{{ org.name }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Sector</p>
            <p class="mb-2">{{ org.sector || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Contact Email</p>
            <p class="mb-2">{{ org.contact_email || '-' }}</p>
          </div>
          <div class="col-6">
            <p class="text-sm text-color-secondary m-0">Status</p>
            <StatusBadge :status="org.is_approved ? 'approved' : 'draft'" />
          </div>
          <div class="col-12">
            <p class="text-sm text-color-secondary m-0">Description</p>
            <p>{{ org.description || '-' }}</p>
          </div>
        </div>
        <div v-else class="flex flex-column gap-3">
          <div class="flex flex-column gap-1">
            <label class="text-sm">Name</label>
            <InputText v-model="form.name" class="w-full" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="text-sm">Sector</label>
            <InputText v-model="form.sector" class="w-full" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="text-sm">Contact Email</label>
            <InputText v-model="form.contact_email" class="w-full" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="text-sm">Description</label>
            <Textarea v-model="form.description" rows="3" />
          </div>
          <div class="flex gap-2">
            <Button label="Save" :loading="saving" @click="handleSave" />
            <Button label="Cancel" severity="secondary" @click="editing = false" />
          </div>
        </div>
      </div>

      <div class="surface-card p-4 border-round shadow-1">
        <h3 class="text-lg mb-3">Members</h3>
        <div v-if="org.members?.length" class="mb-4">
          <DataTable :value="org.members" class="p-datatable-sm">
            <Column field="full_name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="role_in_org" header="Role" />
          </DataTable>
        </div>
        <div v-else class="text-color-secondary mb-3">No members.</div>

        <div class="flex gap-2 align-items-end">
          <div class="flex flex-column gap-1">
            <label class="text-sm">Email</label>
            <InputText v-model="newMemberEmail" placeholder="member@example.com" />
          </div>
          <div class="flex flex-column gap-1">
            <label class="text-sm">Role</label>
            <InputText v-model="newMemberRole" placeholder="employee" />
          </div>
          <Button label="Add Member" icon="pi pi-plus" :loading="addingMember" @click="handleAddMember" />
        </div>
      </div>
    </template>
    <div v-else class="text-center text-color-secondary p-4">No organization found.</div>
  </div>
</template>
