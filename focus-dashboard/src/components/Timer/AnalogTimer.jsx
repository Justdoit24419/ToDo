import { useEffect, useState } from 'react';
import './AnalogTimer.css';

const AnalogTimer = ({ timeLeft, totalTime, theme }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 총 시간을 초 단위로 변환
  const totalSeconds = totalTime * 60;

  // 진행률 계산 (0-100%)
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // 경과 시간 기준으로 계산 (정방향 진행)
  const elapsedSeconds = totalTime * 60 - timeLeft;

  const elapsedHours = Math.floor(elapsedSeconds / 3600);
  const elapsedMinutes = Math.floor((elapsedSeconds % 3600) / 60);
  const elapsedSecs = Math.floor(elapsedSeconds % 60);

  // 총 시간 포맷
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSecs = Math.floor(totalSeconds % 60);

  // 현재 실제 시간 포맷 (15:53:26 형태)
  const realHours = currentTime.getHours();
  const realMinutes = currentTime.getMinutes();
  const realSeconds = currentTime.getSeconds();

  // 아날로그 시계 스타일로 각도 계산 (시계방향 진행)
  const secondAngle = (elapsedSecs / 60) * 360;
  const minuteAngle = (elapsedMinutes / 60) * 360 + (elapsedSecs / 60) * 6;
  const hourAngle = ((elapsedHours % 12) / 12) * 360 + (elapsedMinutes / 60) * 30;

  // 진행 원형 계산
  const circumference = 2 * Math.PI * 180;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`analog-timer analog-timer-${theme}`}>
      {/* 상단 현재 시간 */}
      <div className="current-real-time">
        {String(realHours).padStart(2, '0')}:{String(realMinutes).padStart(2, '0')}:{String(realSeconds).padStart(2, '0')}
      </div>

      <svg className="analog-clock" viewBox="0 0 400 400" width="400" height="400">
        {/* 배경 원 */}
        <circle
          className="clock-background"
          cx="200"
          cy="200"
          r="190"
          fill="none"
        />

        {/* 진행률 표시 원 */}
        <circle
          className="progress-ring"
          cx="200"
          cy="200"
          r="180"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 200 200)"
        />

        {/* 시계 숫자 (12시부터 시계방향) */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const radius = 145;
          const x = 200 + radius * Math.cos(angle);
          const y = 200 + radius * Math.sin(angle);

          return (
            <text
              key={num}
              x={x}
              y={y}
              className="clock-number"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fontWeight="600"
            >
              {num}
            </text>
          );
        })}

        {/* 시계 눈금 */}
        {[...Array(60)].map((_, i) => {
          const angle = (i * 6 - 90) * (Math.PI / 180);
          const isHourMark = i % 5 === 0;
          const startRadius = isHourMark ? 160 : 170;
          const endRadius = 175;

          return (
            <line
              key={i}
              className={isHourMark ? 'hour-mark' : 'minute-mark'}
              x1={200 + startRadius * Math.cos(angle)}
              y1={200 + startRadius * Math.sin(angle)}
              x2={200 + endRadius * Math.cos(angle)}
              y2={200 + endRadius * Math.sin(angle)}
            />
          );
        })}

        {/* 중앙 경과 시간 텍스트 */}
        <text
          x="200"
          y="190"
          className="center-elapsed-label"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontWeight="500"
        >
          경과
        </text>
        <text
          x="200"
          y="215"
          className="center-elapsed-time"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="28"
          fontWeight="700"
        >
          {String(elapsedMinutes).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')}
        </text>
        <text
          x="200"
          y="235"
          className="center-total-time"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="400"
        >
          / {String(totalMinutes).padStart(2, '0')}:{String(totalSecs).padStart(2, '0')}
        </text>

        {/* 중앙 원 */}
        <circle className="center-dot" cx="200" cy="200" r="8" />

        {/* 시침 */}
        <line
          className="hour-hand"
          x1="200"
          y1="200"
          x2={200 + 80 * Math.sin(hourAngle * Math.PI / 180)}
          y2={200 - 80 * Math.cos(hourAngle * Math.PI / 180)}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* 분침 */}
        <line
          className="minute-hand"
          x1="200"
          y1="200"
          x2={200 + 120 * Math.sin(minuteAngle * Math.PI / 180)}
          y2={200 - 120 * Math.cos(minuteAngle * Math.PI / 180)}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 초침 */}
        <line
          className="second-hand"
          x1="200"
          y1="200"
          x2={200 + 150 * Math.sin(secondAngle * Math.PI / 180)}
          y2={200 - 150 * Math.cos(secondAngle * Math.PI / 180)}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div className="analog-info-bottom">
        <div className="total-focus-time">총 집중 시간: {Math.floor(progress)}%</div>
      </div>
    </div>
  );
};

export default AnalogTimer;
