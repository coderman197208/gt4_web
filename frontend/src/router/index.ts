import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginView from '../views/LoginView.vue';
import HealthCheckView from '../views/HealthCheckView.vue';
import ApiDemoView from '../views/ApiDemoView.vue';
import TubeEditNDT from '../views/TubeEditNDT.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      children: [
        {
          path: '',
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
          component: TubeEditNDT,
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
