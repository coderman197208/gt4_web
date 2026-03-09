import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginView from '../views/LoginView.vue';
import HealthCheckView from '../views/HealthCheckView.vue';
import ApiDemoView from '../views/ApiDemoView.vue';
import TubeEditNDTView from '../views/TubeEditNDTView.vue';
import BundleManageView from '../views/BundleManageView.vue';
import ComponentTestView from '../views/ComponentTestView.vue';
import ContractEditingView from '../views/ContractEditingView.vue';
import MainMonitorView from '../views/MainMonitorView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    hmiScale?: {
      designWidth?: number;
      designHeight?: number;
    };
  }
}

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
        {
          path: 'component-test',
          name: 'component-test',
          component: ComponentTestView,
        },
        {
          path: 'contract-editing',
          name: 'contract-editing',
          component: ContractEditingView,
        },
        {
          path: 'main-monitor',
          name: 'main-monitor',
          component: MainMonitorView,
          meta: {
            hmiScale: {
              designWidth: 1920,
              designHeight: 1080,
            },
          },
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
