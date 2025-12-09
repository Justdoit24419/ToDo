# 포모도로 집중 대시보드

## 개요
- React + Vite 기반 포모도로/할 일/집중 기록 대시보드
- 로컬 백엔드(Express + LowDB, 포트 3001)와 연동: 인증, 투두/보조작업, 집중 기록, 관리자 통계
- 주작업/보조작업에 할당 시간·비중·날짜를 설정하고, 타이머 진행 시간을 실시간 반영
- 통계 모달에서 주작업/보조작업별 할당·사용·남은 시간과 진행률, 전체 진행률을 확인

## 주요 기능 (프론트)
- 포모도로 타이머: 15/25/45/커스텀 분, 주작업/보조작업 선택, 알림, 실시간 경과 onTick/onComplete
- 주작업 관리: 할당 시간, 사용 시간, 진행률, 보조작업 개수, 날짜 뱃지 표시 및 캘린더로 수정
- 보조작업 관리: 비중/할당 시간/사용 시간, 진행률, 할당 자동계산(주작업 할당×비중 합 비례)
- 데이터 관리: 백업/복원/초기화 (로컬스토리지용)
- 관리자 대시보드: 사용자/통계 조회 (admin/admin1234)

## 주요 기능 (백엔드)
- 인증: 회원가입/로그인(JWT), admin 계정 기본 생성
- 투두/보조작업, 집중 기록 CRUD, 통계 API, 관리자 전용 목록/합산 통계
- LowDB(JSON) 스토리지, bcrypt 비밀번호 해싱, CORS

## 데이터 흐름/동기화
- 타이머 → useTimer → onTick/onComplete: 주작업·보조작업 focusTime 누적, 백엔드 updateFocusTime 호출
- 타이머 시간 변경 → onUpdateAllocatedTime/onUpdateSubtaskAllocatedTime: 선택된 주작업/보조작업 할당시간 자동 반영
- 비중만 입력된 보조작업: 주작업 할당이 변하면 (할당×비중/비중합)으로 즉시 재계산하여 저장
- TaskStatistics: 명시된 할당 우선, 없으면 비중 계산값 사용. 전체/작업/보조작업의 할당·사용·남은 시간, 진행률 표시

## 핵심 파일
- src/components/Timer/PomodoroTimer.jsx: 타이머 UI, 주/보조작업 선택, 프리셋 변경 시 할당 반영
- src/hooks/useTimer.js: 타이머 상태, onTick/onComplete 콜백, 실시간 집중 기록 업데이트
- src/hooks/useTodos.js: 주작업/보조작업 CRUD, 할당/비중 재계산 로직, 집중 시간 누적
- src/components/Todo/TodoItem.jsx: 주작업 뱃지(날짜, 할당, 사용, 진행률, 보조 개수), 날짜 설정 버튼, 보조작업 진행률/편집
- src/components/Todo/TaskStatistics.jsx: 통계 모달(전체 진행률 + 주/보조작업 세부 내역)
- src/utils/api.js: 백엔드 REST 호출(할일, 집중 기록 업데이트)
- focus-backend/server.js: 인증/투두/집중 기록/관리자 API, LowDB persistence

## 사용 방법
1) 백엔드: `cd focus-backend && npm install && npm start` (포트 3001)
2) 프론트: `cd focus-dashboard && npm install && npm run dev` (기본 포트 5173)
3) 로그인: admin/admin1234 또는 회원가입 후 로그인
4) 주작업 추가 → 할당 시간/날짜/보조작업 설정 → 타이머에서 주작업/보조작업 선택 후 시작
5) 통계 버튼으로 전체/주/보조 진행률·시간 확인

