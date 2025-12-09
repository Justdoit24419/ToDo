import { useState, useEffect } from 'react';
import { useFocusHistory } from '../../hooks/useFocusHistory';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { getTodayDate } from '../../utils/storage';
import './FocusHeatmap.css';

const FocusHeatmap = () => {
  const {
    getFocusMinutes
  } = useFocusHistory();

  const timer = useGlobalTimer();
  const [updateCounter, setUpdateCounter] = useState(0);

  // 타이머 실행 중일 때 1초마다 히트맵 업데이트
  useEffect(() => {
    if (timer.isRunning) {
      const interval = setInterval(() => {
        setUpdateCounter(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer.isRunning]);

  // 실행 중인 타이머의 경과 시간을 포함한 집중 시간 계산
  const getTotalFocusMinutes = (date) => {
    const savedMinutes = getFocusMinutes(date);
    const today = getTodayDate();

    // 오늘 날짜이고 타이머가 실행 중이면 경과 시간 추가
    if (date === today && timer.isRunning) {
      const elapsedMinutes = timer.getElapsedMinutes();
      return savedMinutes + elapsedMinutes;
    }
    // updateCounter를 사용하여 리렌더링 트리거
    void updateCounter;

    return savedMinutes;
  };

  // 목표 설정 관련 상태
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [goalStartDate, setGoalStartDate] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120); // 기본값 2시간
  const [currentGoal, setCurrentGoal] = useState(null);

  // 목표 불러오기
  useEffect(() => {
    const savedGoal = localStorage.getItem('focusGoal');
    if (savedGoal) {
      setCurrentGoal(JSON.parse(savedGoal));
    }
  }, []);

  // 목표 알림 체크
  useEffect(() => {
    if (!currentGoal) return;

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkGoalProgress = () => {
      const today = getTodayDate();

      // 오늘이 목표 기간에 포함되는지 확인
      if (today >= currentGoal.startDate && today <= currentGoal.endDate) {
        const todayMinutes = getTotalFocusMinutes(today);
        const goalMinutes = currentGoal.dailyGoalMinutes;

        // 목표 미달성 시 알림
        if (todayMinutes < goalMinutes) {
          const remaining = goalMinutes - todayMinutes;
          const percentage = Math.round((todayMinutes / goalMinutes) * 100);

          // 하루에 한 번만 알림 (localStorage로 체크)
          const lastNotificationDate = localStorage.getItem('lastGoalNotification');
          if (lastNotificationDate !== today) {
            // 저녁 8시 이후에만 알림 표시
            const currentHour = new Date().getHours();
            if (currentHour >= 20) {
              if (Notification.permission === 'granted') {
                new Notification('집중 시간 목표 미달성', {
                  body: `오늘 목표 ${goalMinutes}분 중 ${todayMinutes}분 달성 (${percentage}%)\n남은 시간: ${remaining}분`,
                  icon: '/favicon.ico',
                  tag: 'goal-notification'
                });
              }
              localStorage.setItem('lastGoalNotification', today);
            }
          }
        }
      }
    };

    // 최초 체크
    checkGoalProgress();

    // 30분마다 체크
    const interval = setInterval(checkGoalProgress, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentGoal, getFocusMinutes]);

  // 목표 저장
  const handleSaveGoal = () => {
    if (!goalStartDate || !goalEndDate || dailyGoalMinutes <= 0) {
      alert('목표 기간과 시간을 올바르게 입력해주세요.');
      return;
    }

    const goal = {
      startDate: goalStartDate,
      endDate: goalEndDate,
      dailyGoalMinutes: dailyGoalMinutes
    };

    localStorage.setItem('focusGoal', JSON.stringify(goal));
    setCurrentGoal(goal);
    setShowGoalSetting(false);
    alert('목표가 설정되었습니다!');
  };

  // 목표 삭제
  const handleDeleteGoal = () => {
    if (window.confirm('목표를 삭제하시겠습니까?')) {
      localStorage.removeItem('focusGoal');
      setCurrentGoal(null);
      setGoalStartDate('');
      setGoalEndDate('');
      setDailyGoalMinutes(120);
    }
  };

  // 알림 테스트 (개발용)
  const handleTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('집중 시간 목표 알림 테스트', {
        body: '알림이 정상적으로 작동합니다!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      alert('브라우저 알림이 발송되었습니다!');
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('집중 시간 목표 알림 테스트', {
            body: '알림이 정상적으로 작동합니다!',
            icon: '/favicon.ico',
            tag: 'test-notification'
          });
          alert('알림 권한이 허용되었습니다!');
        } else {
          alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
        }
      });
    } else {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
    }
  };

  // 목표 달성률 계산
  const calculateGoalProgress = () => {
    if (!currentGoal) return null;

    const { startDate: goalStart, endDate: goalEnd, dailyGoalMinutes } = currentGoal;
    const goalDates = [];

    const current = new Date(goalStart);
    const end = new Date(goalEnd);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      goalDates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    const totalGoalMinutes = goalDates.length * dailyGoalMinutes;
    const achievedMinutes = goalDates.reduce((sum, date) => sum + getTotalFocusMinutes(date), 0);
    const achievedDays = goalDates.filter(date => getTotalFocusMinutes(date) >= dailyGoalMinutes).length;

    return {
      totalDays: goalDates.length,
      achievedDays,
      totalGoalMinutes,
      achievedMinutes,
      percentage: Math.round((achievedMinutes / totalGoalMinutes) * 100)
    };
  };

  const goalProgress = calculateGoalProgress();

  return (
    <div className="focus-heatmap">
      <div className="heatmap-header">
        <h2 className="heatmap-title">집중 시간 히트맵</h2>

        <div className="heatmap-controls">
          <button
            className="goal-setting-btn"
            onClick={() => setShowGoalSetting(!showGoalSetting)}
          >
            🎯 목표 설정
          </button>
        </div>
      </div>

      {/* 목표 설정 패널 */}
      {showGoalSetting && (
        <div className="goal-setting-panel">
          <h3 className="goal-panel-title">집중 시간 목표 설정</h3>
          <div className="goal-input-row">
            <label>
              시작일:
              <input
                type="date"
                value={goalStartDate}
                onChange={(e) => setGoalStartDate(e.target.value)}
              />
            </label>
            <label>
              종료일:
              <input
                type="date"
                value={goalEndDate}
                onChange={(e) => setGoalEndDate(e.target.value)}
              />
            </label>
            <label>
              하루 목표 시간 (분):
              <input
                type="number"
                min="1"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              />
            </label>
            <button className="save-goal-btn" onClick={handleSaveGoal}>
              목표 저장
            </button>
            {currentGoal && (
              <button className="delete-goal-btn" onClick={handleDeleteGoal}>
                목표 삭제
              </button>
            )}
          </div>
          <div className="notification-info">
            <p className="notification-text">
              💡 알림은 저녁 8시 이후, 목표 미달성 시 자동으로 표시됩니다.
            </p>
            <button className="test-notification-btn" onClick={handleTestNotification}>
              알림 테스트
            </button>
          </div>
        </div>
      )}

      {/* 현재 목표 및 진행률 표시 - 컴팩트 */}
      {currentGoal && goalProgress && (
        <div className="goal-progress-compact">
          <div className="goal-compact-header">
            <span className="goal-compact-title">
              📊 현재 목표: {currentGoal.startDate} ~ {currentGoal.endDate}
            </span>
            <span className="goal-compact-daily">
              하루 목표: {currentGoal.dailyGoalMinutes}분 ({Math.round(currentGoal.dailyGoalMinutes / 60 * 10) / 10}시간)
            </span>
          </div>
          <div className="goal-compact-stats">
            <div className="compact-stat">
              <span className="compact-label">달성 일수</span>
              <span className="compact-value">{goalProgress.achievedDays} / {goalProgress.totalDays}일</span>
            </div>
            <div className="compact-stat-divider">|</div>
            <div className="compact-stat">
              <span className="compact-label">총 집중 시간</span>
              <span className="compact-value">{goalProgress.achievedMinutes} / {goalProgress.totalGoalMinutes}분</span>
            </div>
            <div className="compact-stat-divider">|</div>
            <div className="compact-stat">
              <span className="compact-label">달성률</span>
              <span className={`compact-value ${goalProgress.percentage >= 100 ? 'success' : goalProgress.percentage >= 70 ? 'good' : 'warning'}`}>
                {goalProgress.percentage}%
              </span>
            </div>
          </div>
          {goalProgress.percentage < 100 && (
            <div className="goal-compact-alert">
              ⚠️ 목표 달성까지 {goalProgress.totalGoalMinutes - goalProgress.achievedMinutes}분 더 필요합니다!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FocusHeatmap;
