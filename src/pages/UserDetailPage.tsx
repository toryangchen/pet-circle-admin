import { useEffect, useState } from 'react';
import { App, Button, Card, Descriptions, Empty, List, Tag } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetail } from '../services/api';
import type { UserDetail } from '../services/types';

export function UserDetailPage() {
  const { userId = '' } = useParams();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setErrorText('');
      try {
        const nextDetail = await fetchUserDetail(userId);
        if (!cancelled) {
          setDetail(nextDetail);
        }
      } catch (error) {
        if (!cancelled) {
          setDetail(null);
          const nextError = error instanceof Error ? error.message : '用户详情加载失败';
          setErrorText(nextError);
          await message.error(nextError);
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
  }, [message, userId]);

  if (loading) {
    return <Card loading />;
  }

  if (!detail) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">用户详情</h1>
            <div className="page-subtitle">查看用户资料、状态和最近发布内容。</div>
          </div>
          <Button onClick={() => navigate('/users')}>返回用户列表</Button>
        </div>
        <Card>
          <Empty description={errorText || '未找到用户详情'} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">用户详情</h1>
          <div className="page-subtitle">查看用户资料、状态和最近发布内容。</div>
        </div>
      </div>
      <Card title="基础信息">
        <Descriptions column={2}>
          <Descriptions.Item label="昵称">{detail.nickname || '未命名用户'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{detail.phone || '未绑定'}</Descriptions.Item>
          <Descriptions.Item label="默认城市">{detail.cityDefault || '未设置'}</Descriptions.Item>
          <Descriptions.Item label="状态">{detail.status}</Descriptions.Item>
          <Descriptions.Item label="手机号授权">
            <Tag color={detail.phoneAuthorized ? 'green' : 'default'}>
              {detail.phoneAuthorized ? '已授权' : '未授权'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="资料授权">
            <Tag color={detail.profileAuthorized ? 'blue' : 'default'}>
              {detail.profileAuthorized ? '已授权' : '未授权'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">{dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="发布数量">{detail.postCount}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="最近发布" style={{ marginTop: 16 }}>
        <List
          dataSource={detail.recentPosts}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    {item.title} <Tag>{item.type}</Tag> <Tag>{item.status}</Tag>
                  </span>
                }
                description={dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
