# wedding-zip — 싸이월드 미니홈피 감성 모바일 청첩장 빌더

- 작성일: 2026-06-03
- 소유자: 이창환 (사용자 = 첫 사용자 본인)
- 결혼식 데드라인: 2026-09 ~ 11
- 도메인(v1): `wedding-zip.vercel.app`
- 자매 프로젝트: insaengjip (`insaeng-zip.vercel.app`)

---

## 1. 한 줄 요약

> **싸이월드 미니홈피 감성을 살린 모바일 청첩장을 누구나 폼만 채워 만들 수 있는 SaaS.**
> 디자인 템플릿은 1개(테마 6종 큐레이션). 콘텐츠만 사용자별로 다름.

---

## 2. 배경 (Why)

- 사용자 본인 결혼식(2026-09~11) 청첩장 제작이 1차 목적
- 시중 청첩장 SaaS(메리미·해핀스 등)는 톤이 단조롭거나 디자인 자유도가 어색함
- **싸이월드 미니홈피 감성** — 한국 세대 모두에게 향수, 일촌평·BGM·다이어리 패턴이 청첩장과 잘 맞음
- 본인 청첩장 만들면서 **친구·지인에게 무료로 풀 수 있는 형태**로 자산화 (1년 비전 "에이전트 자산 10개")

---

## 3. 사용자 시나리오

### 3-1. 어드민 사용자 (청첩장 만드는 사람)
1. `wedding-zip.vercel.app` 방문 → "내 청첩장 만들기" 버튼
2. 이메일 + 비밀번호 가입 (가입 직후 자동 로그인 → 어드민 폼으로 이동)
3. 어드민 폼 **첫 항목 = 슬러그 지정** (예: `changhwan-jiyoung`)
   - 입력 즉시 비동기 중복 체크 (debounce 500ms)
   - 사용 불가 시 빨간 안내 + 대체 슬러그 자동 제안
4. 어드민 폼에 나머지 콘텐츠 입력:
   - 신랑·신부 이름, 양가 부모님 4명 (고인 표시 옵션), 결혼식 일시
   - 식장 정보 (이름·주소 → 카카오 지오코딩으로 위·경도 자동)
   - 사진 (메인 1장 + 갤러리 N장), BGM (최대 5곡 MP3)
   - 인사말·자기소개·우리 스토리·계좌번호
   - 테마 (6종 중 1개), 이름 구분 기호 (♡ 기본)
   - 섹션 ON/OFF 토글 (필수: 홈·오시는길 / 선택: 스토리·사진첩·일촌평·RSVP·마음전하기·프로필)
5. "공개하기" 버튼 → `/w/{슬러그}` 활성화
6. 결혼식 전까지 어드민에서 일촌평 모더레이션 + RSVP 응답 확인
7. 결혼식 D-7쯤 RSVP 명단 CSV 다운로드 (뒤풀이 인원 확정용)

### 3-2. 손님 (청첩장 보는 사람)
1. QR 또는 카톡 링크로 `/w/{슬러그}` 진입
2. **스플래시**: 메인 사진·이름·날짜·식장·짧은 인사말 모두 한 화면에. "청첩장 자세히 보기 ↓" 탭 시 BGM 시작 + 홈으로 페이드인
3. 하단 탭바로 탐색: 홈 / 스토리 / 사진첩 / 일촌평 / 더보기
4. 일촌평 남기기 (이름·메시지 입력, 로그인 불필요)
5. RSVP 응답 (뒤풀이 참석 여부·인원수)
6. 마음전하기 (계좌번호 복사)
7. 길찾기 (카카오맵 deep link로 식장 길안내)
8. 우상단 BGM 토글 + 카톡 공유 항상 노출

---

## 4. 스코프

### v1 포함
- 멀티테넌트 인증 (이메일+비밀번호, 1유저=1청첩장)
- 어드민 폼 — 모든 콘텐츠 필드 입력·수정
- 공개 청첩장 사이트 — 스플래시 + 5개 메인 탭 + 4개 서브 탭(더보기)
- 6종 테마 프리셋 (Ivory / Sage / Pink / Cobalt / Mocha / Ash)
- 사진·BGM 업로드 (Supabase Storage)
- 일촌평·RSVP (DB 저장)
- 카카오맵 (지도 + 길찾기 deep link)
- 카톡 공유 (Kakao SDK)
- 섹션 ON/OFF 토글

