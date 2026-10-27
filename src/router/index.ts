import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layouts/AppLayout.vue'
import OnboardingLayout from '@/layouts/OnboardingLayout.vue'
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
      path: '/contratacao',
      component: OnboardingLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'plano',
          name: 'assinatura-planos',
          component: () => import('@/views/billing/PlanosView.vue'),
          meta: { title: 'Planos' },
        },
        {
          path: 'pagamento',
          name: 'assinatura-checkout',
          component: () => import('@/views/billing/BillingCheckoutView.vue'),
          meta: { title: 'Pagamento' },
        },
        {
          path: 'ativacao',
          name: 'assinatura-ativacao',
          component: () => import('@/views/billing/AtivacaoView.vue'),
          meta: { title: 'Ativação' },
        },
      ],
    },
    {
      path: '/assinatura/planos',
      redirect: { name: 'assinatura-planos' },
    },
    {
      path: '/assinatura/checkout',
      redirect: { name: 'assinatura-checkout' },
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
          path: 'funil-atendimento',
          name: 'funil-atendimento',
          component: () => import('@/views/FunilAtendimentoView.vue'),
          meta: { title: 'Funil de atendimento' },
        },
        {
          path: 'mensagens-agendadas',
          name: 'mensagens-agendadas',
          component: () => import('@/views/MensagensAgendadasView.vue'),
          meta: { title: 'Mensagens agendadas' },
        },
        {
          path: 'equipe',
          name: 'equipe',
          component: () => import('@/views/EquipeDistribuicaoView.vue'),
          meta: { title: 'Equipe e distribuição' },
        },
        {
          path: 'relatorios',
          name: 'relatorios',
          component: () => import('@/views/RelatoriosView.vue'),
          meta: { title: 'Relatórios' },
        },
        {
          path: 'campanhas',
          name: 'campanhas',
          component: () => import('@/views/CampanhasView.vue'),
          meta: { title: 'Campanhas', activeNav: 'campanhas' },
        },
        {
          path: 'campanhas/nova',
          name: 'campanhas-nova',
          component: () => import('@/views/NovaCampanhaView.vue'),
          meta: { title: 'Nova campanha', activeNav: 'campanhas' },
        },
        {
          path: 'campanhas/sequencias',
          name: 'campanhas-sequencias',
          component: () => import('@/views/SequenciasListView.vue'),
          meta: { title: 'Sequências', activeNav: 'campanhas' },
        },
        {
          path: 'campanhas/sequencias/nova',
          name: 'campanhas-sequencias-nova',
          component: () => import('@/views/SequenciaFollowUpView.vue'),
          meta: { title: 'Nova sequência', activeNav: 'campanhas' },
        },
        {
          path: 'campanhas/sequencias/:id',
          name: 'campanhas-sequencia-detalhe',
          component: () => import('@/views/SequenciaFollowUpView.vue'),
          meta: { title: 'Sequência', activeNav: 'campanhas' },
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
        {
          path: 'assinatura',
          name: 'minha-assinatura',
          component: () => import('@/views/billing/MinhaAssinaturaView.vue'),
          meta: { title: 'Minha assinatura' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Página não encontrada' },
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
