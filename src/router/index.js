import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import PublicLayout from '@/layouts/PublicLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

import HomeView from '@/views/public/HomeView.vue'
import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramDetailView from '@/views/public/ProgramDetailView.vue'
import CallsView from '@/views/public/CallsView.vue'
import CallDetailView from '@/views/public/CallDetailView.vue'
import NewsView from '@/views/public/NewsView.vue'
import NewsDetailView from '@/views/public/NewsDetailView.vue'
import ContactView from '@/views/public/ContactView.vue'
import TechSpecBacklogView from '@/views/public/TechSpecBacklogView.vue'

import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

import StudentDashboard from '@/views/student/DashboardView.vue'
import StudentProfile from '@/views/student/ProfileView.vue'
import StudentTeams from '@/views/student/TeamsView.vue'
import StudentTeamDetail from '@/views/student/TeamDetailView.vue'
import StudentApplications from '@/views/student/ApplicationsView.vue'
import StudentApplicationDetail from '@/views/student/ApplicationDetailView.vue'
import StudentNewApplication from '@/views/student/NewApplicationView.vue'

import FirmDashboard from '@/views/firm/DashboardView.vue'
import FirmOrganization from '@/views/firm/OrganizationView.vue'
import FirmCalls from '@/views/firm/CallsView.vue'
import FirmTechSpecs from '@/views/firm/TechSpecsView.vue'

import MentorDashboard from '@/views/mentor/DashboardView.vue'
import MentorMentorships from '@/views/mentor/MentorshipsView.vue'
import MentorMentorshipDetail from '@/views/mentor/MentorshipDetailView.vue'

import EvaluatorDashboard from '@/views/evaluator/DashboardView.vue'
import EvaluatorApplications from '@/views/evaluator/ApplicationsView.vue'

import AdminDashboard from '@/views/admin/DashboardView.vue'
import AdminUsers from '@/views/admin/UsersView.vue'
import AdminOrganizations from '@/views/admin/OrganizationsView.vue'
import AdminPrograms from '@/views/admin/ProgramsView.vue'
import AdminCalls from '@/views/admin/CallsView.vue'
import AdminApplications from '@/views/admin/ApplicationsView.vue'
import AdminApplicationDetail from '@/views/admin/ApplicationDetailView.vue'
import AdminContent from '@/views/admin/ContentPagesView.vue'
import AdminNews from '@/views/admin/NewsView.vue'
import AdminAuditLog from '@/views/admin/AuditLogView.vue'

import UnauthorizedView from '@/views/shared/UnauthorizedView.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'programs', name: 'programs', component: ProgramsView },
      { path: 'programs/:id', name: 'program-detail', component: ProgramDetailView },
      { path: 'calls', name: 'calls', component: CallsView },
      { path: 'calls/:id', name: 'call-detail', component: CallDetailView },
      { path: 'news', name: 'news', component: NewsView },
      { path: 'news/:slug', name: 'news-detail', component: NewsDetailView },
      { path: 'contact', name: 'contact', component: ContactView },
      { path: 'tech-specs', name: 'tech-spec-backlog', component: TechSpecBacklogView }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView
  },
  {
    path: '/student',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['student', 'team_leader'] },
    children: [
      { path: 'dashboard', name: 'student-dashboard', component: StudentDashboard },
      { path: 'profile', name: 'student-profile', component: StudentProfile },
      { path: 'teams', name: 'student-teams', component: StudentTeams },
      { path: 'teams/:id', name: 'student-team-detail', component: StudentTeamDetail },
      { path: 'applications', name: 'student-applications', component: StudentApplications },
      { path: 'applications/new', name: 'student-new-application', component: StudentNewApplication },
      { path: 'applications/:id', name: 'student-application-detail', component: StudentApplicationDetail }
    ]
  },
  {
    path: '/firm',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['firm'] },
    children: [
      { path: 'dashboard', name: 'firm-dashboard', component: FirmDashboard },
      { path: 'organization', name: 'firm-organization', component: FirmOrganization },
      { path: 'calls', name: 'firm-calls', component: FirmCalls },
      { path: 'tech-specs', name: 'firm-tech-specs', component: FirmTechSpecs }
    ]
  },
  {
    path: '/mentor',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['mentor'] },
    children: [
      { path: 'dashboard', name: 'mentor-dashboard', component: MentorDashboard },
      { path: 'mentorships', name: 'mentor-mentorships', component: MentorMentorships },
      { path: 'mentorships/:id', name: 'mentor-mentorship-detail', component: MentorMentorshipDetail }
    ]
  },
  {
    path: '/evaluator',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['evaluator'] },
    children: [
      { path: 'dashboard', name: 'evaluator-dashboard', component: EvaluatorDashboard },
      { path: 'applications', name: 'evaluator-applications', component: EvaluatorApplications }
    ]
  },
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['nti_admin', 'super_admin', 'content_editor', 'evaluator', 'mentor'] },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'users', name: 'admin-users', component: AdminUsers, meta: { roles: ['nti_admin', 'super_admin'] } },
      { path: 'organizations', name: 'admin-organizations', component: AdminOrganizations, meta: { roles: ['nti_admin', 'super_admin'] } },
      { path: 'programs', name: 'admin-programs', component: AdminPrograms, meta: { roles: ['nti_admin', 'super_admin'] } },
      { path: 'calls', name: 'admin-calls', component: AdminCalls, meta: { roles: ['nti_admin', 'super_admin'] } },
      { path: 'applications', name: 'admin-applications', component: AdminApplications, meta: { roles: ['nti_admin', 'super_admin', 'evaluator'] } },
      { path: 'applications/:id', name: 'admin-application-detail', component: AdminApplicationDetail, meta: { roles: ['nti_admin', 'super_admin', 'evaluator', 'mentor'] } },
      { path: 'content', name: 'admin-content', component: AdminContent, meta: { roles: ['nti_admin', 'super_admin', 'content_editor'] } },
      { path: 'news', name: 'admin-news', component: AdminNews, meta: { roles: ['nti_admin', 'super_admin', 'content_editor'] } },
      { path: 'audit-log', name: 'admin-audit-log', component: AdminAuditLog, meta: { roles: ['super_admin'] } }
    ]
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    authStore.init()
    if (authStore.isLoggedIn && !authStore.user) {
      authStore.logout()
      return next('/login')
    }
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  const routeRoles = to.matched
    .map((r) => r.meta.roles)
    .filter(Boolean)
    .at(-1) || []

  if (routeRoles.length > 0 && !routeRoles.includes(authStore.userRole)) {
    return next('/unauthorized')
  }

  next()
})

export default router
