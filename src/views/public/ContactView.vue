<script setup>
import { ref } from 'vue'
import { sendContactMessage } from '@/api/contact'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const form = ref({ name: '', email: '', message: '' })
const sending = ref(false)
const sent = ref(false)

async function handleSubmit() {
  sending.value = true
  try {
    await sendContactMessage(form.value)
    sent.value = true
    form.value = { name: '', email: '', message: '' }
    toast.add({ severity: 'success', summary: 'Message sent', detail: 'We will get back to you soon.', life: 5000 })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.detail || 'Failed to send message', life: 5000 })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Contact</h2>

    <div class="grid">
      <div class="col-12 md:col-5">
        <div class="surface-card p-4 border-round shadow-1">
          <h3 class="mb-3">Nitrian Technology Incubator</h3>
          <div class="flex flex-column gap-2 text-color-secondary">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-map-marker"></i>
              <span>Univerzitná 123, 949 01 Nitra, Slovakia</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-envelope"></i>
              <span>info@nti.sk</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-phone"></i>
              <span>+421 37 123 4567</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-7">
        <div class="surface-card p-4 border-round shadow-1">
          <h3 class="mb-3">Send us a message</h3>
          <div v-if="sent" class="text-center p-3">
            <i class="pi pi-check-circle text-3xl text-green-500 mb-2" />
            <p class="text-color-secondary">Thank you for your message!</p>
            <Button label="Send another" severity="secondary" size="small" @click="sent = false" />
          </div>
          <form v-else @submit.prevent="handleSubmit" class="flex flex-column gap-3">
            <div class="flex flex-column gap-1">
              <label class="text-sm">Name</label>
              <InputText v-model="form.name" required placeholder="Your name" />
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm">Email</label>
              <InputText v-model="form.email" type="email" required placeholder="your@email.com" />
            </div>
            <div class="flex flex-column gap-1">
              <label class="text-sm">Message</label>
              <Textarea v-model="form.message" required placeholder="Your message" rows="4" />
            </div>
            <Button label="Send" type="submit" icon="pi pi-send" :loading="sending" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