### v1 비포함 (의도적으로 제외 — YAGNI)
- 풀 컬러 피커 (프리셋만 v1)
- 폰트 선택 (Pretendard 고정)
- 커스텀 도메인 (vercel.app만)
- 결제·구독
- 미니룸 풀스케일 도트 일러스트
- 다국어
- 손님 본인 일촌평 직접 수정/삭제 (관리자 모더레이션만)
- 자동 백업 다운로드 (Supabase 7일 기본 백업만)
- SNS OAuth (카톡·구글 로그인)
- 결혼식 후 자동 잠금 (수동 진행)

### v2 후보 (실 사용 데이터 보고 결정)
- 컬러 피커
- 추가 테마
- JSON 백업 다운로드
- 손님 RSVP 수정
- 사용자 통계 대시보드

---

## 5. 시스템 아키텍처

```
[ 어드민 폼 (/admin) ]
       │
       │ insert/update
       ▼
[ Supabase ]
   ├─ Postgres: wedding_sites · guestbook · rsvp
   ├─ Storage:  wedding-photos · wedding-bgm
   └─ Auth:     email + password
       │
       │ read (RLS 적용)
       ▼
[ 공개 청첩장 사이트 (/w/{slug}) ]
   ↓
[ 손님 → 일촌평·RSVP insert ]
```

- 단일 Next.js 프로젝트가 어드민·공개 사이트 모두 처리
- 단일 Supabase 프로젝트가 모든 사용자 청첩장 데이터 보관
- RLS가 DB 레벨에서 사용자별 격리 강제

---

## 6. 데이터 모델

### 6-1. 테이블

**`wedding_sites`** (사용자 1명 = 1 row)
```
id              UUID PK
owner_id        UUID UNIQUE → auth.users  -- 1유저=1청첩장
slug            TEXT UNIQUE                -- URL용. /w/{slug}
groom_name      TEXT
bride_name      TEXT
parents         JSONB                      -- 양가 부모님 4명 + 고인 표시
wedding_at      TIMESTAMPTZ                -- 결혼식 일시
venue_name      TEXT
venue_address   TEXT
venue_lat       FLOAT
venue_lng       FLOAT
greeting        TEXT                       -- 인사말 본문
groom_profile   JSONB                      -- {mbti, intro, ...}
bride_profile   JSONB
story_items     JSONB[]                    -- [{date, title, body, photo_url}]
account_info    JSONB                      -- 신랑/신부 6개 계좌
main_photo_url  TEXT
gallery_urls    TEXT[]
bgm_tracks      JSONB[]                    -- 최대 5개 {order, url, title, artist}
theme           TEXT DEFAULT 'ivory'       -- 6개 프리셋
name_joiner     TEXT DEFAULT ' ♡ '         -- 이름 구분 기호
sections_enabled JSONB                     -- 각 섹션 on/off
published       BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

**`parents` JSONB 구조**
```json
{
  "groom_father": { "name": "이OO", "status": "alive" },
  "groom_mother": { "name": "김OO", "status": "alive" },
  "bride_father": { "name": "박OO", "status": "go" },
  "bride_mother": { "name": "최OO", "status": "alive" }
}
```
- `status`: `"alive"` | `"go"` (故) | `"hyeon"` (顯考/顯妣 — 성별 자동 매칭)

**공개 사이트 렌더링 예시** (홈 탭 양가 부모님 블록):
```
이OO · 김OO 의 장남 창환                   ← 양친 alive
故 박OO · 최OO 의 장녀 지영                ← 부 go
顯考 박OO · 顯妣 최OO 의 장녀 지영          ← 둘 다 hyeon
```
- `go` / `hyeon` 한자는 항상 `#8B5A3C` (warm brown) 적용
- 한자 + 이름 사이 반각 공백 1개

