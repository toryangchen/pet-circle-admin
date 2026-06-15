import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const mockAdminLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  adminLogin: (...args: unknown[]) => mockAdminLogin(...args),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockAdminLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('prefills the local admin credentials so operators can click login directly', async () => {
    mockAdminLogin.mockResolvedValue({
      token: 'admin-token',
      user: {
        id: 'admin-1',
        username: 'operator',
        role: 'SUPER_ADMIN',
      },
    });

    renderLoginPage();

    expect(screen.getByLabelText('账号')).toHaveValue('operator');
    expect(screen.getByLabelText('密码')).toHaveValue('correct-password');

    fireEvent.click(screen.getByRole('button', { name: '进入审核工作台' }));

    await waitFor(() => {
      expect(mockAdminLogin).toHaveBeenCalledWith('operator', 'correct-password');
    });
  });
});
