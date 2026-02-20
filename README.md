# CampuList Prototype (Supabase-free stage)

KAIST 대전 본원 파일럿용 CampuList 시제품입니다.  
현재는 Supabase 연결 없이 Mock Repository + Next.js App Router로 동작합니다.

## Goals

- 게시판 중심 시제품 흐름 검증: 목록, 상세, 글쓰기
- 최소 운영 기능 검증: 채팅 시작, 신고 접수
- Supabase 전환 시 데이터/권한 모델을 그대로 재사용

## Implemented Pages

- `/` 홈
- `/login` 목업 로그인(역할 전환)
- `/boards/[category]` 카테고리 목록 + 검색/정렬 + 페이지네이션
- `/posts/[id]` 상세 + 채팅 시작 + 신고 접수
- `/chats` 내 채팅 목록
- `/chats/[id]` 채팅 메시지 조회/전송 + 5초 자동 폴링 + 수동 새로고침
- `/me/posts` 내 게시글 관리(상태 변경/삭제)
- `/admin/reports` 신고 관리(관리자 처리)
- `/write` 글쓰기

## Implemented APIs

- `GET /api/session`
- `POST /api/session/mock-login`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/[id]`
- `PATCH /api/posts/[id]`
- `DELETE /api/posts/[id]`
- `POST /api/posts/[id]/promote`
- `GET /api/chats`
- `POST /api/chats/start`
- `GET /api/chats/[id]/messages`
- `POST /api/chats/[id]/messages`
- `GET /api/reports`
- `POST /api/reports`
- `PATCH /api/reports/[id]/resolve`
- `GET /api/health`

## Tech Structure

```txt
app/
  api/
  boards/[category]/page.tsx
  login/page.tsx
  posts/[id]/page.tsx
  write/page.tsx
  page.tsx
src/
  domain/
  mock/
  server/
  supabase/
sql/
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:6001`

## Supabase Prep (already added)

- Env template: `.env.example`
- SQL draft:
  - `sql/001_init.sql`
  - `sql/002_policies.sql`
- Repository skeleton:
  - `src/supabase/repositories.ts`
  - `src/supabase/env.ts`
- Provider safety:
  - `DATA_PROVIDER=supabase`로 설정되어도 준비가 완료되지 않으면 자동으로 mock provider로 폴백
  - `SUPABASE_REPOSITORY_READY=true`를 켜기 전까지는 supabase provider를 실제로 사용하지 않음
  - `/api/health`에서 현재 선택 provider / 실제 사용 provider / 폴백 사유 확인 가능

`/write` page now requires `promotion_until` when `is_promoted` is enabled, so promoted listing behavior is consistent with backend filters.

Post status updates now apply an explicit transition matrix (non-admin):
- `active -> reserved/closed`
- `reserved -> active/closed`
- `closed -> active`

Post visibility policy (non-admin):
- `hidden` is never visible
- `draft` is visible only to the author
- `active/reserved/closed` are visible within same campus

## Supabase Migration Path

1. Keep `src/domain/types.ts` and `src/domain/repositories.ts` unchanged.
2. Implement Supabase repositories matching the same interfaces.
3. Replace repository binding in one place (`src/server/mockApiSingleton.ts` equivalent composition root).
4. Keep pages and API route shapes unchanged.

## Query Params (shared parser)

- `src/server/params.ts` now provides shared parsing for:
  - pagination (`page`, `limit`, `offset`)
  - boolean flags (`promoted_only`, `include_hidden`)
  - search alias (`search` or `q`)
- API routes use these helpers so query contracts stay stable when replacing mock repository with Supabase repository.
