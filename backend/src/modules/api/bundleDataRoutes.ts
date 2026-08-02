import { Prisma } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import type {
  BundleDeleteParams,
  BundleDeleteResponse,
  BundleDetailParams,
  BundleDetailResponse,
  BundleDraftBootstrapParams,
  BundleDraftBootstrapResponse,
  BundleDuplicateCheckParams,
  BundleDuplicateCheckResponse,
  BundleQueryParams,
  BundleRecord,
  BundleRecordKey,
  BundleSavePayload,
  BundleSaveResponse,
  OrderData,
  TubeRecord,
} from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';

const bundleTimeSql = Prisma.sql`
  CASE
    WHEN NULLIF(produce_time, '') IS NOT NULL AND LENGTH(NULLIF(produce_time, '')) = 14 THEN
      TO_TIMESTAMP(produce_time, 'YYYYMMDDHH24MISS')
    WHEN NULLIF(produce_time, '') IS NOT NULL AND LENGTH(NULLIF(produce_time, '')) = 19 THEN
      TO_TIMESTAMP(produce_time, 'YYYY-MM-DD HH24:MI:SS')
    WHEN NULLIF(toc, '') IS NOT NULL AND LENGTH(NULLIF(toc, '')) = 19 THEN
      TO_TIMESTAMP(toc, 'YYYY-MM-DD HH24:MI:SS')
    ELSE NULL
  END
`;

const bundleRequiredFields: Array<[keyof BundleRecord, string]> = [
  ['order_no', '合同号'],
  ['item_no', '项目号'],
  ['bundle_no', '管捆号'],
  ['roll_no', '轧批号'],
  ['melt_no', '炉号'],
  ['lot_no', '试批号'],
  ['diameter', '外径'],
  ['wall_thickness', '壁厚'],
  ['length_from', '最短'],
  ['length_to', '最长'],
  ['tube', '根数'],
  ['last_flow_no', '最后流水号'],
  ['produce_time', '生产时间'],
  ['bundle_type', '管捆状态'],
  ['ban_ci', '班组'],
  ['product_job_point', '作业点代码'],
  ['direction_code', '去向代码'],
  ['theory_weight', '理论重量'],
  ['theory_total_length', '理论长度'],
  ['weight', '米制重量'],
  ['weight_eng', '英制重量'],
  ['total_length', '米制长度'],
  ['length_eng', '英制长度'],
  ['mat_text', '材质正文'],
  ['std_text', '标准正文'],
  ['sg_text', '钢级正文'],
  ['end_type_sign', '管端类型符号'],
  ['end_type', '管端型式'],
  ['thread_type_sign', '螺纹类型符号'],
  ['thread_type', '螺纹类型'],
];

function normalizeString(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : ' ';
}

function normalizeProduceTime(value: string | null | undefined): string | null {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  if (/^\d{14}$/.test(normalized)) {
    return normalized;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized.replace(/[-: ]/g, '');
  }

  return normalized;
}

function normalizeInteger(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }

  return Math.trunc(Number(value));
}

