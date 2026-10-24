import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/onboarding/whatsapp',
      name: 'onboarding-whatsapp',
      component: () => import('@/views/onboarding/OnboardingWhatsappView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'painel' },
        },
        {
          path: 'painel',
          name: 'painel',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: 'Painel' },
        },
        {
          path: 'conversas',
          name: 'conversas',
          component: () => import('@/views/ConversasView.vue'),
          meta: { title: 'Conversas', fullBleed: true },
        },
        {
          path: 'automacoes',
          name: 'automacoes',
          component: () => import('@/views/AutomacoesView.vue'),
          meta: { title: 'Automações' },
        },
        {
          path: 'automacoes/editor',
          name: 'automacao-editor',
          component: () => import('@/views/AutomacaoEditorView.vue'),
          meta: { title: 'Editor de automação' },
        },
        {
          path: 'respostas-automaticas',
          name: 'respostas-automaticas',
          component: () => import('@/views/RespostasAutomaticasView.vue'),
          meta: { title: 'Respostas automáticas' },
        },
        {
          path: 'contatos',
          name: 'contatos',
          component: () => import('@/views/ContatosView.vue'),
          meta: { title: 'Contatos' },
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: () => import('@/views/ConfiguracoesView.vue'),
          meta: { title: 'Configurações' },
        },
        {
          path: 'configuracoes/whatsapp',
          name: 'configuracoes-whatsapp',
          component: () => import('@/views/WhatsappConfigView.vue'),
          meta: { title: 'WhatsApp — Configurações' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'painel' },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.bootstrapped) {
    await auth.bootstrap()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'painel' }
  }

  return true
})

export default router
