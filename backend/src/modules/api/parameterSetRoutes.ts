import { FastifyInstance } from 'fastify';
import type { ParameterSet } from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';

export async function registerParameterSetRoutes(fastify: FastifyInstance) {
  // 查询生产参数（0或1条记录）
  fastify.get('/api/parameter-set', async (_request, reply) => {
    try {
      const rows = await prisma.$queryRaw<ParameterSet[]>`SELECT * FROM parameter_set LIMIT 1`;
      if (rows.length === 0) {
        return reply.code(404).send({ message: '没有查询到参数记录' });
      }
      return rows[0];
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '查询参数失败' });
    }
  });

  // 保存生产参数（先删除再插入）
  fastify.post('/api/parameter-set', async (request, reply) => {
    const data = request.body as ParameterSet;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`DELETE FROM parameter_set`;
        await tx.$executeRaw`
          INSERT INTO parameter_set (
            order_no, item_no, diameter, thickness, direction_code,
            bundle_type, bundle_number, produce_job_point, order_weight,
            lot_no, roll_no, melt_no, melt_no_coupling, lot_no_coupling,
            flow_no, feed_number, length_coupling, weight_coupling, weight_packging,
            length_enable, weight_enable, circle_enable, carve_enable, spray_enable,
            waste_length_enable, waste_weight_enable,
            gun1, gun2, gun3, gun4, gun5, gun_clear,
            circle_time, spray_length_type, spray_weight_type,
            spray_length_precision, spray_weight_precision,
            weight_limit_max, weight_limit_min,
            bundle_first_type, bundle_flow_no, spray_year_count, label_count,
            length_limit_max, length_limit_min,
            label_length_type, label_weight_type, label_type,
            tube_no, qrcode_spray_enable, weight_per_meter, weight_ew
          ) VALUES (
            ${data.order_no}, ${data.item_no},
            ${data.diameter}::numeric, ${data.thickness}::numeric,
            ${data.direction_code}, ${data.bundle_type},
            ${data.bundle_number}::int, ${data.produce_job_point},
            ${data.order_weight}::int, ${data.lot_no}, ${data.roll_no},
            ${data.melt_no}, ${data.melt_no_coupling}, ${data.lot_no_coupling},
            ${data.flow_no}::int, ${data.feed_number}::int,
            ${data.length_coupling}::real, ${data.weight_coupling}::real,
            ${data.weight_packging}::real,
            ${data.length_enable}::int, ${data.weight_enable}::int,
            ${data.circle_enable}::int, ${data.carve_enable}::int,
            ${data.spray_enable}::int,
            ${data.waste_length_enable}::int, ${data.waste_weight_enable}::int,
            ${data.gun1}::int, ${data.gun2}::int, ${data.gun3}::int,
            ${data.gun4}::int, ${data.gun5}::int, ${data.gun_clear}::int,
            ${data.circle_time}::int, ${data.spray_length_type}::int,
            ${data.spray_weight_type}::int,
            ${data.spray_length_precision}::int, ${data.spray_weight_precision}::int,
            ${data.weight_limit_max}::real, ${data.weight_limit_min}::real,
            ${data.bundle_first_type}::int, ${data.bundle_flow_no}::int,
            ${data.spray_year_count}::int, ${data.label_count}::int,
            ${data.length_limit_max}::real, ${data.length_limit_min}::real,
            ${data.label_length_type}::int, ${data.label_weight_type}::int,
            ${data.label_type}::int,
            ${data.tube_no}::int, ${data.qrcode_spray_enable}::int,
            ${data.weight_per_meter}::real, ${data.weight_ew}::real
          )
        `;
      });
      return { message: '参数保存成功' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '参数保存失败' });
    }
  });
}