function normalizeNumeric(value: number | null | undefined, digits = 3): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function normalizeBundleRecord(record: BundleRecord): BundleRecord {
  return {
    order_no: record.order_no.trim(),
    item_no: record.item_no.trim(),
    bundle_no: record.bundle_no.trim(),
    roll_no: normalizeString(record.roll_no),
    melt_no: normalizeString(record.melt_no),
    lot_no: normalizeString(record.lot_no),
    prod_code: normalizeString(record.prod_code),
    prod_cname: normalizeString(record.prod_cname),
    mat_no: normalizeString(record.mat_no),
    mat_text: normalizeString(record.mat_text),
    std_sg_code: normalizeString(record.std_sg_code),
    std_text: normalizeString(record.std_text),
    sg_text: normalizeString(record.sg_text),
    diameter: normalizeNumeric(record.diameter, 2),
    wall_thickness: normalizeNumeric(record.wall_thickness, 2),
    weight: normalizeNumeric(record.weight),
    weight_eng: normalizeNumeric(record.weight_eng),
    total_length: normalizeNumeric(record.total_length),
    length_eng: normalizeNumeric(record.length_eng),
    length_from: normalizeNumeric(record.length_from),
    length_to: normalizeNumeric(record.length_to),
    tube: normalizeInteger(record.tube),
    bundle_type: normalizeString(record.bundle_type),
    produce_time: normalizeProduceTime(record.produce_time),
    ban_ci: normalizeString(record.ban_ci),
    product_job_point: normalizeString(record.product_job_point),
    direction_code: normalizeString(record.direction_code),
    theory_weight: normalizeInteger(record.theory_weight),
    theory_total_length: normalizeNumeric(record.theory_total_length),
    last_flow_no: normalizeInteger(record.last_flow_no),
    end_type_code: normalizeString(record.end_type_code),
    end_type_sign: normalizeString(record.end_type_sign),
    thread_type_code: normalizeString(record.thread_type_code),
    thread_type_sign: normalizeString(record.thread_type_sign),
    coupling_type_code: normalizeString(record.coupling_type_code),
    coupling_type_sign: normalizeString(record.coupling_type_sign),
    pono_id_coupling: normalizeString(record.pono_id_coupling),
    lot_no_thread: normalizeString(record.lot_no_thread),
    order_no_old: normalizeString(record.order_no_old),
    toc: normalizeString(record.toc),
    send_flag: normalizeString(record.send_flag) ?? '0',
    gross_weight: normalizeInteger(record.gross_weight),
    end_type: normalizeString(record.end_type),
    thread_type: normalizeString(record.thread_type),
    diameter_down_ctrl: normalizeNumeric(record.diameter_down_ctrl, 3),
    diameter_up_ctrl: normalizeNumeric(record.diameter_up_ctrl, 3),
    wal_thick_down_ctrl: normalizeNumeric(record.wal_thick_down_ctrl, 2),
    wal_thick_up_ctrl: normalizeNumeric(record.wal_thick_up_ctrl, 2),
    weight_per_meter: normalizeNumeric(record.weight_per_meter, 2),
    weight_ew: normalizeNumeric(record.weight_ew, 2),
    room_no: normalizeString(record.room_no),
  };
}

