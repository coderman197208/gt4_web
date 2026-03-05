import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginView from '../views/LoginView.vue';
import HealthCheckView from '../views/HealthCheckView.vue';
import ApiDemoView from '../views/ApiDemoView.vue';
import TubeEditNDTView from '../views/TubeEditNDTView.vue';
import BundleManageView from '../views/BundleManageView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
      children: [
        {
          path: '',
          name: 'home',
          redirect: '/health-check',
        },
        {
          path: 'health-check',
          name: 'health-check',
          component: HealthCheckView,
        },
        {
          path: 'api-demo',
          name: 'api-demo',
          component: ApiDemoView,
        },
        {
          path: 'tube-edit-ndt',
          name: 'tube-edit-ndt',
          component: TubeEditNDTView,
        },
        {
          path: 'bundle-manage',
          name: 'bundle-manage',
          component: BundleManageView,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
