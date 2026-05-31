import type {
  AlarmAccessScope,
  AlarmArea,
  AuthenticatedUser,
  ManagedUserAlarmAreaContext,
  UpdateUserAlarmAreasRequest,
  UpdateUserAlarmAreasResponse,
  UserAlarmAreaContext,
} from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';
import { findMockUserById } from '../api/mockData.js';

type UserAreaAssignmentRow = {
  area_id: number;
  is_default: boolean;
  area: AlarmArea;
};

function buildAlarmAccessScopeFromAreas(
  areas: UserAlarmAreaContext['areas'],
  mode: AlarmAccessScope['mode'],
): AlarmAccessScope {
  const defaultArea = areas.find((area) => area.is_default) ?? areas[0];

  return {
    mode,
    default_area_id: defaultArea?.area_id ?? 0,
    area_ids: areas.map((area) => area.area_id),
    areas,
  };
}

function mapAssignmentRowsToAreas(rows: UserAreaAssignmentRow[]): UserAlarmAreaContext['areas'] {
  return rows
    .filter((row) => row.area.enabled)
    .sort((left, right) => left.area.sort_order - right.area.sort_order)
    .map((row) => ({
      area_id: row.area_id,
      area_code: row.area.area_code,
      area_name: row.area.area_name,
      is_default: row.is_default,
    }));
}

function buildUserAlarmAreaContext(userId: number, scope: AlarmAccessScope): UserAlarmAreaContext {
  return {
    user_id: userId,
    default_area_id: scope.default_area_id,
    areas: scope.areas,
  };
}

async function loadAssignedAreaRows(userId: number): Promise<UserAreaAssignmentRow[]> {
  return prisma.userArea.findMany({
    where: { user_id: userId },
    include: {
      area: true,
    },
  });
}

async function loadEnabledAreaDefinitions(): Promise<AlarmArea[]> {
  const rows = await prisma.alarmArea.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      sort_order: 'asc',
    },
  });

  return rows.map((area) => ({
    id: area.id,
    area_code: area.area_code,
    area_name: area.area_name,
    sort_order: area.sort_order,
    enabled: area.enabled,
  }));
}

function ensureManageableAlarmUser(userId: number) {
  const targetUser = findMockUserById(userId);
  if (!targetUser) {
    throw new Error('TARGET_USER_NOT_FOUND');
  }

  if (targetUser.role !== 'user') {
    throw new Error('TARGET_USER_NOT_MANAGEABLE');
  }

  return targetUser;
}

export async function resolveAlarmAccessScope(user: AuthenticatedUser): Promise<AlarmAccessScope> {
  if (user.role === 'admin') {
    const areas = (await loadEnabledAreaDefinitions()).map((area, index) => ({
      area_id: area.id,
      area_code: area.area_code,
      area_name: area.area_name,
      is_default: index === 0,
    }));

    return buildAlarmAccessScopeFromAreas(areas, 'all-enabled');
  }

  const rows = await loadAssignedAreaRows(user.id);
  return buildAlarmAccessScopeFromAreas(mapAssignmentRowsToAreas(rows), 'assigned');
}

export async function getCurrentUserAlarmAreaContext(
  user: AuthenticatedUser,
): Promise<UserAlarmAreaContext> {
  const scope = await resolveAlarmAccessScope(user);
  return buildUserAlarmAreaContext(user.id, scope);
}

export async function getManagedUserAlarmAreaContext(
  userId: number,
): Promise<ManagedUserAlarmAreaContext> {
  ensureManageableAlarmUser(userId);
  const rows = await loadAssignedAreaRows(userId);
  return buildUserAlarmAreaContext(
    userId,
    buildAlarmAccessScopeFromAreas(mapAssignmentRowsToAreas(rows), 'assigned'),
  );
}

export async function getAuthorizedAlarmAreaIds(user: AuthenticatedUser): Promise<number[]> {
  const scope = await resolveAlarmAccessScope(user);
  return scope.area_ids;
}

export async function listVisibleAlarmAreas(user: AuthenticatedUser): Promise<AlarmArea[]> {
  const scope = await resolveAlarmAccessScope(user);
  if (scope.area_ids.length === 0) {
    return [];
  }

  const rows = await prisma.alarmArea.findMany({
    where: {
      id: {
        in: scope.area_ids,
      },
      enabled: true,
    },
    orderBy: {
      sort_order: 'asc',
    },
  });

  return rows.map((area) => ({
    id: area.id,
    area_code: area.area_code,
    area_name: area.area_name,
    sort_order: area.sort_order,
    enabled: area.enabled,
  }));
}

export async function replaceUserAlarmAreas(
  userId: number,
  payload: UpdateUserAlarmAreasRequest,
): Promise<UpdateUserAlarmAreasResponse> {
  ensureManageableAlarmUser(userId);

  const uniqueAreaIds = [
    ...new Set(payload.area_ids.filter((areaId) => Number.isInteger(areaId) && areaId > 0)),
  ];

  if (uniqueAreaIds.length === 0) {
    throw new Error('AREA_IDS_REQUIRED');
  }

  if (!uniqueAreaIds.includes(payload.default_area_id)) {
    throw new Error('DEFAULT_AREA_INVALID');
  }

  const areas = await prisma.alarmArea.findMany({
    where: {
      id: { in: uniqueAreaIds },
      enabled: true,
    },
    select: {
      id: true,
    },
  });

  if (areas.length !== uniqueAreaIds.length) {
    throw new Error('AREA_NOT_FOUND');
  }

  await prisma.$transaction(async (tx) => {
    await tx.userArea.deleteMany({
      where: { user_id: userId },
    });

    await tx.userArea.createMany({
      data: uniqueAreaIds.map((areaId) => ({
        user_id: userId,
        area_id: areaId,
        is_default: areaId === payload.default_area_id,
      })),
    });
  });

  return {
    user_id: userId,
    default_area_id: payload.default_area_id,
    area_ids: uniqueAreaIds,
  };
}
