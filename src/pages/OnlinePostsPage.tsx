import { useEffect, useState } from 'react';
import { App, Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { fetchOnlinePosts, offlineReview } from '../services/api';
import type { ReviewListItem } from '../services/types';

export function OnlinePostsPage() {
  const [items, setItems] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    void reload();
  }, []);

  async function reload() {
    setLoading(true);
    try {
      const result = await fetchOnlinePosts({ page: 1, pageSize: 20 });
      setItems(result.items);
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
          <Button onClick={() => navigate(`/reviews/${record.id}`)}>查看详情</Button>
          <Button
            danger
            onClick={async () => {
              await offlineReview(record.id, '内容过期或人工下架');
              await message.success('已执行下架');
              void reload();
            }}
          >
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
      </div>
      <Card>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      </Card>
    </div>
  );
}