**`account_info` JSONB 구조**
```json
{
  "groom": {
    "self":   { "bank": "신한", "account": "...", "holder": "이창환" },
    "father": { "bank": "국민", "account": "...", "holder": "이OO" },
    "mother": null
  },
  "bride": { "self": {...}, "father": null, "mother": null }
}
```

**`sections_enabled` JSONB 구조**
```json
{
  "story": true,
  "gallery": true,
  "guestbook": true,
  "rsvp": true,
  "account": true,
  "profile": true
}
```
- `home`·`info(오시는길)`는 필수라 키 없음 (항상 ON)

**`guestbook`**
```
id          UUID PK
site_id     UUID → wedding_sites
guest_name  TEXT
message     TEXT  -- max 200자
created_at  TIMESTAMPTZ
```

**`rsvp`**
```
id          UUID PK
site_id     UUID → wedding_sites
guest_name  TEXT
phone       TEXT NULLABLE
attending   BOOLEAN
party_size  INT
message     TEXT NULLABLE
created_at  TIMESTAMPTZ
```

### 6-2. Storage 버킷
```
wedding-photos/
  {site_id}/
    main.jpg
    gallery/01.jpg, 02.jpg, ...

wedding-bgm/
  {site_id}/
    track1.mp3, track2.mp3, ...
```

### 6-3. RLS 정책 요약

| 테이블 | READ | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `wedding_sites` | 누구나 (단 `published=true`) | 본인만 | 본인만 | 본인만 |
| `guestbook` | 누구나 (해당 site) | 누구나 (rate limit 없음 v1) | — | site 소유자만 |
| `rsvp` | site 소유자만 | 누구나 | — | site 소유자만 |
| Storage `{site_id}/*` | 누구나 read | site 소유자만 | site 소유자만 | site 소유자만 |

---

## 7. URL 라우팅

```
/                       → 랜딩 ("내 청첩장 만들기")
/signup                 → 회원가입
/login                  → 로그인
/admin                  → 내 청첩장 편집
/admin/guestbook        → 일촌평 모더레이션
/admin/rsvp             → RSVP 응답 목록·CSV 다운로드
/w/{slug}               → 공개 청첩장 (스플래시)
/w/{slug}?tab=home      → 홈 탭
/w/{slug}?tab=story     → 스토리 탭
/w/{slug}?tab=gallery   → 사진첩 탭
/w/{slug}?tab=guestbook → 일촌평 탭
/w/{slug}?tab=info      → 더보기 (오시는길·RSVP·마음전하기·프로필)
```

- 탭 URL 분리 = 카톡 공유 시 특정 탭으로 바로 진입 가능
- 슬러그 중복 = 가입 시 실시간 체크 + DB UNIQUE

---

## 8. 공개 사이트 페이지 구조

### 8-1. 스플래시 `/w/{slug}`
- 메인 사진 + 이름(♡) + 결혼식 날짜·시간 + 식장 이름 + 짧은 인사말 + 카톡 공유 버튼(↗)
- 핵심 정보를 모두 한 화면에 노출 → 깊이 안 보는 손님도 정보 전달 완료
- "🎵 청첩장 자세히 보기 ↓" 버튼 탭 시:
  - BGM 1번 트랙 시작 (Web Audio)
  - 홈으로 페이드인 전환

### 8-2. 하단 탭바 5개
- 홈 (필수)
- 스토리 (sections_enabled.story = true 시)
- 사진첩 (sections_enabled.gallery = true 시)
- 일촌평 (sections_enabled.guestbook = true 시)
- 더보기 (오시는길 필수)
- OFF된 탭은 자동 숨김 → 남은 탭이 균등 분할

### 8-3. 우상단 상시 노출
- 🔊 / 🔇 BGM 토글
- ⏭ 다음 곡 (트랙 2개 이상일 때만)
- 📤 카톡 공유

