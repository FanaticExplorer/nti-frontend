import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)

  const isLoggedIn = computed(() => !!accessToken.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => ['nti_admin', 'super_admin'].includes(userRole.value))

  function init() {
    const storedToken = localStorage.getItem('access_token')
    const storedRefresh = localStorage.getItem('refresh_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) accessToken.value = storedToken
    if (storedRefresh) refreshToken.value = storedRefresh
    if (storedUser) {
      try { user.value = JSON.parse(storedUser) } catch { /* ignore */ }
    }
  }

  async function login(email, password) {
    const { data } = await authApi.login({ email, password })
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    user.value = data.user
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))

    const roleRoutes = {
      student: '/student/dashboard',
      team_leader: '/student/dashboard',
      firm: '/firm/dashboard',
      mentor: '/mentor/dashboard',
      evaluator: '/evaluator/dashboard',
      content_editor: '/admin/content',
      nti_admin: '/admin/dashboard',
      super_admin: '/admin/dashboard'
    }
    router.push(roleRoutes[data.user.role] || '/')
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.clear()
    router.push('/login')
  }

  return { user, accessToken, refreshToken, isLoggedIn, userRole, isAdmin, init, login, logout }
})
