import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
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
    // 로컬 스토리지에서 사용자 정보 확인
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          {renderPage()}
        </div>
      </TimerProvider>
    </TodosProvider>
  );
}

export default App;
