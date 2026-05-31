import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser, isAuthenticated } from '@/api';

const HomePage = () => import('../views/HomePage.vue');
const AdminAlarmManagementView = () => import('../views/AdminAlarmManagementView.vue');
const LoginView = () => import('../views/LoginView.vue');
const HealthCheckView = () => import('../views/HealthCheckView.vue');
const ApiDemoView = () => import('../views/ApiDemoView.vue');
const TubeEditNDTView = () => import('../views/TubeEditNDTView.vue');
const BundleManageView = () => import('../views/BundleManageView.vue');
const ComponentTestView = () => import('../views/ComponentTestView.vue');
const ContractEditingView = () => import('../views/ContractEditingView.vue');
const MainMonitorView = () => import('../views/MainMonitorView.vue');
const ParameterSettingView = () => import('../views/ParameterSettingView.vue');
const ModeSettingView = () => import('../views/ModeSettingView.vue');

declare module 'vue-router' {
  interface RouteMeta {
    hmiScale?: {
      designWidth?: number;
      designHeight?: number;
    };
    requiresAdmin?: boolean;
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
          redirect: '/main-monitor',
        },
        {
          path: 'alarm-management',
          name: 'alarm-management',
          component: AdminAlarmManagementView,
          meta: {
            requiresAdmin: true,
            hmiScale: {
              designWidth: 1920,
              designHeight: 1080,
            },
          },
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
          meta: {
            hmiScale: {
              designWidth: 1920,
              designHeight: 1080,
            },
          },
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
          meta: {
            hmiScale: {
              designWidth: 1920,
              designHeight: 1080,
            },
          },
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
        {
          path: 'parameter-setting',
          name: 'parameter-setting',
          component: ParameterSettingView,
          meta: {
            hmiScale: {
              designWidth: 1920,
              designHeight: 1080,
            },
          },
        },
        {
          path: 'mode-setting',
          name: 'mode-setting',
          component: ModeSettingView,
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

router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) {
    return true;
  }

  if (!isAuthenticated()) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    };
  }

  const currentUser = getCurrentUser();
  if (currentUser?.role !== 'admin') {
    return {
      name: 'main-monitor',
    };
  }

  return true;
});

export default router;
