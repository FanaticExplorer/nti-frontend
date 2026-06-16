import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'

export const useToastStore = defineStore('toast', () => {
  const toast = useToast()

  function success(summary, detail = '', life = 3000) {
    toast.add({ severity: 'success', summary, detail, life })
  }

  function error(summary, detail = '', life = 5000) {
    toast.add({ severity: 'error', summary, detail, life })
  }

  function info(summary, detail = '', life = 3000) {
    toast.add({ severity: 'info', summary, detail, life })
  }

  return { success, error, info }
})
