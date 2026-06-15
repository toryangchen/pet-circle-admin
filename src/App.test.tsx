import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { handleApiError } from './services/api';
import { clearAdminSession, saveAdminSession } from './services/session';

describe('admin route guards', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects to login when there is no stored session', async () => {
    render(
      <MemoryRouter initialEntries={['/reviews']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: '进入审核工作台' })).toBeInTheDocument();
  });

  it('returns to login after the current session is cleared', async () => {
    saveAdminSession({
      token: 'token-for-test',
      user: {
        id: 'admin-1',
        username: 'reviewer',
        role: 'SUPER_ADMIN',
      },
    });

    render(
      <MemoryRouter initialEntries={['/reviews']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('审核工作台')).toBeInTheDocument();

    clearAdminSession();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '进入审核工作台' })).toBeInTheDocument();
    });
  });

  it('returns to login after a 401 api error clears the current session', async () => {
    saveAdminSession({
      token: 'token-for-test',
      user: {
        id: 'admin-1',
        username: 'reviewer',
        role: 'SUPER_ADMIN',
      },
    });

    render(
      <MemoryRouter initialEntries={['/reviews']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('审核工作台')).toBeInTheDocument();

    await handleApiError({ response: { status: 401 } }).catch(() => undefined);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '进入审核工作台' })).toBeInTheDocument();
    });
  });

  it('collapses and expands the side menu', async () => {
    saveAdminSession({
      token: 'token-for-test',
      user: {
        id: 'admin-1',
        username: 'reviewer',
        role: 'SUPER_ADMIN',
      },
    });

    render(
      <MemoryRouter initialEntries={['/reviews']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: '收起菜单' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '收起菜单' }));

    expect(screen.getByRole('button', { name: '展开菜单' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '展开菜单' }));

    expect(screen.getByRole('button', { name: '收起菜单' })).toBeInTheDocument();
  });
});
