import { act, render, screen, waitFor } from '@testing-library/react';

import { adminToken } from '../api/token';
import GaesupAdmin from '../components/GaesupAdmin';
import { useAuthStore } from '../store/authStore';

jest.mock('../api/env', () => ({ readViteServerUrl: () => 'https://admin.test' }));

type FakeResponseInit = { status?: number; body?: unknown; headers?: Record<string, string> };

function fakeResponse({ status = 200, body = null, headers = {} }: FakeResponseInit): Response {
  const text = body === null ? '' : JSON.stringify(body);
  const response = {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
    headers: {
      forEach: (callback: (value: string, key: string) => void) => {
        for (const [key, value] of Object.entries(headers)) callback(value, key.toLowerCase());
      },
    },
  };
  return response as unknown as Response;
}

const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit | undefined]>();
const adminUser = { id: 'u1', username: 'operator', roles: ['admin'] };

function requestHeaders(callIndex: number): Record<string, string> {
  const init = fetchMock.mock.calls[callIndex]?.[1];
  return (init?.headers ?? {}) as Record<string, string>;
}

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  adminToken.clear();
  sessionStorage.clear();
  localStorage.clear();
  useAuthStore.setState({ status: 'unknown', isLoggedIn: false, user: null, loading: false, error: null });
});

describe('admin authentication', () => {
  test('the former hard-coded credentials do not log in without server approval', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 401, body: { message: 'invalid' } }));

    const accepted = await useAuthStore.getState().login('admin', 'password');

    expect(accepted).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('https://admin.test/auth/login');
    const state = useAuthStore.getState();
    expect(state).toMatchObject({ status: 'anonymous', isLoggedIn: false, user: null });
    expect(state.error).toBe('사용자 이름 또는 비밀번호를 확인하세요.');
    expect(adminToken.get()).toBeNull();
  });

  test('a server-approved login stores the issued token for this session only', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ body: adminUser, headers: { token: 'issued-token' } }));

    await expect(useAuthStore.getState().login('operator', 'secret')).resolves.toBe(true);

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', isLoggedIn: true, user: adminUser });
    expect(sessionStorage.getItem('gaesup-admin-token')).toBe('issued-token');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('a login response without a user payload or token is rejected', async () => {
    fetchMock.mockResolvedValueOnce(fakeResponse({ body: { ok: true }, headers: { token: 'x' } }));
    await expect(useAuthStore.getState().login('operator', 'secret')).resolves.toBe(false);

    fetchMock.mockResolvedValueOnce(fakeResponse({ body: adminUser }));
    await expect(useAuthStore.getState().login('operator', 'secret')).resolves.toBe(false);

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(adminToken.get()).toBeNull();
  });

  test('session checks send the bearer token and accept only valid users', async () => {
    adminToken.set('stored-token');
    fetchMock.mockResolvedValue(fakeResponse({ body: adminUser }));

    await expect(useAuthStore.getState().verify()).resolves.toBe(true);

    expect(requestHeaders(0)['Authorization']).toBe('Bearer stored-token');
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe('include');
    expect(useAuthStore.getState().user).toEqual(adminUser);
  });

  test('a token the server rejects is cleared', async () => {
    adminToken.set('expired-token');
    fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));

    await expect(useAuthStore.getState().verify()).resolves.toBe(false);

    expect(adminToken.get()).toBeNull();
    expect(sessionStorage.getItem('gaesup-admin-token')).toBeNull();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  test('a network failure keeps the token for a later retry but does not grant access', async () => {
    adminToken.set('stored-token');
    fetchMock.mockRejectedValue(new TypeError('offline'));

    await expect(useAuthStore.getState().verify()).resolves.toBe(false);

    expect(adminToken.get()).toBe('stored-token');
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  test('verification without a token never calls the server', async () => {
    await expect(useAuthStore.getState().verify()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  test('logging out during a pending login discards the late response', async () => {
    let resolveLogin: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => { resolveLogin = resolve; }));

    const pending = useAuthStore.getState().login('operator', 'secret');
    useAuthStore.getState().logout();
    resolveLogin(fakeResponse({ body: adminUser, headers: { token: 'late-token' } }));

    await expect(pending).resolves.toBe(false);
    expect(useAuthStore.getState()).toMatchObject({ status: 'anonymous', isLoggedIn: false, user: null });
    expect(adminToken.get()).toBeNull();
  });
});

describe('GaesupAdmin gate', () => {
  test('a tampered localStorage session does not unlock the children', async () => {
    localStorage.setItem(
      'gaesup-admin-auth',
      JSON.stringify({ state: { isLoggedIn: true, user: { username: 'intruder' } }, version: 0 }),
    );

    render(<GaesupAdmin><p>secret panel</p></GaesupAdmin>);

    expect(await screen.findByRole('heading', { name: '관리자 로그인' })).toBeInTheDocument();
    expect(screen.queryByText('secret panel')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('children render only after the server confirms the stored session', async () => {
    adminToken.set('stored-token');
    let resolveCheck: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => { resolveCheck = resolve; }));

    render(<GaesupAdmin><p>secret panel</p></GaesupAdmin>);

    expect(await screen.findByRole('status')).toHaveTextContent('세션 확인 중');
    expect(screen.queryByText('secret panel')).not.toBeInTheDocument();

    await act(async () => {
      resolveCheck(fakeResponse({ body: adminUser }));
    });

    expect(await screen.findByText('secret panel')).toBeInTheDocument();
  });

  test('requiredRoles blocks users without a matching server role', async () => {
    adminToken.set('stored-token');
    fetchMock.mockResolvedValue(fakeResponse({ body: { ...adminUser, roles: ['viewer'] } }));

    const { rerender } = render(
      <GaesupAdmin requiredRoles={['admin', 'manager']}><p>secret panel</p></GaesupAdmin>,
    );

    expect(await screen.findByText('이 화면에 접근할 권한이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByText('secret panel')).not.toBeInTheDocument();

    rerender(<GaesupAdmin requiredRoles={['viewer']}><p>secret panel</p></GaesupAdmin>);
    await waitFor(() => expect(screen.getByText('secret panel')).toBeInTheDocument());
  });

  test('requireLogin=false renders children without contacting the server', () => {
    render(<GaesupAdmin requireLogin={false}><p>public panel</p></GaesupAdmin>);
    expect(screen.getByText('public panel')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
