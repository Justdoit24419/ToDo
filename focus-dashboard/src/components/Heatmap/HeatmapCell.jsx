import './HeatmapCell.css';

const HeatmapCell = ({ date, minutes, goal = null }) => {
  // 목표가 설정되어 있고 해당 날짜가 목표 기간에 포함되는지 확인
  const isGoalDate = goal && date >= goal.startDate && date <= goal.endDate;
  const goalMinutes = goal ? goal.dailyGoalMinutes : 0;
  const isGoalAchieved = isGoalDate && minutes >= goalMinutes;

  // 색상 규칙에 따라 배경색 결정
  const getColor = (minutes) => {
    // 목표가 설정된 날짜인 경우 다른 색상 체계 사용
    if (isGoalDate) {
      if (minutes === 0) return '#ffebee'; // 연한 빨강 (목표 미시작)
      if (minutes >= goalMinutes) return '#4caf50'; // 초록 (목표 달성)
      if (minutes >= goalMinutes * 0.7) return '#ffb74d'; // 주황 (70% 이상)
      return '#ef5350'; // 빨강 (70% 미만)
    }

    // 일반 날짜
    if (minutes === 0) return '#e0e0e0';
    if (minutes < 10) return '#c8e6c9';
    if (minutes < 30) return '#81c784';
    return '#2e7d32';
  };

  // 목표 진행률 계산
  const goalPercentage = isGoalDate && goalMinutes > 0
    ? Math.min(Math.round((minutes / goalMinutes) * 100), 100)
    : null;

  return (
    <div
      className={`heatmap-cell ${isGoalDate ? 'goal-date' : ''} ${isGoalAchieved ? 'goal-achieved' : ''}`}
      style={{ backgroundColor: getColor(minutes) }}
      title={`${date}: ${minutes}분${isGoalDate ? `\n목표: ${goalMinutes}분 (${goalPercentage}% 달성)` : ''}`}
    >
      <div className="cell-minutes">{minutes > 0 ? `${minutes}m` : ''}</div>
      {isGoalDate && (
        <div className="cell-goal-indicator">
          {isGoalAchieved ? '✓' : goalPercentage !== null ? `${goalPercentage}%` : '○'}
        </div>
      )}
    </div>
  );
};

export default HeatmapCell;
