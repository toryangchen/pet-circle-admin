import { App as AntdApp } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlinePostsPage } from './OnlinePostsPage';
import { ReviewDetailPage } from './ReviewDetailPage';

const mockNavigate = vi.fn();
const mockFetchReviewDetail = vi.fn();
const mockFetchOnlinePosts = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ postId: 'post-1' }),
  };
});

vi.mock('../services/api', () => ({
  fetchReviewDetail: (...args: unknown[]) => mockFetchReviewDetail(...args),
  approveReview: vi.fn(),
  rejectReview: vi.fn(),
  offlineReview: vi.fn(),
  fetchOnlinePosts: (...args: unknown[]) => mockFetchOnlinePosts(...args),
}));

function renderWithApp(node: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AntdApp>{node}</AntdApp>
    </MemoryRouter>,
  );
}

describe('admin review flow pages', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockFetchReviewDetail.mockReset();
    mockFetchOnlinePosts.mockReset();
  });

  it('shows review actions only for pending posts', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'HOME_FEEDING',
      status: 'PENDING',
      title: '待审核服务',
      content: '内容',
      city: '西安',
      images: [],
      author: null,
      contact: null,
      homeFeedingDetail: null,
      boardingDetail: null,
      adoptionDetail: null,
      secondHandDetail: null,
      reviewLogs: [],
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    });

    renderWithApp(<ReviewDetailPage />);

    expect(await screen.findByRole('button', { name: '审核通过' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '审核拒绝' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '手动下架' })).not.toBeInTheDocument();
  });

  it('shows offline action only for approved posts', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'BOARDING',
      status: 'APPROVED',
      title: '已上线服务',
      content: '内容',
      city: '西安',
      images: [],
      author: null,
      contact: null,
      homeFeedingDetail: null,
      boardingDetail: null,
      adoptionDetail: null,
      secondHandDetail: null,
      reviewLogs: [],
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    });

    renderWithApp(<ReviewDetailPage />);

    expect(await screen.findByRole('button', { name: '手动下架' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '审核通过' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '审核拒绝' })).not.toBeInTheDocument();
  });

  it('passes selected filters to the online posts query', async () => {
    mockFetchOnlinePosts.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    });

    renderWithApp(<OnlinePostsPage />);

    await waitFor(() => {
      expect(mockFetchOnlinePosts).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
        serviceCategory: undefined,
      });
    });

    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(await screen.findByText('服务'));

    await waitFor(() => {
      expect(mockFetchOnlinePosts).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        type: 'SERVICE',
        serviceCategory: undefined,
      });
    });
  });
});
