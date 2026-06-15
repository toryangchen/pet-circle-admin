import { App, App as AntdApp } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlinePostsPage } from './OnlinePostsPage';
import { ReviewDetailPage } from './ReviewDetailPage';

const mockNavigate = vi.fn();
const mockFetchReviewDetail = vi.fn();
const mockFetchOnlinePosts = vi.fn();
const mockApproveReview = vi.fn();
const mockRejectReview = vi.fn();
const mockOfflineReview = vi.fn();
const mockMessageSuccess = vi.fn();
const mockMessageError = vi.fn();

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
  approveReview: (...args: unknown[]) => mockApproveReview(...args),
  rejectReview: (...args: unknown[]) => mockRejectReview(...args),
  offlineReview: (...args: unknown[]) => mockOfflineReview(...args),
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
    mockApproveReview.mockReset();
    mockRejectReview.mockReset();
    mockOfflineReview.mockReset();
    mockMessageSuccess.mockReset();
    mockMessageError.mockReset();
    mockMessageSuccess.mockResolvedValue(undefined);
    mockMessageError.mockResolvedValue(undefined);
    vi.spyOn(App, 'useApp').mockReturnValue({
      message: {
        success: mockMessageSuccess,
        error: mockMessageError,
      },
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('renders structured service fields with operator-facing labels', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'HOME_FEEDING',
      status: 'PENDING',
      title: '待审核上门喂养',
      content: '内容',
      city: '西安',
      images: [],
      author: null,
      contact: null,
      homeFeedingDetail: {
        id: 'detail-1',
        postId: 'post-1',
        serviceArea: '雁塔区',
        availableTime: '周末全天',
        price: '80 元/次',
      },
      boardingDetail: null,
      adoptionDetail: null,
      secondHandDetail: null,
      reviewLogs: [],
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    });

    renderWithApp(<ReviewDetailPage />);

    expect(await screen.findByText('服务区域')).toBeInTheDocument();
    expect(screen.getByText('可服务时间')).toBeInTheDocument();
    expect(screen.getByText('价格')).toBeInTheDocument();
    expect(screen.queryByText('serviceArea')).not.toBeInTheDocument();
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

  it('approves a pending post and returns to the review list', async () => {
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
    mockApproveReview.mockResolvedValue({
      id: 'post-1',
      status: 'APPROVED',
    });

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '审核通过' }));

    await waitFor(() => {
      expect(mockApproveReview).toHaveBeenCalledWith('post-1');
      expect(mockNavigate).toHaveBeenCalledWith('/reviews');
    });
  });

  it('submits the reject reason and returns to the review list', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'BOARDING',
      status: 'PENDING',
      title: '待审核寄养',
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
    mockRejectReview.mockResolvedValue({
      id: 'post-1',
      status: 'REJECTED',
    });

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '审核拒绝' }));

    const reasonInput = await screen.findByLabelText('拒绝原因');
    fireEvent.change(reasonInput, {
      target: {
        value: '资料不完整，请补充联系方式',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));

    await waitFor(() => {
      expect(mockRejectReview).toHaveBeenCalledWith('post-1', '资料不完整，请补充联系方式');
      expect(mockNavigate).toHaveBeenCalledWith('/reviews');
    });
  });

  it('requires an offline reason before offlining an approved post', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'SECOND_HAND',
      status: 'APPROVED',
      title: '已上线闲置',
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
    mockOfflineReview.mockResolvedValue({
      id: 'post-1',
      status: 'OFFLINE',
    });

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '手动下架' }));

    const reasonInput = await screen.findByLabelText('下架原因');
    fireEvent.change(reasonInput, {
      target: {
        value: '服务信息已过期，人工下架',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认下架' }));

    await waitFor(() => {
      expect(mockOfflineReview).toHaveBeenCalledWith('post-1', '服务信息已过期，人工下架');
      expect(mockNavigate).toHaveBeenCalledWith('/online');
    });
  });

  it('stays on the detail page when approve fails', async () => {
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
    mockApproveReview.mockRejectedValue(new Error('审核通过失败'));

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '审核通过' }));

    await waitFor(() => {
      expect(mockApproveReview).toHaveBeenCalledWith('post-1');
      expect(mockMessageError).toHaveBeenCalledWith('审核通过失败');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('stays on the detail page when reject fails', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'BOARDING',
      status: 'PENDING',
      title: '待审核寄养',
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
    mockRejectReview.mockRejectedValue(new Error('拒绝失败'));

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '审核拒绝' }));
    const reasonInput = await screen.findByLabelText('拒绝原因');
    fireEvent.change(reasonInput, {
      target: {
        value: '资料不完整，请补充联系方式',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认拒绝' }));

    await waitFor(() => {
      expect(mockRejectReview).toHaveBeenCalledWith('post-1', '资料不完整，请补充联系方式');
      expect(mockMessageError).toHaveBeenCalledWith('拒绝失败');
    });
    expect(screen.getByText('填写拒绝原因')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认拒绝' })).not.toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('stays on the detail page when offline fails', async () => {
    mockFetchReviewDetail.mockResolvedValue({
      id: 'post-1',
      type: 'SERVICE',
      serviceCategory: 'SECOND_HAND',
      status: 'APPROVED',
      title: '已上线闲置',
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
    mockOfflineReview.mockRejectedValue(new Error('下架失败'));

    renderWithApp(<ReviewDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: '手动下架' }));
    const reasonInput = await screen.findByLabelText('下架原因');
    fireEvent.change(reasonInput, {
      target: {
        value: '服务信息已过期，人工下架',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认下架' }));

    await waitFor(() => {
      expect(mockOfflineReview).toHaveBeenCalledWith('post-1', '服务信息已过期，人工下架');
      expect(mockMessageError).toHaveBeenCalledWith('下架失败');
    });
    expect(screen.getByText('填写下架原因')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '确认下架' })).not.toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
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

  it('requires an offline reason before offlining from the online posts list', async () => {
    mockFetchOnlinePosts.mockResolvedValue({
      items: [
        {
          id: 'post-1',
          title: '已上线闲置',
          type: 'SERVICE',
          serviceCategory: 'SECOND_HAND',
          author: {
            id: 'user-1',
            nickname: '发布者',
            phone: '13812345678',
          },
          status: 'APPROVED',
          city: '西安',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      hasMore: false,
    });
    mockOfflineReview.mockResolvedValue({
      id: 'post-1',
      status: 'OFFLINE',
    });

    renderWithApp(<OnlinePostsPage />);

    fireEvent.click(await screen.findByRole('button', { name: '手动下架' }));
    const reasonInput = await screen.findByLabelText('下架原因');
    fireEvent.change(reasonInput, {
      target: {
        value: '服务信息已过期，人工下架',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: '确认下架' }));

    await waitFor(() => {
      expect(mockOfflineReview).toHaveBeenCalledWith('post-1', '服务信息已过期，人工下架');
    });
    await waitFor(() => {
      expect(mockFetchOnlinePosts).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 20,
        type: undefined,
        serviceCategory: undefined,
      });
    });
  });
});
