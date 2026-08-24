export interface AppNavigationItem {
  key: string;
  label: string;
  path: string;
  requiresAdmin: boolean;
  showInFooter: boolean;
  sidebarOrder: number;
  footerSlot?: number;
  activePaths?: string[];
}

export const FOOTER_NAV_SLOT_COUNT = 10;

export const appNavigationItems: AppNavigationItem[] = [
  {
    key: 'health-check',
    label: '健康检查',
    path: '/health-check',
    requiresAdmin: false,
    showInFooter: false,
    sidebarOrder: 20,
  },
  {
    key: 'api-demo',
    label: 'API测试',
    path: '/api-demo',
    requiresAdmin: false,
    showInFooter: false,
    sidebarOrder: 30,
  },
  {
    key: 'tube-edit-ndt',
    label: 'NDT管捆编辑',
    path: '/tube-edit-ndt',
    requiresAdmin: false,
    showInFooter: false,
    sidebarOrder: 40,
  },
  {
    key: 'bundle-manage',
    label: '管捆编辑',
    path: '/bundle-manage',
    requiresAdmin: false,
    showInFooter: true,
    sidebarOrder: 50,
    footerSlot: 4,
  },
  {
    key: 'contract-editing',
    label: '合同数据编辑',
    path: '/contract-editing',
    requiresAdmin: false,
    showInFooter: true,
    sidebarOrder: 60,
    footerSlot: 1,
  },
  {
    key: 'main-monitor',
    label: '主监控',
    path: '/main-monitor',
    requiresAdmin: false,
    showInFooter: true,
    sidebarOrder: 70,
    footerSlot: 0,
  },
  {
    key: 'parameter-setting',
    label: '参数设定',
    path: '/parameter-setting',
    requiresAdmin: false,
    showInFooter: true,
    sidebarOrder: 80,
    footerSlot: 2,
  },
  {
    key: 'mode-setting',
    label: '格式设定',
    path: '/mode-setting',
    requiresAdmin: false,
    showInFooter: true,
    sidebarOrder: 90,
    footerSlot: 3,
  },
];

export const sidebarNavigationItems = [...appNavigationItems].sort(
  (left, right) => left.sidebarOrder - right.sidebarOrder,
);

export const footerNavigationItems = [...appNavigationItems]
  .filter((item) => item.showInFooter)
  .sort(
    (left, right) =>
      (left.footerSlot ?? Number.MAX_SAFE_INTEGER) - (right.footerSlot ?? Number.MAX_SAFE_INTEGER),
  );

export function isNavigationItemActive(item: AppNavigationItem, currentPath: string): boolean {
  return (item.activePaths ?? [item.path]).includes(currentPath);
}
