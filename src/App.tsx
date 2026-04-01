import { App as AntdApp, Layout, Menu, theme } from 'antd';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  CheckSquareOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  ADMIN_SESSION_EVENT,
  clearAdminSession,
  getStoredAdminSession,
} from './services/session';

const { Header, Sider, Content } = Layout;
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const ReviewListPage = lazy(() =>
  import('./pages/ReviewListPage').then((module) => ({
    default: module.ReviewListPage,
  })),
);
const ReviewDetailPage = lazy(() =>
  import('./pages/ReviewDetailPage').then((module) => ({
    default: module.ReviewDetailPage,
  })),
);
const OnlinePostsPage = lazy(() =>
  import('./pages/OnlinePostsPage').then((module) => ({
    default: module.OnlinePostsPage,
  })),
);
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((module) => ({ default: module.UsersPage })),
);
const UserDetailPage = lazy(() =>
  import('./pages/UserDetailPage').then((module) => ({
    default: module.UserDetailPage,
  })),
);

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        color: '#6b7280',
        fontSize: 14,
      }}
    >
      页面加载中...
    </div>
  );
}

function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getStoredAdminSession());
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

  useEffect(() => {
    const syncSession = () => {
      setSession(getStoredAdminSession());
    };

    window.addEventListener('storage', syncSession);
    window.addEventListener(ADMIN_SESSION_EVENT, syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(ADMIN_SESSION_EVENT, syncSession);
    };
  }, []);

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
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </AntdApp>
  );
}
