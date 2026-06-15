import { App, App as AntdApp } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserDetailPage } from './UserDetailPage';

const mockNavigate = vi.fn();
const mockFetchUserDetail = vi.fn();
const mockMessageError = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ userId: 'user-1' }),
  };
});

vi.mock('../services/api', () => ({
  fetchUserDetail: (...args: unknown[]) => mockFetchUserDetail(...args),
}));

function renderWithApp(node: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AntdApp>{node}</AntdApp>
    </MemoryRouter>,
  );
}

describe('UserDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockFetchUserDetail.mockReset();
    mockMessageError.mockReset();
    mockMessageError.mockResolvedValue(undefined);
    vi.spyOn(App, 'useApp').mockReturnValue({
      message: {
        error: mockMessageError,
      },
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('links recent pending and approved posts back into the admin review flow', async () => {
    mockFetchUserDetail.mockResolvedValue({
      id: 'user-1',
      nickname: '养猫用户',
      avatarUrl: null,
      phone: '13812345678',
      phoneAuthorized: true,
      profileAuthorized: true,
      cityDefault: '西安',
      status: 'ACTIVE',
      createdAt: '2026-04-01T00:00:00.000Z',
      postCount: 3,
      recentPosts: [
        {
          id: 'pending-post',
          title: '待审核帖子',
          type: 'PET_SOCIAL',
          status: 'PENDING',
          createdAt: '2026-04-03T00:00:00.000Z',
        },
        {
          id: 'approved-post',
          title: '已上线帖子',
          type: 'SERVICE',
          status: 'APPROVED',
          createdAt: '2026-04-02T00:00:00.000Z',
        },
        {
          id: 'rejected-post',
          title: '已拒绝帖子',
          type: 'SERVICE',
          status: 'REJECTED',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      ],
    });

    renderWithApp(<UserDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '待审核帖子' }));
    expect(mockNavigate).toHaveBeenCalledWith('/reviews/pending-post');

    fireEvent.click(screen.getByRole('button', { name: '已上线帖子' }));
    expect(mockNavigate).toHaveBeenCalledWith('/online/approved-post');

    expect(screen.getByText('已拒绝帖子')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '已拒绝帖子' })).not.toBeInTheDocument();
  });
});
