<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const auth = useAuthStore()
const isLoggedIn = computed(() => auth.isLoggedIn)
const user = computed(() => auth.user)
</script>

<template>
  <div class="flex flex-column min-h-screen">
    <header class="surface-section border-bottom-1 surface-border px-4 py-3">
      <div class="flex align-items-center justify-content-between" style="max-width: 1200px; margin: 0 auto;">
        <router-link to="/" class="text-xl font-bold text-primary no-underline">
          NTI
        </router-link>
        <nav class="flex align-items-center gap-3">
          <router-link to="/programs" class="text-color-secondary no-underline hover:text-primary">Programs</router-link>
          <router-link to="/calls" class="text-color-secondary no-underline hover:text-primary">Calls</router-link>
          <router-link to="/news" class="text-color-secondary no-underline hover:text-primary">News</router-link>
          <router-link to="/contact" class="text-color-secondary no-underline hover:text-primary">Contact</router-link>
          <router-link to="/tech-specs" class="text-color-secondary no-underline hover:text-primary">Tech Specs</router-link>
        </nav>
        <div class="flex align-items-center gap-2">
          <template v-if="isLoggedIn">
            <span class="text-color-secondary">{{ user?.full_name }}</span>
            <Button label="Logout" severity="secondary" variant="text" size="small" @click="auth.logout()" />
          </template>
          <template v-else>
            <router-link to="/login" custom v-slot="{ navigate }">
              <Button label="Login" variant="text" size="small" @click="navigate" />
            </router-link>
            <router-link to="/register" custom v-slot="{ navigate }">
              <Button label="Register" size="small" @click="navigate" />
            </router-link>
          </template>
        </div>
      </div>
    </header>
    <main class="flex-grow-1 p-4" style="max-width: 1200px; width: 100%; margin: 0 auto;">
      <RouterView />
    </main>
    <footer class="surface-section border-top-1 surface-border py-3 text-center text-color-secondary text-sm">
      &copy; 2026 NTI
    </footer>
  </div>
</template>
