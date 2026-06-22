import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as notificationsApi from '@/api/notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const notifications = ref([])
  const loading = ref(false)

  async function fetchUnreadCount() {
    try {
      const { data } = await notificationsApi.getUnreadCount()
      unreadCount.value = data.count ?? data.unread_count ?? 0
    } catch {
      // silently ignore — user might not be logged in
    }
  }

  async function fetchNotifications(skip = 0, limit = 20) {
    loading.value = true
    try {
      const { data } = await notificationsApi.getNotifications({ skip, limit })
      notifications.value = data.items
      return data
    } catch {
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  async function toggleRead(id) {
    try {
      const { data } = await notificationsApi.toggleNotificationRead(id)
      const idx = notifications.value.findIndex((n) => n.id === id)
      if (idx !== -1) {
        notifications.value[idx] = { ...notifications.value[idx], is_read: data.is_read }
      }
      await fetchUnreadCount()
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead()
      notifications.value.forEach((n) => { n.is_read = true })
      unreadCount.value = 0
    } catch {
      // ignore
    }
  }

  return { unreadCount, notifications, loading, fetchUnreadCount, fetchNotifications, toggleRead, markAllRead }
})
