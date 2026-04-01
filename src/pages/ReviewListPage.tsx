import { useEffect, useState } from 'react';
import { App, Button, Card, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { approveReview, fetchPendingReviews, rejectReview } from '../services/api';
import type { ReviewListItem } from '../services/types';

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
  const [serviceCategory, setServiceCategory] = useState('');
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const result = await fetchPendingReviews({
          page: 1,
          pageSize: 20,
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
  }, [serviceCategory]);

  async function reload() {
    setLoading(true);
    try {
      const result = await fetchPendingReviews({
        page: 1,
        pageSize: 20,
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
          <div>{record.author?.nickname || '未命名用户'}</div>
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
            onClick={() => {
              void modal.confirm({
                title: '填写拒绝原因',
                content: '将以“信息不完整”作为默认拒绝原因。',
                onOk: async () => {
                  await rejectReview(record.id, '信息不完整');
                  await message.success('已拒绝');
                  void reload();
                },
              });
            }}
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
    </div>
  );
}
