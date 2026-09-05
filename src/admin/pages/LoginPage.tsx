import React, { useState } from 'react';

import { useAuthStore } from '../store/authStore';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('사용자 이름 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="login-container">
      <h1>관리자 로그인</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="admin-username">사용자 이름</label>
        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="사용자 이름"
          required
          className="login-input"
          autoComplete="username"
        />
        <label htmlFor="admin-password">비밀번호</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          className="login-input"
          autoComplete="current-password"
        />
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        {error && <p className="login-error" role="alert">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
