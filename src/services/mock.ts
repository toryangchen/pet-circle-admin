import type {
  AdminSession,
  PagedResult,
  ReviewDetail,
  ReviewListItem,
  UserDetail,
  UserListItem,
} from './types';

export const mockAdminSession: AdminSession = {
  token: 'mock-admin-token',
  user: {
    id: 'admin-1',
    username: 'operator',
    role: 'OPERATOR',
  },
  isMock: true,
};

export const mockPendingReviews: PagedResult<ReviewListItem> = {
  items: [
    {
      id: 'review-post-1',
      title: '西安高新区五一可上门喂猫，拍照反馈及时',
      type: 'SERVICE',
      serviceCategory: 'HOME_FEEDING',
      author: {
        id: 'user-1',
        nickname: '糯米和团子',
        phone: '13800000001',
      },
      status: 'PENDING',
      city: '西安',
      createdAt: '2026-04-01T09:00:00.000Z',
    },
    {
      id: 'review-post-2',
      title: '猫咪春天第一次出门晒太阳',
      type: 'PET_SOCIAL',
      serviceCategory: null,
      author: {
        id: 'user-2',
        nickname: '雪球妈妈',
        phone: '13800000002',
      },
      status: 'PENDING',
      city: '西安',
      createdAt: '2026-04-01T08:30:00.000Z',
    },
  ],
  page: 1,
  pageSize: 10,
  total: 2,
  hasMore: false,
};

export const mockOnlinePosts: PagedResult<ReviewListItem> = {
  items: [
    {
      id: 'online-post-1',
      title: '未央区可寄养，视频回访',
      type: 'SERVICE',
      serviceCategory: 'BOARDING',
      author: {
        id: 'user-3',
        nickname: '喵咪照护站',
        phone: '13800000003',
      },
      status: 'APPROVED',
      city: '西安',
      createdAt: '2026-03-31T18:00:00.000Z',
    },
  ],
  page: 1,
  pageSize: 10,
  total: 1,
  hasMore: false,
};

export const mockReviewDetail: ReviewDetail = {
  id: 'review-post-1',
  type: 'SERVICE',
  serviceCategory: 'HOME_FEEDING',
  status: 'PENDING',
  title: '西安高新区五一可上门喂猫，拍照反馈及时',
  content: '家里两只英短，支持上门喂食、换水、猫砂清理，接受节假日预约。',
  city: '西安',
  images: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
  ],
  author: {
    id: 'user-1',
    nickname: '糯米和团子',
    avatarUrl: null,
    phone: '13800000001',
  },
  contact: {
    contactName: '陈女士',
    phone: '13800000001',
    wechatId: 'pet-circle-mock',
  },
  homeFeedingDetail: {
    serviceArea: '高新区 / 雁塔区',
    availableTime: '工作日晚间 / 节假日',
    price: '30',
  },
  reviewLogs: [],
  createdAt: '2026-04-01T09:00:00.000Z',
  updatedAt: '2026-04-01T09:00:00.000Z',
};

export const mockUsers: PagedResult<UserListItem> = {
  items: [
    {
      id: 'user-1',
      nickname: '糯米和团子',
      phone: '13800000001',
      phoneAuthorized: true,
      profileAuthorized: true,
      createdAt: '2026-03-29T00:00:00.000Z',
      postCount: 2,
    },
    {
      id: 'user-2',
      nickname: '雪球妈妈',
      phone: '13800000002',
      phoneAuthorized: false,
      profileAuthorized: true,
      createdAt: '2026-03-28T00:00:00.000Z',
      postCount: 1,
    },
  ],
  page: 1,
  pageSize: 10,
  total: 2,
  hasMore: false,
};

export const mockUserDetail: UserDetail = {
  id: 'user-1',
  nickname: '糯米和团子',
  avatarUrl: null,
  phone: '13800000001',
  phoneAuthorized: true,
  profileAuthorized: true,
  cityDefault: '西安',
  status: 'ACTIVE',
  createdAt: '2026-03-29T00:00:00.000Z',
  postCount: 2,
  recentPosts: [
    {
      id: 'review-post-1',
      title: '西安高新区五一可上门喂猫，拍照反馈及时',
      type: 'SERVICE',
      status: 'PENDING',
      createdAt: '2026-04-01T09:00:00.000Z',
    },
    {
      id: 'post-2',
      title: '猫咪春天第一次出门晒太阳',
      type: 'PET_SOCIAL',
      status: 'APPROVED',
      createdAt: '2026-03-31T08:30:00.000Z',
    },
  ],
};
