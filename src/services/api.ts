import axios from 'axios';
import type {
  AdminSession,
  PagedResult,
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
  baseURL: 'http://127.0.0.1:3000/api',
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

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await promise;
  if (response.data.code !== 0) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function adminLogin(username: string, password: string): Promise<AdminSession> {
  const session = await unwrap<{ token: string; user: AdminSession['user'] }>(
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
    client.get('/admin/reviews/pending', {
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
    client.get('/admin/posts/online', {
      params,
    }),
  );
}

export async function fetchReviewDetail(postId: string) {
  return unwrap<ReviewDetail>(client.get(`/admin/reviews/${postId}`));
}

export async function approveReview(postId: string) {
  return unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/approve`, {}));
}

export async function rejectReview(postId: string, reason: string) {
  return unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/reject`, { reason }));
}

export async function offlineReview(postId: string, reason: string) {
  return unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/offline`, { reason }));
}

export async function fetchUsers(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return unwrap<PagedResult<UserListItem>>(
    client.get('/admin/users', {
      params,
    }),
  );
}

export async function fetchUserDetail(userId: string) {
  return unwrap<UserDetail>(client.get(`/admin/users/${userId}`));
}