### 8-4. 각 탭 내용
| 탭 | 핵심 컨텐츠 |
|---|---|
| 홈 | D-day pill / 메인 사진 / 이름 / 짧은 인사말 / 양가 부모님 (故 표시 적용) |
| 스토리 | 다이어리 타임라인 (날짜·점·텍스트·옵션 썸네일) |
| 사진첩 | 3열 그리드 → 풀스크린 라이트박스 + 좌우 스와이프 |
| 일촌평 | 이름+메시지 입력 → 즉시 위에 추가 (Supabase realtime subscribe) |
| 더보기 → 오시는길 | 카카오맵 임베드 / 주소 복사 / 길찾기(카카오맵 deep link) |
| 더보기 → RSVP | 폼: 이름·전화·참석·인원·메시지 → 감사 화면 |
| 더보기 → 마음전하기 | 신랑/신부 측 계좌 카드 (입력된 것만), 복사 버튼 |
| 더보기 → 프로필 | 신랑·신부 자기소개 (MBTI·간단 인트로) |

---

## 9. 핵심 인터랙션

### BGM 시스템
- 진입 = 스플래시 CTA 탭 한 번 = 자동재생 정책 통과
- HTML5 `<audio>` element. 1번 트랙 시작 → `ended` 이벤트로 다음 트랙. 마지막 트랙 끝나면 1번으로 loop
- 곡 사이 2초 페이드 (fade-out + fade-in)
- 우상단 토글: BGM 안 켜진 상태 첫 3초간 1.8초 주기 펄스 → 클릭 또는 3초 후 멈춤
- 페이지 이동 중에도 오디오 유지 (Next.js client-side navigation)

### 일촌평
- 폼: 이름(필수) + 메시지(필수, 200자 제한)
- 제출 → Supabase INSERT → 응답 받은 row를 리스트 최상단에 즉시 prepend
- Supabase Realtime: 다른 손님이 글 남기면 폴링 없이 즉시 리스트 갱신
- 어드민(소유자)만 각 row 우측 "삭제" 버튼 노출

### 사진첩 라이트박스
- 3열 그리드 (1:1 비율 썸네일)
- 탭 시 풀스크린 모달
- 좌우 스와이프 (touch) + 화살표 키 (데스크탑)
- 모달 외부 탭 또는 X 버튼으로 닫기

### 오시는길
- **지도 = 카카오맵 SDK 임베드** (1핀)
- 핀 탭 시 식장 이름 말풍선
- "📋 주소 복사" → clipboard API → "복사됨" 토스트 1초
- "🚗 길찾기" → **네이버지도 deep link** (한국 사용자 가장 익숙)
  - 앱: `nmap://route/public?dlat={lat}&dlng={lng}&dname={URL-encoded 식장명}&appname=wedding-zip`
  - 웹 fallback: `https://map.naver.com/v5/directions/-/-/-/{lng},{lat},{name},,/public`
  - 네이버 SDK 추가 가입 X. URL 한 줄만 변경 — 카카오 지도 SDK는 그대로 사용

### RSVP
- 폼 제출 → INSERT → "참석 알려주셔서 감사합니다" 감사 화면
- 손님 본인이 자기 응답 다시 못 봄 (단순화)
- 수정 = 동일 폼 재제출 (DB는 가장 최근 응답만 의미 있음)

### 마음전하기
- 입력된 계좌만 카드로 표시 (null 자동 숨김)
- 카드 클릭 시 계좌번호 자동 복사 + "복사됨" 토스트

### 카톡 공유
- 우상단 📤 버튼 → Kakao SDK shareLink
- 미리보기: 메인 사진 + "{이름} 결혼식에 초대합니다" + 날짜
- 공유 URL은 현재 탭 URL (탭별 직접 진입 가능)

---

## 10. 디자인 시스템

### 10-1. 테마 프리셋 (6종)

| 키 | 이름 | bg | ink | accent |
|---|---|---|---|---|
| `ivory` | 🪶 Ivory Mono (기본) | #FBF7F0 | #1A1A1A | #8B5A3C |
| `sage` | 🌿 Sage Green | #F4F1EA | #2C3D2E | #6E8B6F |
| `pink` | 🌸 Dusty Pink | #FBF5F2 | #4A3032 | #C19090 |
| `cobalt` | 🔵 Cobalt Navy | #F2F4F8 | #1B2742 | #4567A5 |
| `mocha` | ☕ Mocha | #F5F0E8 | #3D2A1F | #8B5A3C |
| `ash` | 🌫 Ash Mono | #F4F3F0 | #2A2A2A | #6B6B6B |

