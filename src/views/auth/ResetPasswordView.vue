<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await resetPassword({ token: route.query.token, new_password: newPassword.value })
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Password reset failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 border-round shadow-2" style="width: 400px;">
      <h2 class="text-center mb-4">Reset Password</h2>
      <form @submit.prevent="handleSubmit" class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label for="newPassword">New Password</label>
          <Password id="newPassword" v-model="newPassword" required :feedback="false" toggleMask class="w-full" inputClass="w-full" />
        </div>
        <div class="flex flex-column gap-1">
          <label for="confirmPassword">Confirm Password</label>
          <Password id="confirmPassword" v-model="confirmPassword" required :feedback="false" toggleMask class="w-full" inputClass="w-full" />
        </div>
        <small v-if="error" class="text-red-500">{{ error }}</small>
        <Button type="submit" label="Reset Password" :loading="loading" />
      </form>
    </div>
  </div>
</template>
