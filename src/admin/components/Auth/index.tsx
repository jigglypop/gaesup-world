import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../store/toastStore";
import { useNavigate } from "react-router-dom";
import './styles.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login, loading } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (success) {
          addToast({ text: "로그인 성공", type: "success" });
          navigate("/admin/world/");
        } else {
          addToast({ text: "로그인 실패", type: "error" });
        }
      } else {
        if (password !== confirmPassword) {
          addToast({ text: "비밀번호가 일치하지 않습니다", type: "error" });
          return;
        }
        // For demo purposes, just switch to login
        addToast({ text: "회원가입 기능은 데모에서 지원하지 않습니다", type: "info" });
        setIsLogin(true);
      }
    } catch (error) {
      addToast({ text: "인증 중 오류가 발생했습니다", type: "error" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "관리자 로그인" : "회원가입"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="사용자명"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button type="submit" disabled={loading}>
            {loading ? "처리중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
        <button
          className="switch-btn"
          onClick={() => setIsLogin(!isLogin)}
          type="button">
          {isLogin ? "회원가입" : "로그인"}으로 전환
        </button>
        {isLogin && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: 'rgba(0,120,212,0.1)', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: 'var(--editor-text-secondary)'
          }}>
            Demo: admin / password
          </div>
        )}
      </div>
    </div>
  );
} 