각 테마는 6단계 모노톤(bg/surface/border/muted/secondary/ink) + accent 1색.

**故/顯考/顯妣 한자 색상은 모든 테마에서 `#8B5A3C` 고정**. 의미(고인을 기리는 그리움 톤)가 테마 변경과 무관해야 하므로 일관성 유지.

### 10-2. 타이포그래피
- 폰트: **Pretendard** 단일 (한·영·숫자)
- Fallback: -apple-system, "Segoe UI", "Noto Sans KR"
- 위계: 32/600 (H1), 18/600 (H2), 15/400 (본문), 13/400 (보조), 12/500 (라벨, letter-spacing 2px)

### 10-3. 여백
- 4px 기본 단위
- 사용 가능: 8 / 12 / 16 / 24 / 32 / 48만
- 임의 값 금지

### 10-4. 컴포넌트
- 버튼 primary: bg=ink, radius 22px(pill)
- 버튼 secondary: 1px border ink, transparent
- 버튼 ghost: text only
- 카드: bg surface, 1px border, radius 8px, shadow 0 4px 14px rgba(0,0,0,0.05)
- 입력칸: bg=#FAF8F1, 1px border, radius 4px
- D-day pill: bg=ink, color=bg, radius 12px, letter-spacing 1.5px

### 10-5. 싸이 영감 디테일
- 일촌평 카드 = 싸이 게시판 톤 (흰 카드 + 옅은 그림자)
- 스토리 타임라인 도트 (싸이 다이어리 좌측 날짜 점)
- BGM 토글 첫 진입 펄스 (1.8초 주기, 3초 후 멈춤)

### 10-6. 이름 구분 기호
- 기본: `♡` (사용자가 폼에서 변경 가능)
- 옵션: `·` / `♡` / `&` / 공백

---

## 11. 기술 스택

| 영역 | 도구 | 비용 |
|---|---|---|
| 프레임워크 | Next.js 14+ (App Router) | 무료 |
| 백엔드 | Supabase (Postgres + Auth + Storage + Realtime) | 무료 (500MB DB / 1GB Storage) |
| 호스팅 | Vercel Hobby | 무료 |
| 지도 표시 | 카카오맵 SDK | 무료 (월 30만 호출) |
| 길찾기 deep link | 네이버지도 URL scheme (SDK 불필요) | 무료 |
| 공유 | Kakao Share SDK | 무료 |
| 도메인 | wedding-zip.vercel.app | 무료 |
| 코드 저장소 | GitHub (private) | 무료 |
| 폰트 | Pretendard (CDN 또는 self-host) | 무료 (오픈소스) |

