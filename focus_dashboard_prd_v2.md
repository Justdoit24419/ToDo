

# 포모도로 집중 타이머 + 투두 + 히트맵 (미니 생산성 대시보드)
# 포모도로 집중 대시보드 PRD v3.0

## 1. 제품 개요
- 포모도로 타이머 + 주/보조작업 관리 + 집중 기록/통계 + 관리자 뷰가 결합된 생산성 웹앱.
- 프론트: React+Vite SPA, 백엔드: Express+LowDB(JSON) (포트 3001).
- 주작업/보조작업에 할당 시간·비중·날짜를 설정하고, 타이머 진행 시간을 실시간 반영. 통계 모달에서 전체/주/보조 진행률 확인.

## 2. 목표 & KPI
- 목표: 집중 시간 시각화, 작업 단위 시간 관리, 관리자/사용자 통계 제공.
- KPI: 타이머 정상완주 ≥ 99%, 날짜별 집중 기록 정확도 ±1초, 투두 저장 성공률 100%, 통계 뷰 로드 < 500ms.

## 3. 주요 사용자 & 시나리오
- 사용자: 프리랜서/개발자/학생 + 관리자 역할.
- 시나리오
  - A) 타이머 시작: 주작업/보조작업 선택 → 25분 완료 → 집중 기록/통계 갱신.
  - B) 작업 계획: 주작업에 할당시간, 날짜(시작/종료), 보조작업 비중/할당 입력 → 진행률 자동 계산.
  - C) 통계 확인: 통계 모달에서 전체/주/보조 할당·사용·남은 시간, 진행률 확인.
  - D) 관리자: 회원/통합 통계 조회(총 집중시간, 세션 수, 평균 등).

## 4. 화면/기능
- 타이머 패널: 원형 타이머, 프리셋(15/25/45/커스텀), 주/보조작업 선택, 알림.
- 할 일 목록(주작업 카드):
  - 뱃지: 날짜(시작~종료), 할당/사용/진행률 %, 보조작업 개수.
  - 액션: 할당시간 설정, 캘린더로 날짜 설정, 타이머 시작, 삭제.
- 보조작업:
  - 속성: 텍스트, 비중, (선택) 명시적 할당시간, 사용시간, 완료여부.
  - 자동 할당: 명시적 할당 없으면 주작업 할당×(비중/비중합)으로 계산.
  - 진행률: 사용/할당 기반, 실시간 타이머 반영.
- 통계 모달:
  - 전체 진행률/합계(할당·사용·남음), 기준일.
  - 주작업별 할당/사용/남음/진행률, 보조작업 개수.
  - 보조작업별 할당/사용/남음/진행률(실시간 타이머 반영).
- 데이터 관리: 로컬 백업/복원/초기화(로컬스토리지용).
- 관리자 대시보드: 사용자 목록, 집중 통계 집계(총/평균/세션 수).

## 5. 데이터 모델 (요약)
- User: {id, username, password(hash), role, createdAt}
- Todo(주작업): {id, text, allocatedTime, focusTime, startDate, endDate, completed, subtasks[]}
- Subtask: {id, text, weight, allocatedTime?, focusTime, completed}
- FocusHistory: { [YYYY-MM-DD]: minutes }
- Stats: { totalFocusTime, totalSessions, lastActive } per user

## 6. 동기화/로직
- 타이머 onTick/onComplete → 주/보조 focusTime 누적, /api/focus-history/update 호출.
- 타이머 시간 변경 → onUpdateAllocatedTime/onUpdateSubtaskAllocatedTime로 선택된 작업/보조작업 할당 반영.
- 보조작업 비중만 있을 때: 주작업 할당 변경 시 (할당×비중/비중합) 재계산 후 저장.
- 통계: 명시된 할당 우선, 없으면 비중 계산값 사용.

## 7. API (백엔드)
- /api/auth/login, /api/auth/register (JWT)
- /api/todos (GET/POST): 주/보조작업 전체 저장/조회
- /api/focus-history (GET/POST), /api/focus-history/update (POST)
- /api/admin/users, /api/admin/stats (admin only)

## 8. 비기능 요구사항
- JWT 비밀키/관리자 기본 비밀번호는 환경변수로 관리.
- LowDB 동시쓰기 위험 → 서비스 전환 시 DB로 교체 권장.
- 반응형 UI, 요청/저장 실패 시 사용자 알림.

## 9. 범위 외
- 멀티 디바이스 동기화, 클라우드 백업, 소셜 로그인, 푸시 알림(모바일).

