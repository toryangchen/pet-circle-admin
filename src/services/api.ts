import axios from 'axios';
import type {
  AdminUserRole,
  AdminSession,
  PagedResult,
  PostStatus,
  ReviewDetail,
  ReviewListItem,
  UserDetail,
  UserListItem,
} from './types';
import { getStoredAdminSession, clearAdminSession, saveAdminSession } from './session';

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api',
  timeout: 4000,
});

client.interceptors.request.use((config) => {
  const session = getStoredAdminSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export function handleApiError(error: unknown) {
  if ((error as { response?: { status?: number } })?.response?.status === 401) {
    clearAdminSession();
  }

  return Promise.reject(error);
}

client.interceptors.response.use((response) => response, handleApiError);

export function toApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status) {
      return new Error(`请求失败 (${status})`);
    }

    return new Error('网络连接失败，请检查服务是否可用');
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('请求失败');
}

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  try {
    const response = await promise;
    if (response.data?.code !== 0) {
      throw new Error(response.data?.message ?? '请求失败');
    }

    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function adminLogin(username: string, password: string): Promise<AdminSession> {
  const session = await unwrap<{ token: string; user: { id: string; username: string; role: AdminUserRole } }>(
    client.post('/admin/auth/login', { username, password }),
  );

  const nextSession: AdminSession = {
    token: session.token,
    user: session.user,
  };
  saveAdminSession(nextSession);
  return nextSession;
}

export async function fetchPendingReviews(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  serviceCategory?: string;
}) {
  return unwrap<PagedResult<ReviewListItem>>(
    client.post('/admin/reviews/pending', {}, {
      params,
    }),
  );
}

export async function fetchOnlinePosts(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  serviceCategory?: string;
}) {
  return unwrap<PagedResult<ReviewListItem>>(
    client.post('/admin/posts/online', {}, {
      params,
    }),
  );
}

export async function fetchReviewDetail(postId: string) {
  return unwrap<ReviewDetail>(client.post(`/admin/reviews/${postId}`, {}));
}

export async function approveReview(postId: string) {
  return unwrap<{ id: string; status: PostStatus }>(client.post(`/admin/reviews/${postId}/approve`, {}));
}

export async function rejectReview(postId: string, reason: string) {
  return unwrap<{ id: string; status: PostStatus }>(client.post(`/admin/reviews/${postId}/reject`, { reason }));
}

export async function offlineReview(postId: string, reason: string) {
  return unwrap<{ id: string; status: PostStatus }>(client.post(`/admin/reviews/${postId}/offline`, { reason }));
}

export async function fetchUsers(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return unwrap<PagedResult<UserListItem>>(
    client.post('/admin/users', {}, {
      params,
    }),
  );
}

export async function fetchUserDetail(userId: string) {
  return unwrap<UserDetail>(client.post(`/admin/users/${userId}`, {}));
}