### 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # 서버 전용 (관리자 작업)
NEXT_PUBLIC_KAKAO_MAP_KEY        # JavaScript 키
NEXT_PUBLIC_KAKAO_SHARE_KEY      # JavaScript 키 (동일 키 가능)
NEXT_PUBLIC_SITE_URL             # https://wedding-zip.vercel.app
```

---

## 12. 어드민 폼 — 전체 필드 목록

| 섹션 | 필드 | 타입 | 필수 |
|---|---|---|---|
| 기본 정보 | 슬러그 | TEXT (중복 체크) | ✓ |
| 기본 정보 | 신랑 이름·신부 이름 | TEXT × 2 | ✓ |
| 기본 정보 | 결혼식 날짜·시간 | DATETIME | ✓ |
| 기본 정보 | 이름 구분 기호 | SELECT (·/♡/&/공백) | (기본 ♡) |
| 양가 부모님 | 신랑 아버지·어머니 / 신부 아버지·어머니 | 각 {이름, 고인표시(없음/故/顯)} | (옵션) |
| 식장 | 식장 이름·주소 | TEXT × 2 | ✓ |
| 식장 | 위·경도 | 자동 (카카오 지오코딩) | 자동 |
| 사진 | 메인 사진 | IMAGE | ✓ |
| 사진 | 갤러리 (N장) | IMAGE[] | (옵션) |
| BGM | 트랙 (최대 5개) | {파일, 제목, 아티스트} × 5 | (옵션) |
| 콘텐츠 | 인사말 | TEXTAREA | ✓ |
| 콘텐츠 | 신랑·신부 자기소개 (각) | JSONB {mbti, intro} | (옵션) |
| 콘텐츠 | 우리 스토리 (N개) | [{날짜, 제목, 본문, 사진}] | (옵션) |
| 계좌 | 신랑측 본인·아버지·어머니 | 각 {은행, 계좌, 예금주} | (옵션) |
| 계좌 | 신부측 본인·아버지·어머니 | 각 {은행, 계좌, 예금주} | (옵션) |
| 개인화 | 테마 | SELECT (6종) | (기본 ivory) |
| 개인화 | 섹션 ON/OFF | TOGGLE × 6 | (모두 기본 ON) |
| 발행 | 공개하기 | BUTTON | — |

---

## 13. 배포 흐름

1. GitHub repo 생성 (private)
2. Supabase 프로젝트 새로 생성
3. SQL 마이그레이션 실행 (테이블 3개 + RLS + Storage 버킷 2개)
4. Kakao Developers 앱 등록 + JS 키 발급 + 도메인 등록
5. Vercel 프로젝트 연결 + 환경 변수 설정
6. main 브랜치 push → 자동 배포
7. `wedding-zip.vercel.app` 활성

---

## 14. 운영

### 모더레이션
- 일촌평 v1엔 rate limit 없음 (한국 청첩장은 영어 스팸 거의 안 옴)
- 스팸 들어오면 어드민(소유자)이 손으로 삭제
- v2 후보: rate limit (1분에 1글), 욕설 필터

### RSVP 명단 추출
- 어드민에서 CSV 다운로드 버튼 → 이름·전화·참석·인원·메시지·응답시각 컬럼

### 백업
- Supabase 자동 백업: 무료는 7일 보관 (Pro는 30일)
- v1.5 후보: 어드민에서 "내 청첩장 전체 JSON 다운로드" 버튼

### 결혼식 후
- 청첩장 사이트 그대로 유지 (추억)
- 일촌평·RSVP를 어드민에서 "잠금" 토글로 읽기 전용 전환 (v1.5)

### 모니터링
- Vercel Analytics (무료) — 페이지 뷰
- 에러는 Vercel 로그 직접 확인 (Sentry는 v2 후보)

---

## 15. 비용 예상

| 구간 | 사용자 | 월 합계 |
|---|---|---|
| v1 베타 (1~5명) | 본인 + 친구 2~3명 | **0원** |
| 입소문 (10~30명) | 친구의 친구 | **0원** (무료 한도 내) |
| 확장 (50~100명) | SNS 입소문 | Supabase Pro $25 ≈ 3만원/월 |
| 본격 (300~500명) | 검색·광고 | + Vercel Pro $20 ≈ 6만원/월 |

→ 결혼식 끝나기 전까지는 0원으로 운영 가능

---

## 16. 보류 / 추후 결정

- 노래 트랙 5개 초과 허용? → v2
- 사용자가 자기 도메인 연결 가능? → v2
- 결제 (프리미엄 테마·무제한 BGM 등)? → 베타 사용자 5명 이상 + 명확한 차별화 가치 확인 후
- 카톡 로그인 / 구글 OAuth? → 베타 피드백 보고
- 결혼식 후 사이트 자동 잠금 정책? → 운영하며 결정

---

## 17. 다음 단계

이 spec → `writing-plans` 스킬로 **구현 계획(implementation plan)** 작성 → 실제 코딩 시작.

구현 계획에서 다룰 내용:
- 단계별 작업 분해 (스캐폴드 / DB 마이그레이션 / 인증 / 공개 사이트 / 어드민 폼 / 외부 SDK / 배포)
- 각 단계의 검증 방법 (TDD 적용 위치)
- 의존성 순서
- 예상 작업 시간
