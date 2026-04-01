import { useEffect, useState } from 'react';
import { App, Button, Card, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { approveReview, fetchPendingReviews, rejectReview } from '../services/api';
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

export function ReviewListPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ReviewListItem[]>([]);
  const [postType, setPostType] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const result = await fetchPendingReviews({
          page: 1,
          pageSize: 20,
          type: postType || undefined,
          serviceCategory: serviceCategory || undefined,
        });

        if (!cancelled) {
          setItems(result.items);
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
  }, [postType, serviceCategory]);

  async function reload() {
    setLoading(true);
    try {
      const result = await fetchPendingReviews({
        page: 1,
        pageSize: 20,
        type: postType || undefined,
        serviceCategory: serviceCategory || undefined,
      });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<ReviewListItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.title}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{record.city}</div>
        </div>
      ),
    },
    {
      title: '类型',
      render: (_, record) => (
        <Space wrap>
          <Tag color={record.type === 'SERVICE' ? 'green' : 'gold'}>{record.type}</Tag>
          {record.serviceCategory ? <Tag>{record.serviceCategory}</Tag> : null}
        </Space>
      ),
    },
    {
      title: '发布者',
      render: (_, record) => (
        <div>
          <Button
            type="link"
            style={{ padding: 0, fontWeight: 600 }}
            onClick={() => record.author?.id && navigate(`/users/${record.author.id}`)}
          >
            {record.author?.nickname || '未命名用户'}
          </Button>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{record.author?.phone || '未绑定手机号'}</div>
        </div>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/reviews/${record.id}`)}>查看详情</Button>
          <Button
            type="primary"
            onClick={async () => {
              await approveReview(record.id);
              await message.success('已审核通过');
              void reload();
            }}
          >
            通过
          </Button>
          <Button
            danger
            onClick={() => setRejectingPostId(record.id)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">待审核列表</h1>
          <div className="page-subtitle">优先处理新发布内容，审核结果会直接影响前台展示。</div>
        </div>
        <Space>
          <Select value={postType} onChange={setPostType} options={typeOptions} style={{ width: 160 }} />
          <Select
            value={serviceCategory}
            onChange={setServiceCategory}
            options={serviceCategoryOptions}
            style={{ width: 180 }}
          />
          <Button onClick={() => void reload()}>刷新</Button>
        </Space>
      </div>
      <Card>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      </Card>
      <RejectReasonModal
        open={!!rejectingPostId}
        loading={rejectSubmitting}
        onCancel={() => setRejectingPostId(null)}
        onConfirm={async (reason) => {
          if (!rejectingPostId) {
            return;
          }

          setRejectSubmitting(true);
          try {
            await rejectReview(rejectingPostId, reason);
            await message.success('已拒绝');
            setRejectingPostId(null);
            await reload();
          } finally {
            setRejectSubmitting(false);
          }
        }}
      />
    </div>
  );
}
