import { useEffect, useState } from 'react';
import { App, Button, Card, Empty, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, FileSearchOutlined, FilterOutlined, StopOutlined } from '@ant-design/icons';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { fetchOnlinePosts, offlineReview } from '../services/api';
import type { ReviewListItem } from '../services/types';

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '宠物圈', value: 'PET_SOCIAL' },
  { label: '服务', value: 'SERVICE' },
];

const serviceCategoryOptions = [
  { label: '全部类目', value: '' },
  { label: '领养', value: 'ADOPTION' },
  { label: '寄养', value: 'BOARDING' },
  { label: '上门喂养', value: 'HOME_FEEDING' },
  { label: '闲置', value: 'SECOND_HAND' },
];

export function OnlinePostsPage() {
  const [items, setItems] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [postType, setPostType] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [offliningPostId, setOffliningPostId] = useState<string | null>(null);
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const result = await fetchOnlinePosts({
          page,
          pageSize,
          type: postType || undefined,
          serviceCategory: serviceCategory || undefined,
        });
        if (!cancelled) {
          setItems(result.items);
          setTotal(result.total);
        }
      } catch (error) {
        if (!cancelled) {
          void message.error(error instanceof Error ? error.message : '已上线内容加载失败');
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [message, page, pageSize, postType, serviceCategory]);

  async function reload() {
    setLoading(true);
    try {
      const result = await fetchOnlinePosts({
        page,
        pageSize,
        type: postType || undefined,
        serviceCategory: serviceCategory || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      await message.error(error instanceof Error ? error.message : '已上线内容加载失败');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<ReviewListItem> = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '类型',
      render: (_, record) => (
        <Space>
          <Tag color={record.type === 'SERVICE' ? 'green' : 'gold'}>{record.type}</Tag>
          {record.serviceCategory ? <Tag>{record.serviceCategory}</Tag> : null}
        </Space>
      ),
    },
    {
      title: '发布者',
      render: (_, record) => record.author?.nickname || '未命名用户',
    },
    {
      title: '上线时间',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/online/${record.id}`)}>查看详情</Button>
          <Button danger onClick={() => setOffliningPostId(record.id)}>
            手动下架
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">已上线内容</h1>
          <div className="page-subtitle">查看当前公开展示的内容，并支持运营手动下架。</div>
        </div>
        <Button onClick={() => void reload()}>刷新</Button>
      </div>
      <div className="metric-strip">
        <div className="metric-tile">
          <div className="metric-icon"><CheckCircleOutlined /></div>
          <div>
            <div className="metric-label">线上内容</div>
            <div className="metric-value">{total}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><FilterOutlined /></div>
          <div>
            <div className="metric-label">当前类型</div>
            <div className="metric-value" style={{ fontSize: 18 }}>{postType || '全部'}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><FileSearchOutlined /></div>
          <div>
            <div className="metric-label">服务类目</div>
            <div className="metric-value" style={{ fontSize: 18 }}>{serviceCategory || '全部'}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><StopOutlined /></div>
          <div>
            <div className="metric-label">下架入口</div>
            <div className="metric-value" style={{ fontSize: 18 }}>需原因</div>
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <div style={{ color: '#69746d', fontSize: 13 }}>线上内容筛选</div>
        <Space>
          <Select
            value={postType}
            onChange={(value) => {
              setPostType(value);
              setPage(1);
            }}
            options={typeOptions}
            style={{ width: 160 }}
          />
          <Select
            value={serviceCategory}
            onChange={(value) => {
              setServiceCategory(value);
              setPage(1);
            }}
            options={serviceCategoryOptions}
            style={{ width: 180 }}
          />
        </Space>
      </div>
      <Card className="work-panel">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          locale={{ emptyText: <Empty description="暂无已上线内容" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
        />
      </Card>
      <RejectReasonModal
        open={!!offliningPostId}
        loading={offlineSubmitting}
        title="填写下架原因"
        fieldLabel="下架原因"
        okText="确认下架"
        defaultReason="内容过期或不适合继续展示"
        placeholder="例如：服务信息已过期、联系方式无效、内容不适合继续展示"
        onCancel={() => setOffliningPostId(null)}
        onConfirm={async (reason) => {
          if (!offliningPostId) {
            return;
          }

          setOfflineSubmitting(true);
          try {
            await offlineReview(offliningPostId, reason);
            await message.success('已执行下架');
            setOffliningPostId(null);
            await reload();
          } catch (error) {
            await message.error(error instanceof Error ? error.message : '下架失败');
          } finally {
            setOfflineSubmitting(false);
          }
        }}
      />
    </div>
  );
}
