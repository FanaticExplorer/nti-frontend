<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useConfirm } from 'primevue/useconfirm'
import { getUsers, changeUserRole, deactivateUser } from '@/api/users'
import RoleBadge from '@/components/RoleBadge.vue'

const toast = useToastStore()
const confirm = useConfirm()

const users = ref([])
const loading = ref(true)
const filterRole = ref(null)

const roleOptions = [
  { label: 'All', value: null },
  { label: 'Student', value: 'student' },
  { label: 'Team Leader', value: 'team_leader' },
  { label: 'Firm', value: 'firm' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Evaluator', value: 'evaluator' },
  { label: 'NTI Admin', value: 'nti_admin' },
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Content Editor', value: 'content_editor' }
]

onMounted(fetchUsers)

async function fetchUsers() {
  loading.value = true
  try {
    const params = {}
    if (filterRole.value) params.role = filterRole.value
    const { data } = await getUsers(params)
    users.value = data.items
  } catch (err) { toast.error('Error', err?.response?.data?.detail || 'Action failed') } finally {
    loading.value = false
  }
}

async function handleRoleChange(user, newRole) {
  try {
    await changeUserRole(user.id, { role: newRole })
    toast.success('Role updated', `${user.full_name} is now ${newRole}`, 3000)
    await fetchUsers()
  } catch (err) { toast.error('Error', err?.response?.data?.detail || 'Action failed') }
}

async function handleDeactivate(user) {
  confirm.require({
    message: `Deactivate ${user.full_name}?`,
    header: 'Confirm Deactivation',
    accept: async () => {
      try {
        await deactivateUser(user.id)
        toast.success('User deactivated', '', 3000)
        await fetchUsers()
      } catch (err) { toast.error('Error', err?.response?.data?.detail || 'Action failed') }
    }
  })
}
</script>

<template>
  <div>
    <h2 class="mb-4">Users</h2>
    <div class="flex gap-3 align-items-end mb-4">
      <div class="flex flex-column gap-1">
        <label class="text-sm">Filter by Role</label>
        <Dropdown v-model="filterRole" :options="roleOptions" optionLabel="label" optionValue="value" @change="fetchUsers" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center p-4">
      <ProgressBar mode="indeterminate" style="width: 300px;" />
    </div>
    <div v-else-if="users.length" class="surface-card border-round shadow-1 p-3">
      <DataTable :value="users" class="p-datatable-sm" paginator :rows="10">
        <Column field="full_name" header="Name" />
        <Column field="email" header="Email" />
        <Column header="Role">
          <template #body="{ data }">
            <RoleBadge :role="data.role" />
          </template>
        </Column>
        <Column header="Active">
          <template #body="{ data }">
            <Tag :value="data.is_active ? 'Yes' : 'No'" :severity="data.is_active ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column header="Created">
          <template #body="{ data }">
            <small>{{ new Date(data.created_at).toLocaleDateString() }}</small>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Dropdown
                :modelValue="data.role"
                :options="roleOptions.filter((r) => r.value)"
                optionLabel="label"
                optionValue="value"
                @change="(e) => handleRoleChange(data, e.value)"
                class="w-8rem"
              />
              <Button v-if="data.is_active" icon="pi pi-ban" severity="danger" text size="small" @click="handleDeactivate(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <div v-else class="text-center text-color-secondary p-4">No users found.</div>
  </div>
</template>