## 주의/개선 아이디어
- JWT 시크릿/관리자 비밀번호는 환경변수로 교체 필요
- LowDB 파일 동시쓰기 보호 없음 → 실제 서비스 시 DB로 교체 권장
- 백업/복원은 로컬스토리지 데이터 기준; 서버 데이터 백업은 별도 구현 필요

                   [사용자 브라우저]
                           |
                           v
                 ┌────────────────────┐
                 │  React 프론트엔드  │
                 │ (focus-dashboard)  │
                 ├────────────────────┤
                 │ Pages: Dashboard,  │
                 │        DataMgmt,   │
                 │        Admin       │
                 │ Components:        │
                 │  - Timer           │
                 │  - Todo/보조작업   │
                 │  - 통계 모달       │
                 │ Hooks: useTimer,   │
                 │        useTodos,   │
                 │        useFocusHist│
                 └─────────┬──────────┘
                           |
             REST API (fetch, localStorage token)
                           |
                           v
               ┌───────────────────────┐
               │   Express 백엔드      │
               │  (focus-backend)      │
               ├───────────────────────┤
               │ Routes:               │
               │  - /api/auth (login,  │
               │     register, JWT)    │
               │  - /api/todos         │
               │  - /api/focus-history │
               │  - /api/admin/*       │
               │ Middleware: auth,     │
               │ admin check           │
               └──────────┬────────────┘
                          |
                          v
               ┌───────────────────────┐
               │   LowDB (JSON File)   │
               │  db.json              │
               │  users, todos,        │
               │  focusHistory, stats  │
               └───────────────────────┘

[데이터 흐름 요약]
- 프론트 useTimer → onTick/onComplete → /api/focus-history/update → stats 갱신
- 프론트 useTodos → add/toggle/delete/update → /api/todos (주/보조작업, 할당/비중)
- 통계 모달 → /api/focus-history, /api/todos 데이터로 합산 표시
- 관리자 대시보드 → /api/admin/users, /api/admin/stats

[상태/동기화]
- JWT 토큰: localStorage 저장 후 fetch 헤더 Authorization: Bearer
- 타이머 시간 변경: 선택된 주/보조작업 할당시간 자동 반영 (프론트 상태 + 백엔드 동기화)
- 비중 기반 보조작업 할당: 주작업 할당×비중합 비례로 재계산, 명시값 우선
- 집중 시간: useTimer onTick/onComplete → focusTime 누적, stats 업데이트


1) API 스펙 (요약)
인증
POST /api/auth/register
req: { username, password }
res: { message, userId }
POST /api/auth/login
req: { username, password }
res: { token, user: {id, username, role} }
인증 헤더: Authorization: Bearer <token>
투두/보조작업
GET /api/todos
res: [{ id, text, allocatedTime, focusTime, startDate, endDate, completed, subtasks: [{id, text, weight, allocatedTime?, focusTime, completed}] }]
POST /api/todos
req: { todos: [...] } (전체 저장)
집중 기록
GET /api/focus-history
res: { "YYYY-MM-DD": minutes, ... }
POST /api/focus-history
req: { history: { "YYYY-MM-DD": minutes, ... } } (덮어쓰기)
POST /api/focus-history/update
req: { date: "YYYY-MM-DD", minutes }
res: { message }
관리자
GET /api/admin/users
res: [{ id, username, createdAt, stats: { totalFocusTime, totalSessions, lastActive } }]
GET /api/admin/stats
res: { totalUsers, totalFocusTime, totalSessions, averageFocusTimePerUser }

2) 상태 모델 (프론트/백엔드 공통 개념)
type Subtask = {
  id: string;
  text: string;
  weight: number;          // 비중(%)
  allocatedTime?: number;  // 명시적 할당(분), 없으면 주작업 할당×(weight/비중합)
  focusTime: number;       // 사용 누적(분)
  completed: boolean;
};

type Todo = {
  id: string;
  text: string;
  allocatedTime: number;   // 주작업 할당(분)
  focusTime: number;       // 주작업 사용 누적(분)
  startDate?: string;      // YYYY-MM-DD
  endDate?: string;        // YYYY-MM-DD
  completed: boolean;
  subtasks: Subtask[];
};

type FocusHistory = { [date: string]: number }; // 일자별 사용(분)
type Stats = { totalFocusTime: number; totalSessions: number; lastActive: ISOString };

3) 로직/계산 규칙
보조작업 할당 재계산
주작업 할당 변경 시, 명시적 allocatedTime이 없는 보조작업에 대해:
sub.allocatedTime = round(parentAllocated * sub.weight / sum(weights without explicit alloc))
명시적 allocatedTime이 있는 보조작업은 그대로 유지.
진행률 표시
주작업 진행률: min(100, round((todo.focusTime / todo.allocatedTime) * 100)) (할당 0이면 0%)
보조작업 진행률: 명시적/계산된 sub.allocatedTime 기준 동일.
타이머 → 시간 누적
onTick(todoId, subtaskId, elapsedSeconds):
UI 실시간 표시용: 경과 분을 현재 세션에 더해 뱃지/통계에 반영
onComplete(todoId, subtaskId, completedMinutes):
todo.focusTime += completedMinutes
(선택) subtask.focusTime += completedMinutes
/api/focus-history/update(date, completedMinutes)
stats: totalFocusTime += completedMinutes, totalSessions = floor(totalFocusTime / 25)
날짜/캘린더
주작업에 startDate/endDate 입력; 표시: 📅 start ~ end (둘 중 하나만 있으면 있는 값만 노출).
UI: 주작업 카드에서 캘린더 버튼으로 date picker 토글.

4) 타이머→집중기록→통계 흐름도 (텍스트)
[타이머 UI] --onTick--> (프론트 상태: 현재 세션 경과분 반영)
    | 
    --onComplete(minutes)--> useTodos.updateTodoFocusTime(todoId, minutes, subtaskId)
                              |
                              +--> 백엔드 /api/focus-history/update (date, minutes)
                              |
                              +--> 프론트 상태 todo/subtask focusTime 누적
                              |
                              +--> 통계 모달: 할당/사용/남은/진행률 재계산

5) 문서에 추가하면 좋은 표 (예시)
API 테이블: 경로, 메서드, req/res, 인증 필요 여부.
필드 사전: allocatedTime(분), weight(%), focusTime(분), startDate/endDate(YYYY-MM-DD).
계산 예시:
주작업 할당 240분, 보조작업 weight 13%, 7% (명시 없음) → 합 20% → 보조1=240*(13/20)=156분, 보조2=84분.
타이머 10분 사용 → 해당 보조 focusTime +=10 → 진행률 10/156≈6%.
