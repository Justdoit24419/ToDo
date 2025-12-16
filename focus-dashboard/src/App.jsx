import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './components/Settings/Settings';
import { TimerProvider } from './contexts/TimerContext';
import { TodosProvider } from './contexts/TodosContext';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTheme, changeTheme } = useTheme();

  useEffect(() => {
    // LocalStorage에서 사용자 정보 확인
    const storedUser = localStorage.getItem('pomodoro_user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 기본 사용자로 자동 설정
        const defaultUser = {
          id: 'default-user',
          username: 'user',
          role: 'user'
        };
        localStorage.setItem('pomodoro_user', JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('pomodoro_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('pomodoro_user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigateToAdmin = () => {
    setCurrentPage('admin');
  };

  // TimerProvider에 전달할 콜백들은 Dashboard에서 받아서 전달
  const renderPage = () => {
    // 관리자인 경우 관리자 대시보드 우선 표시
    if (user?.role === 'admin' && currentPage === 'admin') {
      return <AdminDashboard />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigateToAdmin={handleNavigateToAdmin} />;
      case 'data':
        return <DataManagement />;
      default:
        return <Dashboard user={user} onNavigateToAdmin={handleNavigateToAdmin} />;
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          로딩 중...
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!user) {
    return (
      <div className="app">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <TodosProvider>
      <TimerProvider>
        <div className="app">
          <Navigation
            currentTheme={currentTheme}
            onThemeChange={changeTheme}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            user={user}
            onLogout={handleLogout}
          />
          <Settings />
          {renderPage()}
        </div>
      </TimerProvider>
    </TodosProvider>
  );
}

export default App;
