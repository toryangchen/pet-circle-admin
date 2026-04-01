import axios from 'axios';
import type {
  AdminSession,
  PagedResult,
  ReviewDetail,
  ReviewListItem,
  UserDetail,
  UserListItem,
} from './types';
import {
  mockAdminSession,
  mockOnlinePosts,
  mockPendingReviews,
  mockReviewDetail,
  mockUserDetail,
  mockUsers,
} from './mock';
import { getStoredAdminSession, saveAdminSession } from './session';

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
  if (session?.token && !session.isMock) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

async function withFallback<T>(loader: () => Promise<T>, fallback: T | (() => T)) {
  try {
    return await loader();
  } catch {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await promise;
  if (response.data.code !== 0) {
    throw new Error(response.data.message);
  }

  return response.data.data;
}

export async function adminLogin(username: string, password: string): Promise<AdminSession> {
  return withFallback(
    async () => {
      const session = await unwrap<{ token: string; user: AdminSession['user'] }>(
        client.post('/admin/auth/login', { username, password }),
      );

      const nextSession: AdminSession = {
        token: session.token,
        user: session.user,
      };
      saveAdminSession(nextSession);
      return nextSession;
    },
    () => {
      saveAdminSession(mockAdminSession);
      return mockAdminSession;
    },
  );
}

export async function fetchPendingReviews(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  serviceCategory?: string;
}) {
  return withFallback(
    () =>
      unwrap<PagedResult<ReviewListItem>>(
        client.get('/admin/reviews/pending', {
          params,
        }),
      ),
    mockPendingReviews,
  );
}

export async function fetchOnlinePosts(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  serviceCategory?: string;
}) {
  return withFallback(
    () =>
      unwrap<PagedResult<ReviewListItem>>(
        client.get('/admin/posts/online', {
          params,
        }),
      ),
    mockOnlinePosts,
  );
}

export async function fetchReviewDetail(postId: string) {
  return withFallback(
    () => unwrap<ReviewDetail>(client.get(`/admin/reviews/${postId}`)),
    () => ({
      ...mockReviewDetail,
      id: postId,
    }),
  );
}

export async function approveReview(postId: string) {
  return withFallback(
    () => unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/approve`, {})),
    {
      id: postId,
      status: 'APPROVED',
    },
  );
}

export async function rejectReview(postId: string, reason: string) {
  return withFallback(
    () => unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/reject`, { reason })),
    {
      id: postId,
      status: 'REJECTED',
    },
  );
}

export async function offlineReview(postId: string, reason: string) {
  return withFallback(
    () => unwrap<{ id: string; status: string }>(client.post(`/admin/reviews/${postId}/offline`, { reason })),
    {
      id: postId,
      status: 'OFFLINE',
    },
  );
}

export async function fetchUsers(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return withFallback(
    () =>
      unwrap<PagedResult<UserListItem>>(
        client.get('/admin/users', {
          params,
        }),
      ),
    mockUsers,
  );
}

export async function fetchUserDetail(userId: string) {
  return withFallback(
    () => unwrap<UserDetail>(client.get(`/admin/users/${userId}`)),
    () => ({
      ...mockUserDetail,
      id: userId,
    }),
  );
}
