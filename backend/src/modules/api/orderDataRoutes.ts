import { FastifyInstance } from 'fastify';
import type { OrderData } from '@gt4_web/shared';
import prisma from '../database/prismaClient.js';

export async function registerOrderDataRoutes(fastify: FastifyInstance) {
  // 查询日期范围内的合同号列表
  fastify.get('/api/order-data/order-nos', async (request, reply) => {
    const { dateFrom, dateTo } = request.query as { dateFrom: string; dateTo: string };
    if (!dateFrom || !dateTo) {
      return reply.code(400).send({ message: '请提供查询日期范围' });
    }
    try {
      const rows = await prisma.$queryRaw<{ order_no: string }[]>`
        SELECT DISTINCT order_no FROM api_order_data_t
        WHERE toc >= ${dateFrom} AND toc < ${dateTo + ' 23:59:59'}
        ORDER BY order_no
      `;
      return rows.map((r) => r.order_no);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '查询合同号失败' });
    }
  });

  // 根据合同号和日期范围查询项目号列表
  fastify.get('/api/order-data/item-nos', async (request, reply) => {
    const { orderNo, dateFrom, dateTo } = request.query as {
      orderNo: string;
      dateFrom: string;
      dateTo: string;
    };
    if (!orderNo) {
      return reply.code(400).send({ message: '请提供合同号' });
    }
    try {
      let rows: { item_no: string }[];
      if (dateFrom && dateTo) {
        rows = await prisma.$queryRaw<{ item_no: string }[]>`
          SELECT DISTINCT item_no FROM api_order_data_t
          WHERE order_no = ${orderNo}
            AND toc >= ${dateFrom} AND toc < ${dateTo + ' 23:59:59'}
          ORDER BY item_no
        `;
      } else {
        rows = await prisma.$queryRaw<{ item_no: string }[]>`
          SELECT DISTINCT item_no FROM api_order_data_t
          WHERE order_no = ${orderNo}
          ORDER BY item_no
        `;
      }
      return rows.map((r) => r.item_no);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '查询项目号失败' });
    }
  });

  // 根据合同号、项目号查询合同明细
  fastify.get('/api/order-data', async (request, reply) => {
    const { orderNo, itemNo } = request.query as { orderNo: string; itemNo: string };
    if (!orderNo || !itemNo) {
      return reply.code(400).send({ message: '请提供合同号和项目号' });
    }
    try {
      const rows = await prisma.$queryRaw<OrderData[]>`
        SELECT * FROM api_order_data_t
        WHERE order_no = ${orderNo} AND item_no = ${itemNo}
        LIMIT 1
      `;
      if (rows.length === 0) {
        return reply.code(404).send({ message: '未查询到合同数据' });
      }
      return rows[0];
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '查询合同数据失败' });
    }
  });

  // 新增合同数据
  fastify.post('/api/order-data', async (request, reply) => {
    const data = request.body as OrderData;
    if (!data.order_no || !data.item_no) {
      return reply.code(400).send({ message: '合同号和项目号不能为空' });
    }
    try {
      await prisma.$executeRaw`
        INSERT INTO api_order_data_t (
          order_no, item_no, roll_no, diameter, wall_thickness,
          prod_code, prod_cname, heat_treat_code, heat_treat_text,
          std_sg_code, std_text, sg_text, mat_no, mat_text,
          thread_type_code, thread_type_sign, end_type_code, end_type_sign,
          coupling_type_code, coupling_type_sign,
          thread_face_treat_mode_code, thread_face_treat_mode,
          length_from, length_to, order_unit_code, order_unit,
          order_qty, order_tube, order_weight, fixed_order_weight, unfixed_order_weight,
          delivery_tolerance_code, delivery_tolerance_unit,
          delivery_tolerance_from, delivery_tolerance_to,
          short_rate, short_from, short_to,
          single_bundle_weight_max, single_bundle_tube_max,
          oil_code, oil_type, stamp_req, stencil_req,
          lable_req_1, lable_req_2, lable_req_3, lable_req_4,
          lable_req_5, lable_req_6, lable_req_7, lable_req_8,
          qual_special_req, produce_special_req,
          std_pressure_mpa, std_pressure_psi, stabilivolt_time_min,
          anneal_flag, weight_per_meter, weight_ew, theory_weight_eng,
          order_no_old, color_circle, color_circle_pos
        ) VALUES (
          ${data.order_no}, ${data.item_no}, ${data.roll_no},
          ${data.diameter}::numeric, ${data.wall_thickness}::numeric,
          ${data.prod_code}, ${data.prod_cname},
          ${data.heat_treat_code}, ${data.heat_treat_text},
          ${data.std_sg_code}, ${data.std_text}, ${data.sg_text},
          ${data.mat_no}, ${data.mat_text},
          ${data.thread_type_code}, ${data.thread_type_sign},
          ${data.end_type_code}, ${data.end_type_sign},
          ${data.coupling_type_code}, ${data.coupling_type_sign},
          ${data.thread_face_treat_mode_code}, ${data.thread_face_treat_mode},
          ${data.length_from}::numeric, ${data.length_to}::numeric,
          ${data.order_unit_code}, ${data.order_unit},
          ${data.order_qty}::numeric, ${data.order_tube}::int,
          ${data.order_weight}::numeric, ${data.fixed_order_weight}::numeric,
          ${data.unfixed_order_weight}::numeric,
          ${data.delivery_tolerance_code}, ${data.delivery_tolerance_unit},
          ${data.delivery_tolerance_from}::int, ${data.delivery_tolerance_to}::int,
          ${data.short_rate}::int, ${data.short_from}::numeric, ${data.short_to}::numeric,
          ${data.single_bundle_weight_max}::int, ${data.single_bundle_tube_max}::int,
          ${data.oil_code}, ${data.oil_type},
          ${data.stamp_req}, ${data.stencil_req},
          ${data.lable_req_1}, ${data.lable_req_2},
          ${data.lable_req_3}, ${data.lable_req_4},
          ${data.lable_req_5}, ${data.lable_req_6},
          ${data.lable_req_7}, ${data.lable_req_8},
          ${data.qual_special_req}, ${data.produce_special_req},
          ${data.std_pressure_mpa}::numeric, ${data.std_pressure_psi}::numeric,
          ${data.stabilivolt_time_min}::int,
          ${data.anneal_flag}, ${data.weight_per_meter}::numeric,
          ${data.weight_ew}::numeric, ${data.theory_weight_eng}::numeric,
          ${data.order_no_old}, ${data.color_circle}, ${data.color_circle_pos}
        )
      `;
      return { message: '合同数据新增成功' };
    } catch (err: any) {
      fastify.log.error(err);
      if (err.code === '23505') {
        return reply.code(409).send({ message: '该合同号和项目号已存在' });
      }
      return reply.code(500).send({ message: '新增合同数据失败' });
    }
  });

  // 更新合同数据
  fastify.put('/api/order-data', async (request, reply) => {
    const data = request.body as OrderData;
    if (!data.order_no || !data.item_no) {
      return reply.code(400).send({ message: '合同号和项目号不能为空' });
    }
    try {
      const affected = await prisma.$executeRaw`
        UPDATE api_order_data_t SET
          roll_no = ${data.roll_no},
          diameter = ${data.diameter}::numeric,
          wall_thickness = ${data.wall_thickness}::numeric,
          prod_code = ${data.prod_code},
          prod_cname = ${data.prod_cname},
          heat_treat_code = ${data.heat_treat_code},
          heat_treat_text = ${data.heat_treat_text},
          std_sg_code = ${data.std_sg_code},
          std_text = ${data.std_text},
          sg_text = ${data.sg_text},
          mat_no = ${data.mat_no},
          mat_text = ${data.mat_text},
          thread_type_code = ${data.thread_type_code},
          thread_type_sign = ${data.thread_type_sign},
          end_type_code = ${data.end_type_code},
          end_type_sign = ${data.end_type_sign},
          coupling_type_code = ${data.coupling_type_code},
          coupling_type_sign = ${data.coupling_type_sign},
          thread_face_treat_mode_code = ${data.thread_face_treat_mode_code},
          thread_face_treat_mode = ${data.thread_face_treat_mode},
          length_from = ${data.length_from}::numeric,
          length_to = ${data.length_to}::numeric,
          order_unit_code = ${data.order_unit_code},
          order_unit = ${data.order_unit},
          order_qty = ${data.order_qty}::numeric,
          order_tube = ${data.order_tube}::int,
          order_weight = ${data.order_weight}::numeric,
          fixed_order_weight = ${data.fixed_order_weight}::numeric,
          unfixed_order_weight = ${data.unfixed_order_weight}::numeric,
          delivery_tolerance_code = ${data.delivery_tolerance_code},
          delivery_tolerance_unit = ${data.delivery_tolerance_unit},
          delivery_tolerance_from = ${data.delivery_tolerance_from}::int,
          delivery_tolerance_to = ${data.delivery_tolerance_to}::int,
          short_rate = ${data.short_rate}::int,
          short_from = ${data.short_from}::numeric,
          short_to = ${data.short_to}::numeric,
          single_bundle_weight_max = ${data.single_bundle_weight_max}::int,
          single_bundle_tube_max = ${data.single_bundle_tube_max}::int,
          oil_code = ${data.oil_code},
          oil_type = ${data.oil_type},
          stamp_req = ${data.stamp_req},
          stencil_req = ${data.stencil_req},
          lable_req_1 = ${data.lable_req_1},
          lable_req_2 = ${data.lable_req_2},
          lable_req_3 = ${data.lable_req_3},
          lable_req_4 = ${data.lable_req_4},
          lable_req_5 = ${data.lable_req_5},
          lable_req_6 = ${data.lable_req_6},
          lable_req_7 = ${data.lable_req_7},
          lable_req_8 = ${data.lable_req_8},
          qual_special_req = ${data.qual_special_req},
          produce_special_req = ${data.produce_special_req},
          std_pressure_mpa = ${data.std_pressure_mpa}::numeric,
          std_pressure_psi = ${data.std_pressure_psi}::numeric,
          stabilivolt_time_min = ${data.stabilivolt_time_min}::int,
          anneal_flag = ${data.anneal_flag},
          weight_per_meter = ${data.weight_per_meter}::numeric,
          weight_ew = ${data.weight_ew}::numeric,
          theory_weight_eng = ${data.theory_weight_eng}::numeric,
          order_no_old = ${data.order_no_old},
          color_circle = ${data.color_circle},
          color_circle_pos = ${data.color_circle_pos}
        WHERE order_no = ${data.order_no} AND item_no = ${data.item_no}
      `;
      if (affected === 0) {
        return reply.code(404).send({ message: '未找到要更新的合同记录' });
      }
      return { message: '合同数据保存成功' };
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: '保存合同数据失败' });
    }
  });
}
