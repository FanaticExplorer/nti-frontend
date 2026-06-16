<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { verifyEmail } from '@/api/auth'

const route = useRoute()
const message = ref('')
const success = ref(false)
const loading = ref(true)

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    message.value = 'No verification token provided.'
    loading.value = false
    return
  }
  try {
    await verifyEmail(token)
    success.value = true
    message.value = 'Your email has been verified. You can now log in.'
  } catch (err) {
    success.value = false
    message.value = err.response?.data?.detail || 'Email verification failed.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 border-round shadow-2 text-center" style="width: 400px;">
      <i v-if="loading" class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
      <i v-else-if="success" class="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
      <i v-else class="pi pi-times-circle text-4xl text-red-500 mb-3"></i>
      <h2 class="mb-2">Email Verification</h2>
      <p class="text-color-secondary mb-3">{{ message }}</p>
      <router-link v-if="success" to="/login" class="p-button p-button-sm no-underline">Go to Login</router-link>
    </div>
  </div>
</template>
