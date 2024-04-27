import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/register',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegisterPage.vue') }],
  },
  {
    path: '/stats',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/StatsPage.vue') }],
  },
  {
    path: '/names',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/CatNamesPage.vue') }],
  },
  {
    path: '/admin',
    meta: { requiresAdmin: true },
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/AdminPage.vue') }],
  },
  {
    path: '/cat',
    component: () => import('layouts/BaseLayout.vue'),
    children: [
      {
        path: 'detail/:id/:tab',
        component: () => import('src/pages/CatDetail.vue'),
      },
      { path: 'all', component: () => import('pages/FindCat.vue') },
    ],
  },
  {
    path: '/team',
    component: () => import('layouts/TeamLayout.vue'),
    children: [{ path: '', component: () => import('pages/TeamPage.vue') }],
  },
  {
    path: '/help_1',
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/help/Help_1.vue') }],
  },

  {
    path: '/deduplication',
    meta: { requiresAdmin: true },
    component: () => import('layouts/BaseLayout.vue'),
    children: [{ path: '', component: () => import('pages/deduplication/DeduplicationPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
