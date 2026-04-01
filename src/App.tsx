import { App as AntdApp, Layout, Menu, theme } from 'antd';
import {
  CheckSquareOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { LoginPage } from './pages/LoginPage';
import { OnlinePostsPage } from './pages/OnlinePostsPage';
import { ReviewDetailPage } from './pages/ReviewDetailPage';
import { ReviewListPage } from './pages/ReviewListPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UsersPage } from './pages/UsersPage';
import { getStoredAdminSession, clearAdminSession } from './services/session';

const { Header, Sider, Content } = Layout;

function ProtectedLayout() {
  const session = getStoredAdminSession();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const menuItems = useMemo(
    () => [
      {
        key: '/reviews',
        icon: <CheckSquareOutlined />,
        label: <Link to="/reviews">待审核</Link>,
      },
      {
        key: '/online',
        icon: <FileSearchOutlined />,
        label: <Link to="/online">已上线内容</Link>,
      },
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: <Link to="/users">用户管理</Link>,
      },
    ],
    [],
  );

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={248}
        style={{
          background: '#10243f',
          paddingTop: 16,
        }}
      >
        <div
          style={{
            color: '#f5f7fb',
            fontSize: 20,
            fontWeight: 700,
            padding: '8px 20px 20px',
          }}
        >
          宠友圈后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/users') ? '/users' : location.pathname.startsWith('/online') ? '/online' : '/reviews']}
          items={menuItems}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>审核工作台</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>优先处理待审核、已上线与用户信息查看</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{session.user.username}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{session.user.role}</div>
            </div>
            <LogoutOutlined
              onClick={() => {
                clearAdminSession();
                navigate('/login', { replace: true });
              }}
              style={{ cursor: 'pointer', color: '#6b7280', fontSize: 18 }}
            />
          </div>
        </Header>
        <Content style={{ padding: 24, background: '#f4f7fb' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <AntdApp>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/reviews" replace />} />
          <Route path="/reviews" element={<ReviewListPage />} />
          <Route path="/reviews/:postId" element={<ReviewDetailPage />} />
          <Route path="/online" element={<OnlinePostsPage />} />
          <Route path="/online/:postId" element={<ReviewDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Route>
      </Routes>
    </AntdApp>
  );
}
