import { useEffect, useState } from 'react';
import { Button, Card, Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../services/api';
import type { UserListItem } from '../services/types';

export function UsersPage() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    void reload('');
  }, []);

  async function reload(nextKeyword: string) {
    setLoading(true);
    try {
      const result = await fetchUsers({
        page: 1,
        pageSize: 20,
        keyword: nextKeyword || undefined,
      });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<UserListItem> = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      render: (value) => value || '未命名用户',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: (value) => value || '未绑定',
    },
    {
      title: '授权状态',
      render: (_, record) => (
        <Space>
          <Tag color={record.phoneAuthorized ? 'green' : 'default'}>手机号 {record.phoneAuthorized ? '已授权' : '未授权'}</Tag>
          <Tag color={record.profileAuthorized ? 'blue' : 'default'}>资料 {record.profileAuthorized ? '已授权' : '未授权'}</Tag>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      title: '发布数量',
      dataIndex: 'postCount',
    },
    {
      title: '操作',
      render: (_, record) => <Button onClick={() => navigate(`/users/${record.id}`)}>查看详情</Button>,
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">用户管理</h1>
          <div className="page-subtitle">查看用户基础资料、注册时间与发布数量，辅助审核判断。</div>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="搜索昵称或手机号"
            style={{ width: 260 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={(value) => {
              setKeyword(value);
              void reload(value);
            }}
          />
        </Space>
      </div>
      <Card>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      </Card>
    </div>
  );
}
