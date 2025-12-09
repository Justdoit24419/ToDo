import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, initDB } from './db.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'pomodoro-secret-key-2025';

// CORS 설정 - 모든 origin 허용
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// DB 초기화
await initDB();

// ========== 인증 미들웨어 ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
};

// 관리자 권한 체크
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' });
  }
  next();
};

// ========== 인증 API ==========

// 회원가입
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다' });
    }

    await db.read();

    // 중복 체크
    if (db.data.users.find(u => u.username === username)) {
      return res.status(400).json({ error: '이미 존재하는 아이디입니다' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.data.users.push(newUser);
    db.data.todos[userId] = [];
    db.data.focusHistory[userId] = {};
    db.data.hourlyFocus[userId] = {}; // 시간대별 집중 기록 초기화
    db.data.stats[userId] = {
      totalFocusTime: 0,
      totalSessions: 0,
      lastActive: new Date().toISOString()
    };

    await db.write();

    res.json({ message: '회원가입이 완료되었습니다', userId });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('로그인 시도:', { username, passwordLength: password?.length });

    await db.read();

    const user = db.data.users.find(u => u.username === username);
    console.log('사용자 찾기 결과:', user ? `찾음 (${user.username})` : '없음');

    if (!user) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 검증 결과:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('비밀번호 불일치 - 입력된 비밀번호 길이:', password.length);
      return res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 비밀번호 변경
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 입력하세요' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: '새 비밀번호는 8자 이상이어야 합니다' });
    }

    await db.read();
    const user = db.data.users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다' });
    }

    // 기존 비밀번호와 동일한지 체크
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ error: '새 비밀번호가 기존 비밀번호와 동일합니다' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await db.write();

    res.json({ message: '비밀번호가 변경되었습니다' });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ========== 할일 API ==========

// 할일 목록 조회
app.get('/api/todos', authMiddleware, async (req, res) => {
  try {
    await db.read();
    const todos = db.data.todos[req.user.id] || [];
    res.json(todos);
  } catch (error) {
    console.error('할일 조회 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 할일 저장
app.post('/api/todos', authMiddleware, async (req, res) => {
  try {
    const { todos } = req.body;
    await db.read();
    db.data.todos[req.user.id] = todos;
    await db.write();
    res.json({ message: '저장되었습니다' });
  } catch (error) {
    console.error('할일 저장 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ========== 집중 기록 API ==========

// 집중 기록 조회
app.get('/api/focus-history', authMiddleware, async (req, res) => {
  try {
    await db.read();
    const history = db.data.focusHistory[req.user.id] || {};
    res.json(history);
  } catch (error) {
    console.error('집중 기록 조회 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 집중 기록 저장
app.post('/api/focus-history', authMiddleware, async (req, res) => {
  try {
    const { history } = req.body;
    await db.read();
    db.data.focusHistory[req.user.id] = history;

    // 통계 업데이트
    const totalFocusTime = Object.values(history).reduce((sum, minutes) => sum + minutes, 0);
    db.data.stats[req.user.id] = {
      totalFocusTime,
      totalSessions: Math.floor(totalFocusTime / 25),
      lastActive: new Date().toISOString()
    };

    await db.write();
    res.json({ message: '저장되었습니다' });
  } catch (error) {
    console.error('집중 기록 저장 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 집중 시간 업데이트
app.post('/api/focus-history/update', authMiddleware, async (req, res) => {
  try {
    const { date, minutes } = req.body;
    await db.read();

    if (!db.data.focusHistory[req.user.id]) {
      db.data.focusHistory[req.user.id] = {};
    }

    db.data.focusHistory[req.user.id][date] =
      (db.data.focusHistory[req.user.id][date] || 0) + minutes;

    // 통계 업데이트
    const history = db.data.focusHistory[req.user.id];
    const totalFocusTime = Object.values(history).reduce((sum, mins) => sum + mins, 0);
    db.data.stats[req.user.id] = {
      totalFocusTime,
      totalSessions: Math.floor(totalFocusTime / 25),
      lastActive: new Date().toISOString()
    };

    await db.write();
    res.json({ message: '저장되었습니다' });
  } catch (error) {
    console.error('집중 시간 업데이트 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ========== 시간대별 집중 기록 API ==========

// 시간대별 집중 기록 조회
app.get('/api/hourly-focus', authMiddleware, async (req, res) => {
  try {
    await db.read();
    const hourlyData = db.data.hourlyFocus[req.user.id] || {};
    res.json(hourlyData);
  } catch (error) {
    console.error('시간대별 집중 기록 조회 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 시간대별 집중 시간 업데이트
app.post('/api/hourly-focus/update', authMiddleware, async (req, res) => {
  try {
    const { date, hour, minutes } = req.body;

    if (typeof hour !== 'number' || hour < 0 || hour > 23) {
      return res.status(400).json({ error: '유효하지 않은 시간입니다 (0-23)' });
    }

    await db.read();

    if (!db.data.hourlyFocus[req.user.id]) {
      db.data.hourlyFocus[req.user.id] = {};
    }

    if (!db.data.hourlyFocus[req.user.id][date]) {
      db.data.hourlyFocus[req.user.id][date] = {};
    }

    // 해당 날짜의 해당 시간대에 집중 시간 누적
    const hourKey = hour.toString();
    db.data.hourlyFocus[req.user.id][date][hourKey] =
      (db.data.hourlyFocus[req.user.id][date][hourKey] || 0) + minutes;

    await db.write();
    res.json({ message: '시간대별 집중 시간이 업데이트되었습니다' });
  } catch (error) {
    console.error('시간대별 집중 시간 업데이트 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// ========== 관리자 API ==========

// 전체 회원 목록 및 통계
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.read();

    const users = db.data.users
      .filter(u => u.role === 'user')
      .map(u => ({
        id: u.id,
        username: u.username,
        createdAt: u.createdAt,
        stats: db.data.stats[u.id] || {
          totalFocusTime: 0,
          totalSessions: 0,
          lastActive: u.createdAt
        }
      }));

    res.json(users);
  } catch (error) {
    console.error('회원 목록 조회 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 전체 통계
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.read();

    const totalUsers = db.data.users.filter(u => u.role === 'user').length;
    const totalFocusTime = Object.values(db.data.stats).reduce(
      (sum, stat) => sum + (stat.totalFocusTime || 0),
      0
    );
    const totalSessions = Object.values(db.data.stats).reduce(
      (sum, stat) => sum + (stat.totalSessions || 0),
      0
    );

    res.json({
      totalUsers,
      totalFocusTime,
      totalSessions,
      averageFocusTimePerUser: totalUsers > 0 ? Math.round(totalFocusTime / totalUsers) : 0
    });
  } catch (error) {
    console.error('통계 조회 에러:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`
🚀 포모도로 집중 대시보드 백엔드 서버 실행 중
📡 포트: ${PORT}
🔐 관리자 계정: admin / admin1234
  `);
});
