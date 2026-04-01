import { useState } from 'react';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

export function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle at top left, rgba(47,142,12,0.16), transparent 30%), linear-gradient(180deg, #f4f7fb 0%, #eef3f8 100%)',
        }}
      >
        <Card
          style={{ width: 460, borderRadius: 24, boxShadow: '0 20px 60px rgba(16,36,63,0.08)' }}
        >
          <Typography.Title level={2} style={{ marginBottom: 8 }}>
            宠友圈后台登录
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#6b7280', marginBottom: 28 }}>
            管理员登录后可处理待审核内容、查看上线内容和用户信息。
          </Typography.Paragraph>

          <Form
            layout="vertical"
            initialValues={{ username: 'operator', password: 'correct-password' }}
            onFinish={async (values) => {
              setSubmitting(true);
              try {
                await adminLogin(values.username, values.password);
                await messageApi.success('登录成功');
                navigate('/reviews', { replace: true });
              } catch (error) {
                await messageApi.error(
                  error instanceof Error ? error.message : '登录失败，请检查账号密码或服务连接',
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
              <Input size="large" placeholder="operator" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入管理员密码' }]}>
              <Input.Password size="large" placeholder="请输入密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              登录进入审核工作台
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
}
