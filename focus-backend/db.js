import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcryptjs from 'bcryptjs';

const bcrypt = bcryptjs;

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

const adapter = new JSONFile(file);
const defaultData = {
  users: [],
  todos: {},
  focusHistory: {},
  hourlyFocus: {}, // 시간대별 집중 기록 추가
  stats: {}
};

const db = new Low(adapter, defaultData);

// 데이터베이스 초기화
export async function initDB() {
  await db.read();

  // DB 데이터 구조 확인 및 초기화
  if (!db.data) {
    db.data = defaultData;
  }

  // 각 필드가 없으면 초기화
  if (!db.data.users) db.data.users = [];
  if (!db.data.todos) db.data.todos = {};
  if (!db.data.focusHistory) db.data.focusHistory = {};
  if (!db.data.hourlyFocus) db.data.hourlyFocus = {};
  if (!db.data.stats) db.data.stats = {};

  // 기본 관리자 계정 생성 (비밀번호는 bcrypt로 해싱됨)
  if (!db.data.users.find(u => u.username === 'admin')) {
    const hashedPassword = await bcrypt.hash('admin1234', 10);

    db.data.users.push({
      id: 'admin-001',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    await db.write();
    console.log('✅ 관리자 계정 생성됨: admin / admin1234');
  }

  return db;
}

export { db };
