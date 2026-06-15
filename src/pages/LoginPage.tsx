import { useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

export function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div className="login-page">
        <section className="login-hero">
          <div className="admin-brand">
            <div className="admin-brand-mark">宠</div>
            <div>
              <div className="admin-brand-title">宠友圈后台</div>
              <div className="admin-brand-caption">Pet Circle Operations</div>
            </div>
          </div>
          <div>
            <div className="login-hero-title">把每一条上线内容，控制在运营可见范围内。</div>
            <div className="login-hero-copy">
              审核发布内容、处理下架原因、查看用户发布记录。后台只保留必要操作，方便运营快速判断。
            </div>
          </div>
          <div style={{ color: 'rgba(247,251,248,0.48)', fontSize: 12 }}>Xi'an MVP · Admin Console</div>
        </section>
        <div className="login-card-wrap">
          <Card className="login-card">
          <h1 className="login-title">登录审核工作台</h1>
          <div className="login-subtitle">默认本地管理员已填入，可直接进入后台检查审核流。</div>
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
              进入审核工作台
            </Button>
          </Form>
        </Card>
        </div>
      </div>
    </>
  );
}
