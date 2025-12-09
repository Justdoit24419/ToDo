import { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const url = `${API_BASE_URL}${endpoint}`;

      console.log('로그인 시도:', { url, username, API_BASE_URL });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('응답 상태:', response.status, response.statusText);

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (!response.ok) {
        throw new Error(data.error || '오류가 발생했습니다');
      }

      if (isLogin) {
        // 로그인 성공
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 로그인 저장 체크 시 자동 로그인 정보 저장
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedUsername', username);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedUsername');
        }

        onLogin(data.user);
      } else {
        // 회원가입 성공
        setError('');
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setError(err.message || '네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🍅 포모도로 집중 대시보드</h1>
          <p className="auth-subtitle">생산성을 높이는 시간 관리 도구</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            type="button"
          >
            로그인
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "비밀번호를 입력하세요" : "6자 이상 입력하세요"}
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {isLogin && (
            <div className="form-group remember-me">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>로그인 상태 유지</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        {isLogin && (
          <div className="auth-demo">
            <p className="demo-title">데모 계정</p>
            <p className="demo-text">관리자: admin / admin1234</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
