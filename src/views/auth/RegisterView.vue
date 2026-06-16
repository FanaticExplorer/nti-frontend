<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const role = ref('student')
const loading = ref(false)
const error = ref('')

const roles = [
  { label: 'Student', value: 'student' },
  { label: 'Firm', value: 'firm' },
  { label: 'Mentor', value: 'mentor' }
]

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await register({ full_name: fullName.value, email: email.value, password: password.value, role: role.value, gdpr_consent: true })
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 border-round shadow-2" style="width: 400px;">
      <h2 class="text-center mb-4">Register</h2>
      <form @submit.prevent="handleRegister" class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label for="fullName">Full Name</label>
          <InputText id="fullName" v-model="fullName" required />
        </div>
        <div class="flex flex-column gap-1">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="email" required />
        </div>
        <div class="flex flex-column gap-1">
          <label for="password">Password</label>
          <Password id="password" v-model="password" required :feedback="false" toggleMask class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-column gap-1">
          <label for="role">Role</label>
          <Dropdown id="role" v-model="role" :options="roles" optionLabel="label" optionValue="value" />
        </div>
        <small v-if="error" class="text-red-500">{{ error }}</small>
        <Button type="submit" label="Register" :loading="loading" />
      </form>
      <p class="text-center text-sm mt-3">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>
