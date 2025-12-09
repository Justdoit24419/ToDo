import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as api from '../../utils/api';
import './ProductivityCharts.css';

// Date 객체를 로컬 시간대의 YYYY-MM-DD 문자열로 변환
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProductivityCharts = ({ focusHistory, todos }) => {
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month'
  const [hourlyFocusData, setHourlyFocusData] = useState({});

  // 시간대별 집중 데이터 로드
  useEffect(() => {
    const loadHourlyData = async () => {
      try {
        const data = await api.getHourlyFocusData();
        setHourlyFocusData(data);
      } catch (error) {
        console.error('시간대별 집중 데이터 로드 실패:', error);
      }
    };
    loadHourlyData();
  }, []);

  // 주간/월간 집중 시간 추이 데이터
  const trendData = useMemo(() => {
    const today = new Date();
    const days = timeRange === 'week' ? 7 : 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatLocalDate(date);
      const minutes = focusHistory[dateStr] || 0;

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes: minutes,
        hours: Number((minutes / 60).toFixed(1))
      });
    }

    return data;
  }, [focusHistory, timeRange]);

  // 할일 완료율 데이터
  const completionData = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const incomplete = total - completed;

    return [
      { name: '완료', value: completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 },
      { name: '미완료', value: incomplete, percentage: total > 0 ? Math.round((incomplete / total) * 100) : 0 }
    ];
  }, [todos]);

  // 시간대별 생산성 데이터 (실제 데이터)
  const hourlyData = useMemo(() => {
    // 24시간 배열 초기화
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}시`,
      minutes: 0
    }));

    // 최근 30일간의 시간대별 데이터 집계
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatLocalDate(date);

      const dayData = hourlyFocusData[dateStr];
      if (dayData) {
        Object.entries(dayData).forEach(([hour, minutes]) => {
          const hourNum = parseInt(hour);
          if (hourNum >= 0 && hourNum < 24) {
            hours[hourNum].minutes += minutes;
          }
        });
      }
    }

    // 0분이 아닌 시간대만 필터링하거나, 데이터가 없으면 전체 표시
    const filteredHours = hours.filter(h => h.minutes > 0);
    return filteredHours.length > 0 ? filteredHours : hours;
  }, [hourlyFocusData]);

  const COLORS = {
    completed: '#4caf50',
    incomplete: '#ff9800',
    trend: '#2196f3',
    bar: '#9c27b0'
  };

  return (
    <div className="productivity-charts">
      <div className="chart-section">
        <div className="chart-header">
          <h3>📈 집중 시간 추이</h3>
          <div className="time-range-toggle">
            <button
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              주간
            </button>
            <button
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              월간
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              label={{ value: '시간', angle: -90, position: 'insideLeft', fontSize: 12 }}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}시간`, '집중 시간']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="hours"
              stroke={COLORS.trend}
              strokeWidth={2}
              dot={{ fill: COLORS.trend, r: 4 }}
              activeDot={{ r: 6 }}
              name="집중 시간"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        <div className="chart-section half">
          <div className="chart-header">
            <h3>🎯 할일 완료율</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.completed : COLORS.incomplete} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section half">
          <div className="chart-header">
            <h3>⏰ 시간대별 생산성</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                stroke="#666"
              />
              <YAxis
                label={{ value: '분', angle: -90, position: 'insideLeft', fontSize: 12 }}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}분`, '집중 시간']}
              />
              <Bar dataKey="minutes" fill={COLORS.bar} name="집중 시간" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductivityCharts;
