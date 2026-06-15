import { App as AntdApp, ConfigProvider, Layout, Menu } from 'antd';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  CheckSquareOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
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
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const toggleLabel = sideCollapsed ? '展开菜单' : '收起菜单';

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
    <Layout className="admin-shell">
      <Sider
        width={236}
        collapsedWidth={76}
        collapsed={sideCollapsed}
        trigger={null}
        className="admin-sider"
      >
        <div className={`admin-brand ${sideCollapsed ? 'admin-brand--collapsed' : ''}`}>
          <div className="admin-brand-mark">宠</div>
          {!sideCollapsed ? (
            <div>
              <div className="admin-brand-title">宠友圈后台</div>
              <div className="admin-brand-caption">内容审核与运营管理</div>
            </div>
          ) : null}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          inlineCollapsed={sideCollapsed}
          selectedKeys={[location.pathname.startsWith('/users') ? '/users' : location.pathname.startsWith('/online') ? '/online' : '/reviews']}
          items={menuItems}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
        />
        <button
          type="button"
          className={`admin-sider-toggle ${sideCollapsed ? 'admin-sider-toggle--collapsed' : ''}`}
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() => setSideCollapsed((value) => !value)}
        >
          {sideCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div>
            <div className="admin-header-title">审核工作台</div>
            <div className="admin-header-subtitle">优先处理待审核内容，保持线上信息可控</div>
          </div>
          <div className="admin-user-chip">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{session.user.username}</div>
              <div style={{ color: '#69746d', fontSize: 12 }}>{session.user.role}</div>
            </div>
            <div className="admin-user-avatar">{session.user.username.slice(0, 2).toUpperCase()}</div>
            <LogoutOutlined
              onClick={() => {
                clearAdminSession();
                navigate('/login', { replace: true });
              }}
              className="admin-logout"
            />
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#087443',
          colorInfo: '#2468b2',
          colorSuccess: '#087443',
          colorWarning: '#c96f05',
          colorError: '#c83d33',
          colorText: '#17211c',
          colorTextSecondary: '#69746d',
          colorBorder: '#dce3dc',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
          },
          Table: {
            headerBg: '#f6f8f5',
            rowHoverBg: '#f8fbf7',
          },
        },
      }}
    >
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
    </ConfigProvider>
  );
}
