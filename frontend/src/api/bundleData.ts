import { request } from './client';
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
  BundleSavePayload,
  BundleSaveResponse,
} from '@gt4_web/shared';

export function getBundles(params: BundleQueryParams) {
  return request.get<BundleRecord[]>('/bundles', { params });
}

export function getBundleDetail(params: BundleDetailParams) {
  return request.get<BundleDetailResponse>('/bundles/detail', { params });
}

export function deleteBundle(params: BundleDeleteParams) {
  return request.delete<BundleDeleteResponse>('/bundles', { params });
}

export function getBundleDraftBootstrap(params: BundleDraftBootstrapParams) {
  return request.get<BundleDraftBootstrapResponse>('/bundles/bootstrap', { params });
}

export function checkBundleDuplicate(params: BundleDuplicateCheckParams) {
  return request.get<BundleDuplicateCheckResponse>('/bundles/duplicate-check', { params });
}

export function saveBundleDraft(payload: BundleSavePayload) {
  return request.post<BundleSaveResponse>('/bundles/save', payload);
}
