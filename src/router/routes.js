const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/requisicao', component: () => import('pages/RequisicaoPage.vue') },
      { path: '/gestao', component: () => import('pages/GestaoPage.vue') },
      { path: '/pendencia', component: () => import('pages/PendenciaPage.vue') },
      { path: '/lista-requisicoes', component: () => import('pages/ListaRequisicoes.vue') },
      { path: '/sis', component: () => import('pages/SISPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
