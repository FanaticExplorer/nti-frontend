<script setup>
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  message: { type: String, default: 'Are you sure?' },
  header: { type: String, default: 'Confirm' }
})

const emit = defineEmits(['confirm'])

const confirm = useConfirm()

function show() {
  confirm.require({
    message: props.message,
    header: props.header,
    accept: () => emit('confirm')
  })
}

defineExpose({ show })
</script>

<template>
  <ConfirmDialog />
</template>
