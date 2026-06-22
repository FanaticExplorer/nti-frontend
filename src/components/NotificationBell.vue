<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const notificationsStore = useNotificationsStore()
const popoverVisible = ref(false)

onMounted(() => {
  if (auth.isLoggedIn) {
    notificationsStore.fetchUnreadCount()
  }
})

function togglePopover(event) {
  popoverVisible.value = !popoverVisible.value
  if (popoverVisible.value) {
    notificationsStore.fetchNotifications()
  }
}

function handleToggleRead(id) {
  notificationsStore.toggleRead(id)
}

function handleMarkAllRead() {
  notificationsStore.markAllRead()
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <div v-if="auth.isLoggedIn" class="relative">
    <Button
      :badge="notificationsStore.unreadCount > 0 ? String(notificationsStore.unreadCount) : undefined"
      badgeSeverity="danger"
      icon="pi pi-bell"
      severity="secondary"
      variant="text"
      size="small"
      rounded
      @click="togglePopover"
    />

    <Popover v-model:visible="popoverVisible" :style="{ width: '360px' }">
      <div class="flex flex-column">
        <div class="flex justify-content-between align-items-center px-2 py-2 border-bottom-1 surface-border">
          <span class="font-bold">Notifications</span>
          <Button
            v-if="notificationsStore.unreadCount > 0"
            label="Mark all read"
            size="small"
            variant="text"
            @click="handleMarkAllRead"
          />
        </div>
        <div class="overflow-y-auto" style="max-height: 400px;">
          <div v-if="notificationsStore.loading" class="flex justify-content-center p-3">
            <i class="pi pi-spin pi-spinner" />
          </div>
          <div v-else-if="!notificationsStore.notifications.length" class="text-center text-color-secondary p-4">
            No notifications
          </div>
          <div
            v-for="item in notificationsStore.notifications"
            :key="item.id"
            class="flex align-items-start gap-3 px-3 py-2 border-bottom-1 surface-border cursor-pointer hover:surface-hover"
            :class="{ 'bg-blue-50': !item.is_read }"
            @click="handleToggleRead(item.id)"
          >
            <i
              :class="item.is_read ? 'pi pi-circle' : 'pi pi-circle-fill'"
              class="text-xs mt-1"
              :style="{ color: item.is_read ? 'var(--text-color-secondary)' : 'var(--primary-color)' }"
            />
            <div class="flex-grow-1">
              <div class="text-sm font-medium">{{ item.title }}</div>
              <div class="text-xs text-color-secondary">{{ item.body }}</div>
              <div class="text-xs text-color-secondary mt-1">{{ timeAgo(item.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </Popover>
  </div>
</template>
