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
- `/boards/[category]` 카테고리 목록 + 검색/정렬
- `/posts/[id]` 상세 + 채팅 시작 + 신고
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
- `POST /api/chats/start`
- `GET /api/reports`
- `POST /api/reports`
- `PATCH /api/reports/[id]/resolve`

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

`/write` page now requires `promotion_until` when `is_promoted` is enabled, so promoted listing behavior is consistent with backend filters.

## Supabase Migration Path

1. Keep `src/domain/types.ts` and `src/domain/repositories.ts` unchanged.
2. Implement Supabase repositories matching the same interfaces.
3. Replace repository binding in one place (`src/server/mockApiSingleton.ts` equivalent composition root).
4. Keep pages and API route shapes unchanged.
