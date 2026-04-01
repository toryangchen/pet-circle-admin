export type PostType = 'PET_SOCIAL' | 'SERVICE';
export type ServiceCategory = 'ADOPTION' | 'SECOND_HAND' | 'HOME_FEEDING' | 'BOARDING' | null;
export type PostStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE' | 'COMPLETED';
export type ReviewAction = 'APPROVE' | 'REJECT' | 'OFFLINE';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type AdminUserRole = 'SUPER_ADMIN' | 'OPERATOR';

export type AdminSession = {
  token: string;
  user: {
    id: string;
    username: string;
    role: AdminUserRole;
  };
  isMock?: boolean;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type ReviewListItem = {
  id: string;
  title: string;
  type: PostType;
  serviceCategory: ServiceCategory;
  author: {
    id: string;
    nickname: string | null;
    phone: string | null;
  } | null;
  status: PostStatus;
  city: string;
  createdAt: string;
};

export type ReviewDetail = {
  id: string;
  type: PostType;
  serviceCategory: ServiceCategory;
  status: PostStatus;
  title: string;
  content: string;
  city: string;
  images: string[];
  author: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    phone: string | null;
  } | null;
  contact?: {
    wechatId?: string | null;
    phone?: string | null;
    contactName?: string | null;
  } | null;
  adoptionDetail?: Record<string, unknown> | null;
  secondHandDetail?: Record<string, unknown> | null;
  homeFeedingDetail?: Record<string, unknown> | null;
  boardingDetail?: Record<string, unknown> | null;
  reviewLogs: Array<{
    id: string;
    reviewerId: string;
    action: ReviewAction | 'PENDING';
    reason: string | null;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type UserListItem = {
  id: string;
  nickname: string | null;
  phone: string | null;
  phoneAuthorized: boolean;
  profileAuthorized: boolean;
  createdAt: string;
  postCount: number;
};

export type UserDetail = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  phoneAuthorized: boolean;
  profileAuthorized: boolean;
  cityDefault: string | null;
  status: UserStatus;
  createdAt: string;
  postCount: number;
  recentPosts: Array<{
    id: string;
    title: string;
    type: PostType;
    status: PostStatus;
    createdAt: string;
  }>;
};
