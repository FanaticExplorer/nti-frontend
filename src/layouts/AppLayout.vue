<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from '@/components/NotificationBell.vue'

const auth = useAuthStore()
const route = useRoute()

const user = computed(() => auth.user)
const userRole = computed(() => auth.userRole)

const sidebarLinks = computed(() => {
  const role = userRole.value
  const links = {
    student: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/student/dashboard' },
      { label: 'My Profile', icon: 'pi pi-user', to: '/student/profile' },
      { label: 'My Teams', icon: 'pi pi-users', to: '/student/teams' },
      { label: 'My Applications', icon: 'pi pi-file', to: '/student/applications' }
    ],
    team_leader: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/student/dashboard' },
      { label: 'My Profile', icon: 'pi pi-user', to: '/student/profile' },
      { label: 'My Teams', icon: 'pi pi-users', to: '/student/teams' },
      { label: 'My Applications', icon: 'pi pi-file', to: '/student/applications' }
    ],
    firm: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/firm/dashboard' },
      { label: 'My Organization', icon: 'pi pi-building', to: '/firm/organization' },
      { label: 'Our Calls', icon: 'pi pi-megaphone', to: '/firm/calls' },
      { label: 'Tech Specs', icon: 'pi pi-cog', to: '/firm/tech-specs' }
    ],
    mentor: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/mentor/dashboard' },
      { label: 'My Mentorships', icon: 'pi pi-book', to: '/mentor/mentorships' }
    ],
    evaluator: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/evaluator/dashboard' },
      { label: 'Applications to Review', icon: 'pi pi-check-circle', to: '/evaluator/applications' }
    ],
    content_editor: [
      { label: 'Pages', icon: 'pi pi-file', to: '/admin/content' },
      { label: 'News', icon: 'pi pi-globe', to: '/admin/news' }
    ],
    nti_admin: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/admin/dashboard' },
      { label: 'Users', icon: 'pi pi-users', to: '/admin/users' },
      { label: 'Organizations', icon: 'pi pi-building', to: '/admin/organizations' },
      { label: 'Programs', icon: 'pi pi-sitemap', to: '/admin/programs' },
      { label: 'Calls', icon: 'pi pi-megaphone', to: '/admin/calls' },
      { label: 'Applications', icon: 'pi pi-file', to: '/admin/applications' },
      { label: 'Content Pages', icon: 'pi pi-file-edit', to: '/admin/content' },
      { label: 'News', icon: 'pi pi-globe', to: '/admin/news' }
    ],
    super_admin: [
      { label: 'Dashboard', icon: 'pi pi-home', to: '/admin/dashboard' },
      { label: 'Users', icon: 'pi pi-users', to: '/admin/users' },
      { label: 'Organizations', icon: 'pi pi-building', to: '/admin/organizations' },
      { label: 'Programs', icon: 'pi pi-sitemap', to: '/admin/programs' },
      { label: 'Calls', icon: 'pi pi-megaphone', to: '/admin/calls' },
      { label: 'Applications', icon: 'pi pi-file', to: '/admin/applications' },
      { label: 'Content Pages', icon: 'pi pi-file-edit', to: '/admin/content' },
      { label: 'News', icon: 'pi pi-globe', to: '/admin/news' },
      { label: 'Audit Log', icon: 'pi pi-list', to: '/admin/audit-log' }
    ]
  }
  return links[role] || []
})
</script>

<template>
  <div class="flex h-screen">
    <aside class="surface-section border-right-1 surface-border flex flex-column" style="width: 240px; flex-shrink: 0;">
      <div class="px-3 py-3 border-bottom-1 surface-border">
        <router-link to="/" class="text-xl font-bold text-primary no-underline">NTI</router-link>
      </div>
      <nav class="flex-grow-1 overflow-y-auto p-2">
        <router-link
          v-for="link in sidebarLinks"
          :key="link.to"
          :to="link.to"
          class="flex align-items-center gap-2 px-3 py-2 border-round text-color-secondary no-underline hover:surface-hover mb-1"
          active-class="bg-primary text-white"
        >
          <i :class="link.icon"></i>
          <span>{{ link.label }}</span>
        </router-link>
      </nav>
    </aside>
    <div class="flex flex-column flex-grow-1 overflow-hidden">
      <header class="surface-section border-bottom-1 surface-border px-4 py-3 flex align-items-center justify-content-between">
        <h2 class="text-lg m-0">{{ route.meta?.title || '' }}</h2>
        <div class="flex align-items-center gap-3">
          <NotificationBell />
          <span class="text-color-secondary">{{ user?.full_name }}</span>
          <Button label="Logout" severity="secondary" variant="text" size="small" @click="auth.logout()" />
        </div>
      </header>
      <main class="flex-grow-1 overflow-y-auto p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
