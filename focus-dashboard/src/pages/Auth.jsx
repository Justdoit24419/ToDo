import './Auth.css';

const Auth = ({ onLogin }) => {
  const handleStart = () => {
    // 기본 사용자로 자동 로그인
    const defaultUser = {
      id: 'default-user',
      username: 'user',
      role: 'user'
    };

    onLogin(defaultUser);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🍅 포모도로 집중 대시보드</h1>
          <p className="auth-subtitle">생산성을 높이는 시간 관리 도구</p>
        </div>

        <div className="auth-form">
          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginBottom: '24px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            모든 데이터는 브라우저에 안전하게 저장됩니다.<br />
            회원가입이나 로그인 없이 바로 사용하세요!
          </p>

          <button
            onClick={handleStart}
            className="auth-submit"
            type="button"
          >
            시작하기
          </button>
        </div>

        <div className="auth-demo">
          <p className="demo-text" style={{ fontSize: '13px', color: '#64748b' }}>
            💡 브라우저 캐시를 지우면 데이터가 삭제됩니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
