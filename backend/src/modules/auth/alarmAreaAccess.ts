import type {
  AlarmArea,
  UpdateUserAlarmAreasRequest,
  UpdateUserAlarmAreasResponse,
  UserAlarmAreaContext,
} from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';

function buildAlarmAreaContext(
  userId: number,
  rows: Array<{
    area_id: number;
    is_default: boolean;
    area: AlarmArea;
  }>,
): UserAlarmAreaContext {
  const areas = rows
    .filter((row) => row.area.enabled)
    .sort((left, right) => left.area.sort_order - right.area.sort_order)
    .map((row) => ({
      area_id: row.area_id,
      area_code: row.area.area_code,
      area_name: row.area.area_name,
      is_default: row.is_default,
    }));

  const defaultArea = areas.find((area) => area.is_default) ?? areas[0];

  return {
    user_id: userId,
    default_area_id: defaultArea?.area_id ?? 0,
    areas,
  };
}

export async function getUserAlarmAreaContext(userId: number): Promise<UserAlarmAreaContext> {
  const rows = await prisma.userArea.findMany({
    where: { user_id: userId },
    include: {
      area: true,
    },
  });

  return buildAlarmAreaContext(userId, rows);
}

export async function getAuthorizedAlarmAreaIds(userId: number): Promise<number[]> {
  const context = await getUserAlarmAreaContext(userId);
  return context.areas.map((area) => area.area_id);
}

export async function listVisibleAlarmAreas(userId: number): Promise<AlarmArea[]> {
  const rows = await prisma.userArea.findMany({
    where: {
      user_id: userId,
      area: {
        enabled: true,
      },
    },
    include: {
      area: true,
    },
  });

  return rows
    .map((row) => row.area)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((area) => ({
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
