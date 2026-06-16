<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
  } catch (err) {
    const msg = err.response?.data?.detail || 'Login failed. Please try again.'
    error.value = msg
    toast.add({ severity: 'error', summary: 'Login failed', detail: msg, life: 5000 })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 border-round shadow-2" style="width: 400px;">
      <h2 class="text-center mb-4">Login</h2>
      <form @submit.prevent="handleLogin" class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="email" required :invalid="!!error" />
        </div>
        <div class="flex flex-column gap-1">
          <label for="password">Password</label>
          <Password id="password" v-model="password" required :feedback="false" toggleMask :invalid="!!error" class="w-full" inputClass="w-full" />
        </div>
        <small v-if="error" class="text-red-500">{{ error }}</small>
        <Button type="submit" label="Login" :loading="loading" />
      </form>
      <div class="flex justify-content-between mt-3 text-sm">
        <router-link to="/forgot-password" class="text-color-secondary">Forgot password?</router-link>
        <router-link to="/register" class="text-color-secondary">Register</router-link>
      </div>
    </div>
  </div>
</template>