function normalizeTubeRecord(record: TubeRecord, bundleKey?: BundleRecordKey): TubeRecord {
  return {
    order_no: (bundleKey?.order_no ?? record.order_no).trim(),
    item_no: (bundleKey?.item_no ?? record.item_no).trim(),
    bundle_no: (bundleKey?.bundle_no ?? record.bundle_no).trim(),
    weight: normalizeNumeric(record.weight),
    length: normalizeNumeric(record.length),
    flow_no: normalizeInteger(record.flow_no) ?? 0,
    tube_no: normalizeInteger(record.tube_no),
  };
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function buildBusinessWindow(queryDate: string) {
  const end = new Date(`${queryDate}T19:45:00`);
  if (Number.isNaN(end.getTime())) {
    throw new Error('INVALID_QUERY_DATE');
  }

  const start = new Date(end);
  start.setDate(start.getDate() - 1);

  return {
    start: formatDateTime(start),
    end: formatDateTime(end),
  };
}

function createDraftBundleFromOrder(order: OrderData): BundleRecord {
  return {
    order_no: order.order_no,
    item_no: order.item_no,
    bundle_no: '',
    roll_no: order.roll_no,
    melt_no: '',
    lot_no: '',
    prod_code: order.prod_code,
    prod_cname: order.prod_cname,
    mat_no: order.mat_no,
    mat_text: order.mat_text,
    std_sg_code: order.std_sg_code,
    std_text: order.std_text,
    sg_text: order.sg_text,
    diameter: order.diameter,
    wall_thickness: order.wall_thickness,
    weight: null,
    weight_eng: null,
    total_length: null,
    length_eng: null,
    length_from: null,
    length_to: null,
    tube: null,
    bundle_type: '',
    produce_time: '',
    ban_ci: '',
    product_job_point: '',
    direction_code: '',
    theory_weight: null,
    theory_total_length: null,
    last_flow_no: null,
    end_type_code: order.end_type_code,
    end_type_sign: order.end_type_sign,
    thread_type_code: order.thread_type_code,
    thread_type_sign: order.thread_type_sign,
    coupling_type_code: order.coupling_type_code,
    coupling_type_sign: order.coupling_type_sign,
    pono_id_coupling: '',
    lot_no_thread: '',
    order_no_old: order.order_no_old,
    toc: '',
    send_flag: '0',
    gross_weight: null,
    end_type: order.end_type,
    thread_type: order.thread_type,
    diameter_down_ctrl: order.diameter_down_ctrl,
    diameter_up_ctrl: order.diameter_up_ctrl,
    wal_thick_down_ctrl: order.wal_thick_down_ctrl,
    wal_thick_up_ctrl: order.wal_thick_up_ctrl,
    weight_per_meter: order.weight_per_meter,
    weight_ew: order.weight_ew,
    room_no: '',
  };
}

function validateBundlePayload(bundle: BundleRecord, tubes: TubeRecord[]) {
  for (const [field, label] of bundleRequiredFields) {
    const value = bundle[field];
    if (typeof value === 'string' && value.trim().length === 0) {
      return `${label}不能为空`;
    }

    if (value == null) {
      return `${label}不能为空`;
    }
  }

  if (tubes.length === 0) {
    return '至少需要一条管子记录';
  }

  for (const tube of tubes) {
    if (
      tube.flow_no <= 0 ||
      (tube.tube_no ?? 0) <= 0 ||
      (tube.weight ?? 0) <= 0 ||
      (tube.length ?? 0) <= 0
    ) {
      return '管子流水号、管号、重量、长度必须大于0';
    }
  }

  return null;
}

async function findDuplicateBundle(
  tx: typeof prisma,
  key: BundleRecordKey,
  originalKey?: BundleRecordKey | null,
) {
  if (originalKey) {
    const rows = await tx.$queryRaw<BundleRecordKey[]>(Prisma.sql`
      SELECT order_no, item_no, bundle_no
      FROM api_bundle_data_t
      WHERE order_no = ${key.order_no}
        AND item_no = ${key.item_no}
        AND bundle_no = ${key.bundle_no}
        AND NOT (
          order_no = ${originalKey.order_no}
          AND item_no = ${originalKey.item_no}
          AND bundle_no = ${originalKey.bundle_no}
        )
      LIMIT 1
    `);

    return rows.length > 0;
  }

  const rows = await tx.$queryRaw<BundleRecordKey[]>(Prisma.sql`
    SELECT order_no, item_no, bundle_no
    FROM api_bundle_data_t
    WHERE order_no = ${key.order_no}
      AND item_no = ${key.item_no}
      AND bundle_no = ${key.bundle_no}
    LIMIT 1
  `);

  return rows.length > 0;
}

export async function registerBundleDataRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: BundleQueryParams; Reply: BundleRecord[] }>(
    '/api/bundles',
    async (request, reply) => {
      const bundleNo = request.query.bundle_no?.trim();
      const queryDate = request.query.query_date?.trim();

      if (!bundleNo && !queryDate) {
        return reply.code(400).send([{ message: '请提供查询日期或管捆号' }] as never);
      }

      try {
        let rows: BundleRecord[];

        if (bundleNo) {
          rows = await prisma.$queryRaw<BundleRecord[]>(Prisma.sql`
          SELECT *
          FROM api_bundle_data_t
          WHERE bundle_no = ${bundleNo}
          ORDER BY produce_time
        `);
        } else {
          const { start, end } = buildBusinessWindow(queryDate!);

          rows = await prisma.$queryRaw<BundleRecord[]>(Prisma.sql`
          SELECT *
          FROM api_bundle_data_t
          WHERE ${bundleTimeSql} >= TO_TIMESTAMP(${start}, 'YYYY-MM-DD HH24:MI:SS')
            AND ${bundleTimeSql} < TO_TIMESTAMP(${end}, 'YYYY-MM-DD HH24:MI:SS')
          ORDER BY produce_time
        `);
        }

        return rows.map(normalizeBundleRecord);
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof Error && error.message === 'INVALID_QUERY_DATE') {
          return reply.code(400).send([{ message: '查询日期格式无效' }] as never);
        }
        return reply.code(500).send([{ message: '查询管捆列表失败' }] as never);
      }
    },
  );

  fastify.get<{ Querystring: BundleDetailParams; Reply: BundleDetailResponse }>(
    '/api/bundles/detail',
    async (request, reply) => {
      const { order_no, item_no, bundle_no } = request.query;
      if (!order_no || !item_no || !bundle_no) {
        return reply.code(400).send({ message: '请提供合同号、项目号和管捆号' } as never);
      }

      try {
        const bundles = await prisma.$queryRaw<BundleRecord[]>(Prisma.sql`
        SELECT *
        FROM api_bundle_data_t
        WHERE order_no = ${order_no}
          AND item_no = ${item_no}
          AND bundle_no = ${bundle_no}
        LIMIT 1
      `);

        if (bundles.length === 0) {
          return reply.code(404).send({ message: '未查询到管捆明细' } as never);
        }

        const tubes = await prisma.$queryRaw<TubeRecord[]>(Prisma.sql`
        SELECT *
        FROM api_tube_data_t
        WHERE order_no = ${order_no}
          AND item_no = ${item_no}
          AND bundle_no = ${bundle_no}
        ORDER BY flow_no
      `);

        return {
          bundle: normalizeBundleRecord(bundles[0]),
          tubes: tubes.map((tube) => normalizeTubeRecord(tube)),
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ message: '查询管捆明细失败' } as never);
      }
    },
  );

  fastify.delete<{ Querystring: BundleDeleteParams; Reply: BundleDeleteResponse }>(
    '/api/bundles',
    async (request, reply) => {
      const { order_no, item_no, bundle_no } = request.query;
      if (!order_no || !item_no || !bundle_no) {
        return reply.code(400).send({ success: false, message: '请提供合同号、项目号和管捆号' });
      }

      try {
        const result = await prisma.$transaction(async (tx) => {
          const deletedTubes = await tx.$executeRaw(Prisma.sql`
            DELETE FROM api_tube_data_t
            WHERE order_no = ${order_no}
              AND item_no = ${item_no}
              AND bundle_no = ${bundle_no}
          `);

          const deletedBundles = await tx.$executeRaw(Prisma.sql`
            DELETE FROM api_bundle_data_t
            WHERE order_no = ${order_no}
              AND item_no = ${item_no}
              AND bundle_no = ${bundle_no}
          `);

          return {
            deletedBundles,
            deletedTubes,
          };
        });

        if (result.deletedBundles === 0 && result.deletedTubes === 0) {
          return reply.code(404).send({ success: false, message: '未找到要删除的管捆记录' });
        }

        return {
          success: true,
          message: `管捆删除成功，已删除 ${result.deletedBundles} 条管捆记录和 ${result.deletedTubes} 条管子记录`,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ success: false, message: '删除管捆失败' });
      }
    },
  );

  fastify.get<{ Querystring: BundleDraftBootstrapParams; Reply: BundleDraftBootstrapResponse }>(
    '/api/bundles/bootstrap',
    async (request, reply) => {
      const { order_no, item_no } = request.query;
      if (!order_no || !item_no) {
        return reply.code(400).send({ message: '请提供合同号和项目号' } as never);
      }

      try {
        const rows = await prisma.$queryRaw<OrderData[]>(Prisma.sql`
          SELECT *
          FROM api_order_data_t
          WHERE order_no = ${order_no}
            AND item_no = ${item_no}
          LIMIT 1
        `);

        if (rows.length === 0) {
          return reply.code(404).send({ message: '未查询到合同数据' } as never);
        }

        const sourceOrder = rows[0];
        return {
          bundle: normalizeBundleRecord(createDraftBundleFromOrder(sourceOrder)),
          source_order: sourceOrder,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ message: '创建管捆草稿失败' } as never);
      }
    },
  );

  fastify.get<{ Querystring: BundleDuplicateCheckParams; Reply: BundleDuplicateCheckResponse }>(
    '/api/bundles/duplicate-check',
    async (request, reply) => {
      const { order_no, item_no, bundle_no, original_bundle_no } = request.query;
      if (!order_no || !item_no || !bundle_no) {
        return reply.code(400).send({ duplicate: false, message: '请提供重号校验参数' } as never);
      }

      try {
        const duplicate = await findDuplicateBundle(
          prisma,
          { order_no, item_no, bundle_no },
          original_bundle_no ? { order_no, item_no, bundle_no: original_bundle_no } : null,
        );

        return {
          duplicate,
          message: duplicate ? '当前合同和项目下已存在相同管捆号' : '管捆号可用',
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ duplicate: false, message: '重号校验失败' } as never);
      }
    },
  );

  fastify.post<{ Body: BundleSavePayload; Reply: BundleSaveResponse }>(
    '/api/bundles/save',
    async (request, reply) => {
      const payload = request.body;
      if (!payload?.bundle || !Array.isArray(payload.tubes)) {
        return reply.code(400).send({ success: false, message: '保存载荷无效' });
      }

      const normalizedBundle = normalizeBundleRecord({
        ...payload.bundle,
        toc: formatDateTime(new Date()),
      });
      const targetKey: BundleRecordKey = {
        order_no: normalizedBundle.order_no,
        item_no: normalizedBundle.item_no,
        bundle_no: normalizedBundle.bundle_no,
      };
      const originalKey = payload.original_key
        ? {
            order_no: payload.original_key.order_no.trim(),
            item_no: payload.original_key.item_no.trim(),
            bundle_no: payload.original_key.bundle_no.trim(),
          }
        : null;
      const normalizedTubes = payload.tubes.map((tube) => normalizeTubeRecord(tube, targetKey));
      const validationError = validateBundlePayload(normalizedBundle, normalizedTubes);

      if (validationError) {
        return reply.code(400).send({ success: false, message: validationError });
      }

      try {
        await prisma.$transaction(async (tx) => {
          const duplicate = await findDuplicateBundle(tx as typeof prisma, targetKey, originalKey);
          if (duplicate) {
            throw new Error('DUPLICATE_BUNDLE');
          }

          const deleteKey = originalKey ?? targetKey;

          await tx.$executeRaw(Prisma.sql`
          DELETE FROM api_tube_data_t
          WHERE order_no = ${deleteKey.order_no}
            AND item_no = ${deleteKey.item_no}
            AND bundle_no = ${deleteKey.bundle_no}
        `);

          await tx.$executeRaw(Prisma.sql`
          DELETE FROM api_bundle_data_t
          WHERE order_no = ${deleteKey.order_no}
            AND item_no = ${deleteKey.item_no}
            AND bundle_no = ${deleteKey.bundle_no}
        `);

          await tx.$executeRaw(Prisma.sql`
          INSERT INTO api_bundle_data_t (
            order_no, item_no, bundle_no, roll_no, melt_no, lot_no,
            prod_code, prod_cname, mat_no, mat_text, std_sg_code, std_text, sg_text,
            diameter, wall_thickness, weight, weight_eng, total_length, length_eng,
            length_from, length_to, tube, bundle_type, produce_time, ban_ci,
            product_job_point, direction_code, theory_weight, theory_total_length,
            last_flow_no, end_type_code, end_type_sign, thread_type_code, thread_type_sign,
            coupling_type_code, coupling_type_sign, pono_id_coupling, lot_no_thread,
            order_no_old, toc, send_flag, gross_weight, end_type, thread_type,
            diameter_down_ctrl, diameter_up_ctrl, wal_thick_down_ctrl, wal_thick_up_ctrl,
            weight_per_meter, weight_ew, room_no
          ) VALUES (
            ${normalizedBundle.order_no}, ${normalizedBundle.item_no}, ${normalizedBundle.bundle_no},
            ${normalizedBundle.roll_no}, ${normalizedBundle.melt_no}, ${normalizedBundle.lot_no},
            ${normalizedBundle.prod_code}, ${normalizedBundle.prod_cname}, ${normalizedBundle.mat_no},
            ${normalizedBundle.mat_text}, ${normalizedBundle.std_sg_code}, ${normalizedBundle.std_text}, ${normalizedBundle.sg_text},
            ${normalizedBundle.diameter}::numeric, ${normalizedBundle.wall_thickness}::numeric,
            ${normalizedBundle.weight}::numeric, ${normalizedBundle.weight_eng}::numeric,
            ${normalizedBundle.total_length}::numeric, ${normalizedBundle.length_eng}::numeric,
            ${normalizedBundle.length_from}::numeric, ${normalizedBundle.length_to}::numeric,
            ${normalizedBundle.tube}::int, ${normalizedBundle.bundle_type}, ${normalizedBundle.produce_time}, ${normalizedBundle.ban_ci},
            ${normalizedBundle.product_job_point}, ${normalizedBundle.direction_code},
            ${normalizedBundle.theory_weight}::int, ${normalizedBundle.theory_total_length}::numeric,
            ${normalizedBundle.last_flow_no}::int, ${normalizedBundle.end_type_code}, ${normalizedBundle.end_type_sign},
            ${normalizedBundle.thread_type_code}, ${normalizedBundle.thread_type_sign},
            ${normalizedBundle.coupling_type_code}, ${normalizedBundle.coupling_type_sign},
            ${normalizedBundle.pono_id_coupling}, ${normalizedBundle.lot_no_thread}, ${normalizedBundle.order_no_old},
            ${normalizedBundle.toc}, ${normalizedBundle.send_flag}, ${normalizedBundle.gross_weight}::int,
            ${normalizedBundle.end_type}, ${normalizedBundle.thread_type}, ${normalizedBundle.diameter_down_ctrl}::numeric,
            ${normalizedBundle.diameter_up_ctrl}::numeric, ${normalizedBundle.wal_thick_down_ctrl}::numeric,
            ${normalizedBundle.wal_thick_up_ctrl}::numeric, ${normalizedBundle.weight_per_meter}::numeric,
            ${normalizedBundle.weight_ew}::numeric, ${normalizedBundle.room_no}
          )
        `);

          for (const tube of normalizedTubes) {
            await tx.$executeRaw(Prisma.sql`
            INSERT INTO api_tube_data_t (
              order_no, item_no, bundle_no, weight, length, flow_no, tube_no
            ) VALUES (
              ${tube.order_no}, ${tube.item_no}, ${tube.bundle_no},
              ${tube.weight}::numeric, ${tube.length}::numeric, ${tube.flow_no}::int, ${tube.tube_no}::int
            )
          `);
          }
        });

        return { success: true, message: '管捆保存成功' };
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof Error && error.message === 'DUPLICATE_BUNDLE') {
          return reply
            .code(409)
            .send({ success: false, message: '当前合同和项目下已存在相同管捆号' });
        }

        return reply.code(500).send({ success: false, message: '管捆保存失败，事务已回滚' });
      }
    },
  );
}
