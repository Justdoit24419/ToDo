# 로컬 서버 터널링 설정 가이드

노션에 로컬 개발 서버를 임베딩하기 위한 터널링 설정 방법입니다.

## 설치

```bash
npm install -g localtunnel
```

## 서버 실행

### 1. 백엔드 서버 실행
```bash
cd focus-backend
npm start
# 포트 3001에서 실행됨
```

### 2. 프론트엔드 서버 실행
```bash
cd focus-dashboard
npm run dev
# 포트 5173에서 실행됨
```

## 터널링 실행

### 백엔드 터널 생성
```bash
lt --port 3001 --subdomain focus-api
# URL: https://focus-api.loca.lt
```

### 프론트엔드 터널 생성
```bash
lt --port 5173
# URL: https://[랜덤문자열].loca.lt
```

## 환경 변수 설정

### focus-dashboard/.env 파일
```env
VITE_API_URL=https://focus-api.loca.lt/api
```

백엔드 터널 URL이 변경되면 이 파일도 수정해야 합니다.

## 프론트엔드 재시작

환경 변수 변경 후 프론트엔드를 재시작해야 합니다:
```bash
# 기존 서버 종료 (Ctrl+C)
npm run dev
```

## 노션에 임베딩하기

1. 노션 페이지에서 `/embed` 입력
2. 프론트엔드 터널 URL 붙여넣기 (예: `https://public-readers-rescue.loca.lt`)
3. Enter 클릭

### 첫 접속 시 주의사항

localtunnel은 보안을 위해 첫 접속 시 경고 페이지를 표시합니다:
1. "Click to Continue" 버튼 클릭
2. IP 주소 확인 후 계속 진행

## 주의사항

### URL 변경
- 터널을 재시작하면 URL이 변경됩니다 (--subdomain 옵션 없이 실행한 경우)
- 고정 subdomain을 사용하려면 `--subdomain` 옵션 사용

### 터널 유지
- 터널은 컴퓨터가 켜져있고 터널 프로세스가 실행 중일 때만 작동합니다
- 컴퓨터를 종료하거나 터널을 닫으면 노션 임베딩이 작동하지 않습니다

### 대안 (영구 배포)

테스트용으로는 localtunnel이 적합하지만, 프로덕션에서는 실제 배포를 권장합니다:

**프론트엔드:**
- Vercel (무료)
- Netlify (무료)
- GitHub Pages

**백엔드:**
- Railway (무료)
- Render (무료)
- Fly.io (무료)

## 현재 설정

### 로컬 URL
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

### 공개 URL (예시)
- 프론트엔드: https://public-readers-rescue.loca.lt
- 백엔드: https://focus-api.loca.lt

### 관리자 계정
- 아이디: admin
- 비밀번호: admin1234

## 트러블슈팅

### "connection refused" 에러
방화벽 설정을 확인하거나 터널을 재시작하세요.

### 백엔드 연결 실패
1. `.env` 파일의 `VITE_API_URL`이 올바른지 확인
2. 백엔드 터널이 실행 중인지 확인
3. 프론트엔드를 재시작했는지 확인

### 노션 임베딩이 안 보임
1. 터널 URL이 유효한지 브라우저에서 직접 접속해보기
2. localtunnel 경고 페이지를 통과했는지 확인
3. 터널이 실행 중인지 확인
