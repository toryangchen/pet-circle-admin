import { useEffect, useState } from 'react';
import { App, Button, Card, Empty, Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { fetchUsers } from '../services/api';
import type { UserListItem } from '../services/types';

export function UsersPage() {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const result = await fetchUsers({
          page,
          pageSize,
          keyword: searchKeyword || undefined,
        });

        if (!cancelled) {
          setItems(result.items);
          setTotal(result.total);
        }
      } catch (error) {
        if (!cancelled) {
          await message.error(error instanceof Error ? error.message : '用户列表加载失败');
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
  }, [message, page, pageSize, searchKeyword]);

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
      </div>
      <div className="metric-strip">
        <div className="metric-tile">
          <div className="metric-icon"><TeamOutlined /></div>
          <div>
            <div className="metric-label">用户总数</div>
            <div className="metric-value">{total}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><CheckCircleOutlined /></div>
          <div>
            <div className="metric-label">当前页用户</div>
            <div className="metric-value">{items.length}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><SearchOutlined /></div>
          <div>
            <div className="metric-label">搜索条件</div>
            <div className="metric-value" style={{ fontSize: 18 }}>{searchKeyword || '无'}</div>
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-icon"><UserOutlined /></div>
          <div>
            <div className="metric-label">每页显示</div>
            <div className="metric-value">{pageSize}</div>
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <div style={{ color: '#69746d', fontSize: 13 }}>按昵称或手机号查找</div>
        <Space>
          <Input.Search
            allowClear
            placeholder="搜索昵称或手机号"
            style={{ width: 260 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onSearch={(value) => {
              setKeyword(value);
              setSearchKeyword(value);
              setPage(1);
            }}
          />
        </Space>
      </div>
      <Card className="work-panel">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          locale={{ emptyText: <Empty description="暂无用户数据" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 位用户`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
