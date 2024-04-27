import { route } from 'quasar/wrappers';
import { userAuthStore } from 'src/stores/auth-store';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({}) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const store = userAuthStore();
    // See if any of the matched routes has meta "requiresAuth"
    if (to.matched.some((route) => route.meta.requiresAdmin)) {
      // Yes this route requires authentication. See if the user is authenticated.
      if (store.getStatus === 'start') {
        await store.check();
      }
      if (store.isSuperAdmin) {
        // User is authenticated, we allow access.
        next();
      } else {
        // User is not authenticated. We can redirect her to
        // our login page. Or wherever we want.
        next('/');
      }
    } else {
      next();
    }
  });

  return Router;
});
