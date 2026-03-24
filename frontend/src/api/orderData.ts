import { request } from './client';
import type { OrderData } from '@gt4_web/shared';

// 查询日期范围内的合同号列表
export function getOrderNos(dateFrom: string, dateTo: string) {
  return request.get<string[]>('/order-data/order-nos', {
    params: { dateFrom, dateTo },
  });
}

// 根据合同号和日期范围查询项目号列表
export function getItemNos(orderNo: string, dateFrom: string, dateTo: string) {
  return request.get<string[]>('/order-data/item-nos', {
    params: { orderNo, dateFrom, dateTo },
  });
}

// 根据合同号、项目号查询合同明细
export function getOrderData(orderNo: string, itemNo: string) {
  return request.get<OrderData>('/order-data', {
    params: { orderNo, itemNo },
  });
}

// 保存（更新）合同数据
export function updateOrderData(data: OrderData) {
  return request.put<{ message: string }>('/order-data', data);
}

// 新增合同数据
export function createOrderData(data: OrderData) {
  return request.post<{ message: string }>('/order-data', data);
}
