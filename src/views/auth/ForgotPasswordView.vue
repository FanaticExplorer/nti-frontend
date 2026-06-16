<script setup>
import { ref } from 'vue'
import { forgotPassword } from '@/api/auth'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await forgotPassword(email.value)
    sent.value = true
  } catch (err) {
    sent.value = true
    if (err.response?.status !== 404) {
      toast.error('Error', err.response?.data?.detail || 'Failed to send request')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 border-round shadow-2" style="width: 400px;">
      <h2 class="text-center mb-4">Forgot Password</h2>
      <div v-if="sent" class="text-center">
        <i class="pi pi-envelope text-4xl text-primary mb-3"></i>
        <p>If this email exists, you will receive a reset link.</p>
        <router-link to="/login" class="p-button p-button-sm no-underline mt-2">Back to Login</router-link>
      </div>
      <form v-else @submit.prevent="handleSubmit" class="flex flex-column gap-3">
        <div class="flex flex-column gap-1">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="email" required />
        </div>
        <Button type="submit" label="Send Reset Link" :loading="loading" />
        <router-link to="/login" class="text-center text-sm text-color-secondary">Back to Login</router-link>
      </form>
    </div>
  </div>
</template>
