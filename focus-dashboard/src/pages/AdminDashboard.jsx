import { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // LocalStorage에서 직접 데이터 가져오기
      const { getAdminUsers, getAdminStats } = await import('../utils/api');

      const [usersData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminStats()
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="loading">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-container">
          <div className="error-box">
            <div className="error-title">❌ {error}</div>
            {error.includes('관리자 권한') && (
              <div className="error-help">
                <p>관리자 페이지에 접근하려면 관리자 계정으로 로그인해야 합니다.</p>
                <p><strong>관리자 계정 정보:</strong></p>
                <ul>
                  <li>아이디: admin</li>
                  <li>비밀번호: admin1234</li>
                </ul>
                <button onClick={() => window.location.href = '/login'} className="login-btn">
                  로그인 페이지로 이동
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h2 className="admin-title">👑 관리자 대시보드</h2>
          <p className="admin-subtitle">회원 및 사용 현황 관리</p>
        </div>

        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">전체 회원</div>
                <div className="stat-value">{stats.totalUsers}명</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-label">총 집중 시간</div>
                <div className="stat-value">{stats.totalFocusTime}분</div>
                <div className="stat-sub">({Math.floor(stats.totalFocusTime / 60)}시간)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">총 세션</div>
                <div className="stat-value">{stats.totalSessions}회</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">평균 집중 시간</div>
                <div className="stat-value">{stats.averageFocusTimePerUser}분</div>
                <div className="stat-sub">회원당</div>
              </div>
            </div>
          </div>
        )}

        <div className="users-section">
          <h3 className="section-title">회원 목록 및 활동 현황</h3>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>아이디</th>
                  <th>가입일</th>
                  <th>총 집중 시간</th>
                  <th>세션 수</th>
                  <th>마지막 활동</th>
                  <th>활동 수준</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-message">
                      등록된 회원이 없습니다
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const activityLevel =
                      user.stats.totalFocusTime === 0
                        ? '비활성'
                        : user.stats.totalFocusTime < 60
                        ? '초보'
                        : user.stats.totalFocusTime < 300
                        ? '활동적'
                        : '열심';

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <span className="user-icon">👤</span>
                            <span className="user-name">{user.username}</span>
                          </div>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="focus-time">
                            {user.stats.totalFocusTime}분
                            <span className="time-hours">
                              ({Math.floor(user.stats.totalFocusTime / 60)}h)
                            </span>
                          </div>
                        </td>
                        <td>{user.stats.totalSessions}회</td>
                        <td>{formatDateTime(user.stats.lastActive)}</td>
                        <td>
                          <span className={`activity-badge ${activityLevel}`}>
                            {activityLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
