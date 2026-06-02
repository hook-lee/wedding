# wedding-zip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-tenant mobile wedding invitation SaaS with Cyworld minihompy vibe. Users sign up, fill content form, get a public site at `/w/{slug}` rendered from a single template themed by their preset choice.

**Architecture:** Next.js 14 App Router (single project handles both admin and public site). Supabase for Postgres + Auth + Storage + Realtime. RLS for multi-tenant isolation. Vercel Hobby for hosting. Kakao Map SDK for the venue map, Naver maps deep link for directions, Kakao Share SDK for KakaoTalk sharing.

**Tech Stack:**
- Next.js 14+ (App Router, Server Components)
- TypeScript (strict mode)
- Supabase (Postgres, Auth, Storage, Realtime)
- Tailwind CSS (with CSS variables for theming)
- Pretendard font
- Vitest + Testing Library for unit tests
- Playwright for E2E smoke tests
- Vercel for hosting
- pnpm (or npm) for package management

**Reference spec:** `docs/superpowers/specs/2026-06-03-wedding-zip-design.md`

**Working tree:** GitHub repo `hook-lee/wedding`. Clone locally before starting Phase 0.

---

## Phase 0 — Foundation (스캐폴드 + 첫 배포)

Goal: empty Next.js app, lives at `wedding-zip.vercel.app`, basic typography and color tokens in place.

### Task 0.1: Clone repo and scaffold Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `README.md`

- [ ] **Step 1: Clone the empty repo**

```bash
cd C:\Users\leech\dev
git clone https://github.com/hook-lee/wedding.git wedding
cd wedding
```

- [ ] **Step 2: Scaffold Next.js with TypeScript + Tailwind**

```bash
pnpm create next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*" --use-pnpm
```

Answer prompts:
- ESLint: Yes
- `src/` directory: No
- App Router: Yes
- Turbopack: No

- [ ] **Step 3: Verify dev server runs**

```bash
pnpm dev
```

Expected output: `Local: http://localhost:3000` and page renders.
Stop server with Ctrl+C.

- [ ] **Step 4: Commit scaffold**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript and Tailwind"
git push origin main
```

---

### Task 0.2: Install Pretendard font and base CSS tokens

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Install Pretendard via npm**

```bash
pnpm add pretendard
```

- [ ] **Step 2: Create `app/fonts.ts`**

```typescript
import localFont from "next/font/local";

export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "wedding-zip",
  description: "싸이월드 미니홈피 감성 모바일 청첩장",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-bg text-ink font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Replace `app/globals.css` with theme CSS variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root,
[data-theme="ivory"] {
  --color-bg: #FBF7F0;
  --color-surface: #FFFFFF;
  --color-border: #EAE6DC;
  --color-muted: #888888;
  --color-secondary: #555555;
  --color-ink: #1A1A1A;
  --color-accent: #8B5A3C;
}

[data-theme="sage"] {
  --color-bg: #F4F1EA; --color-surface: #FFFFFF; --color-border: #DCD8C8;
  --color-muted: #8A8A78; --color-secondary: #5A6A5A; --color-ink: #2C3D2E; --color-accent: #6E8B6F;
}
[data-theme="pink"] {
  --color-bg: #FBF5F2; --color-surface: #FFFFFF; --color-border: #ECE0D8;
  --color-muted: #A08A88; --color-secondary: #6A5052; --color-ink: #4A3032; --color-accent: #C19090;
}
[data-theme="cobalt"] {
  --color-bg: #F2F4F8; --color-surface: #FFFFFF; --color-border: #DCE0EA;
  --color-muted: #8088A0; --color-secondary: #485068; --color-ink: #1B2742; --color-accent: #4567A5;
}
[data-theme="mocha"] {
  --color-bg: #F5F0E8; --color-surface: #FFFFFF; --color-border: #E0D8C8;
  --color-muted: #908072; --color-secondary: #5A4838; --color-ink: #3D2A1F; --color-accent: #8B5A3C;
}
[data-theme="ash"] {
  --color-bg: #F4F3F0; --color-surface: #FFFFFF; --color-border: #DCDCD8;
  --color-muted: #888888; --color-secondary: #555555; --color-ink: #2A2A2A; --color-accent: #6B6B6B;
}

/* fixed warm brown for 故/顯考/顯妣 across all themes */
.text-deceased { color: #8B5A3C; }
```

- [ ] **Step 5: Update `tailwind.config.ts` to use CSS variables**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        secondary: "var(--color-secondary)",
        ink: "var(--color-ink)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "system-ui", "sans-serif"],
      },
      spacing: { "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px" },
      borderRadius: { sm: "4px", md: "8px", lg: "12px", pill: "22px" },
      boxShadow: { card: "0 4px 14px rgba(0,0,0,0.05)" },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Replace `app/page.tsx` with placeholder landing**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">wedding-zip</h1>
      <p className="text-secondary">싸이월드 미니홈피 감성 모바일 청첩장</p>
      <p className="text-muted text-sm">곧 만나요 ✨</p>
    </main>
  );
}
```

- [ ] **Step 7: Verify and commit**

```bash
pnpm dev
# visit http://localhost:3000 - confirm ivory background, dark text, Pretendard font
```

Stop server (Ctrl+C).

```bash
git add -A
git commit -m "feat: add Pretendard font, theme CSS variables, Tailwind tokens"
git push
```

---

### Task 0.3: Deploy to Vercel and verify live URL

**Files:** (no code; configuration in Vercel UI)

- [ ] **Step 1: Sign up / log in to Vercel**

Go to https://vercel.com/, log in with GitHub.

- [ ] **Step 2: Import `hook-lee/wedding` repo**

Click "Add New… → Project". Select `hook-lee/wedding`. Keep default settings (framework auto-detect = Next.js).

- [ ] **Step 3: Change project name to `wedding-zip`**

In the project name field, enter `wedding-zip`. This sets the URL to `wedding-zip.vercel.app`.

- [ ] **Step 4: Deploy**

Click "Deploy". Wait ~2 minutes for build.

- [ ] **Step 5: Verify live**

Open `https://wedding-zip.vercel.app`. Confirm placeholder landing renders with correct ivory background.

- [ ] **Step 6: Set up auto-deploy from main**

Vercel does this automatically. To verify: push any tiny change to main, watch Vercel dashboard rebuild.

```bash
# back in local repo
echo "" >> README.md
git commit -am "chore: trigger Vercel rebuild"
git push
# watch dashboard at https://vercel.com/<user>/wedding-zip
```

---

## Phase 1 — Supabase Setup (DB + Storage + RLS)

Goal: Supabase project provisioned, all tables and Storage buckets created via migration, RLS policies enforced.

### Task 1.1: Create Supabase project and wire env vars

**Files:**
- Create: `.env.local`, `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com/, sign up with GitHub. Click "New Project":
- Name: `wedding-zip`
- Region: `Northeast Asia (Seoul)`
- DB password: generate strong, save in password manager

Wait 2 minutes for provisioning.

- [ ] **Step 2: Copy keys to `.env.local`**

From Supabase dashboard → Project Settings → API:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Ensure `.env.local` is gitignored**

Open `.gitignore`. Confirm `.env*.local` line exists (Next.js default includes it).

- [ ] **Step 4: Install Supabase client**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 5: Create `lib/supabase/server.ts` (server-side client)**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.set(name, "", { ...options, maxAge: 0 }),
      },
    }
  );
}
```

- [ ] **Step 6: Create `lib/supabase/client.ts` (browser client)**

```typescript
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 7: Add env vars to Vercel**

Vercel dashboard → Settings → Environment Variables. Add all 4 from `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to `https://wedding-zip.vercel.app`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire Supabase clients (server + browser)"
git push
```

---

### Task 1.2: Migration — create `wedding_sites` table

**Files:**
- Create: `supabase/migrations/0001_wedding_sites.sql`

- [ ] **Step 1: Install Supabase CLI**

```bash
pnpm add -D supabase
```

- [ ] **Step 2: Initialize local Supabase config**

```bash
pnpm supabase init
```

Creates `supabase/` directory. Add `supabase/.temp` and `supabase/.branches` to `.gitignore` if not already.

- [ ] **Step 3: Link to remote project**

```bash
pnpm supabase login
pnpm supabase link --project-ref <your-project-ref>
```

(Project ref is in dashboard URL: `https://supabase.com/dashboard/project/<ref>`)

- [ ] **Step 4: Write migration `supabase/migrations/0001_wedding_sites.sql`**

```sql
-- wedding_sites: 1 row per wedding (1 user = 1 wedding)
create table public.wedding_sites (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null unique references auth.users(id) on delete cascade,
  slug            text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),

  groom_name      text not null default '',
  bride_name      text not null default '',
  parents         jsonb not null default '{}'::jsonb,
  wedding_at      timestamptz,

  venue_name      text not null default '',
  venue_address   text not null default '',
  venue_lat       float,
  venue_lng       float,

  greeting        text not null default '',
  groom_profile   jsonb not null default '{}'::jsonb,
  bride_profile   jsonb not null default '{}'::jsonb,
  story_items     jsonb not null default '[]'::jsonb,
  account_info    jsonb not null default '{}'::jsonb,

  main_photo_url  text,
  gallery_urls    text[] not null default '{}',
  bgm_tracks      jsonb not null default '[]'::jsonb,

  theme           text not null default 'ivory'
                  check (theme in ('ivory','sage','pink','cobalt','mocha','ash')),
  name_joiner     text not null default ' ♡ ',
  sections_enabled jsonb not null default
    '{"story":true,"gallery":true,"guestbook":true,"rsvp":true,"account":true,"profile":true}'::jsonb,

  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index wedding_sites_slug_idx on public.wedding_sites (slug);
create index wedding_sites_owner_idx on public.wedding_sites (owner_id);

-- Auto-update updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger wedding_sites_updated_at
  before update on public.wedding_sites
  for each row execute function set_updated_at();
```

- [ ] **Step 5: Apply migration**

```bash
pnpm supabase db push
```

- [ ] **Step 6: Verify in Supabase dashboard**

Dashboard → Table Editor → confirm `wedding_sites` exists with all columns.

- [ ] **Step 7: Commit**

```bash
git add supabase/
git commit -m "feat(db): create wedding_sites table with constraints and trigger"
git push
```

---

### Task 1.3: Migration — `guestbook` and `rsvp` tables

**Files:**
- Create: `supabase/migrations/0002_guestbook_rsvp.sql`

- [ ] **Step 1: Write migration**

```sql
create table public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.wedding_sites(id) on delete cascade,
  guest_name  text not null check (char_length(guest_name) between 1 and 30),
  message     text not null check (char_length(message) between 1 and 200),
  created_at  timestamptz not null default now()
);
create index guestbook_site_id_created_idx on public.guestbook (site_id, created_at desc);

create table public.rsvp (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.wedding_sites(id) on delete cascade,
  guest_name  text not null check (char_length(guest_name) between 1 and 30),
  phone       text,
  attending   boolean not null,
  party_size  int not null default 1 check (party_size between 1 and 20),
  message     text,
  created_at  timestamptz not null default now()
);
create index rsvp_site_id_created_idx on public.rsvp (site_id, created_at desc);
```

- [ ] **Step 2: Apply and verify**

```bash
pnpm supabase db push
```

Verify both tables in dashboard.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_guestbook_rsvp.sql
git commit -m "feat(db): create guestbook and rsvp tables"
git push
```

---

### Task 1.4: Migration — RLS policies

**Files:**
- Create: `supabase/migrations/0003_rls_policies.sql`

- [ ] **Step 1: Write RLS migration**

```sql
-- wedding_sites: public read of published, owner full control
alter table public.wedding_sites enable row level security;

create policy "wedding_sites public read of published"
  on public.wedding_sites for select
  using (published = true);

create policy "wedding_sites owner read all"
  on public.wedding_sites for select
  using (auth.uid() = owner_id);

create policy "wedding_sites owner insert"
  on public.wedding_sites for insert
  with check (auth.uid() = owner_id);

create policy "wedding_sites owner update"
  on public.wedding_sites for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "wedding_sites owner delete"
  on public.wedding_sites for delete
  using (auth.uid() = owner_id);

-- guestbook: public read+insert, owner-only delete
alter table public.guestbook enable row level security;

create policy "guestbook public read"
  on public.guestbook for select
  using (true);

create policy "guestbook public insert"
  on public.guestbook for insert
  with check (true);

create policy "guestbook owner delete"
  on public.guestbook for delete
  using (
    exists (
      select 1 from public.wedding_sites w
      where w.id = guestbook.site_id and w.owner_id = auth.uid()
    )
  );

-- rsvp: public insert, owner-only read+delete
alter table public.rsvp enable row level security;

create policy "rsvp owner read"
  on public.rsvp for select
  using (
    exists (
      select 1 from public.wedding_sites w
      where w.id = rsvp.site_id and w.owner_id = auth.uid()
    )
  );

create policy "rsvp public insert"
  on public.rsvp for insert
  with check (true);

create policy "rsvp owner delete"
  on public.rsvp for delete
  using (
    exists (
      select 1 from public.wedding_sites w
      where w.id = rsvp.site_id and w.owner_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Apply and verify**

```bash
pnpm supabase db push
```

Dashboard → Authentication → Policies → confirm 9 policies across 3 tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_rls_policies.sql
git commit -m "feat(db): enable RLS with policies on all tables"
git push
```

---

### Task 1.5: Storage buckets and policies

**Files:**
- Create: `supabase/migrations/0004_storage.sql`

- [ ] **Step 1: Create buckets in dashboard (UI required for buckets)**

Dashboard → Storage → New bucket:
- Name: `wedding-photos`, Public: **yes**
- Name: `wedding-bgm`, Public: **yes**

- [ ] **Step 2: Write Storage RLS migration**

```sql
-- wedding-photos: public read; owner can write to their own folder ({site_id}/*)
create policy "wedding-photos public read"
  on storage.objects for select
  using (bucket_id = 'wedding-photos');

create policy "wedding-photos owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );

create policy "wedding-photos owner update"
  on storage.objects for update
  using (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );

create policy "wedding-photos owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'wedding-photos'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );

-- Same set for wedding-bgm
create policy "wedding-bgm public read"
  on storage.objects for select
  using (bucket_id = 'wedding-bgm');

create policy "wedding-bgm owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'wedding-bgm'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );

create policy "wedding-bgm owner update"
  on storage.objects for update
  using (
    bucket_id = 'wedding-bgm'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );

create policy "wedding-bgm owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'wedding-bgm'
    and exists (
      select 1 from public.wedding_sites w
      where w.id::text = (storage.foldername(name))[1]
        and w.owner_id = auth.uid()
    )
  );
```

- [ ] **Step 3: Apply**

```bash
pnpm supabase db push
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_storage.sql
git commit -m "feat(db): storage buckets with per-site folder RLS"
git push
```

---

### Task 1.6: Generate TypeScript types from DB

**Files:**
- Create: `lib/supabase/types.ts`

- [ ] **Step 1: Generate types**

```bash
pnpm supabase gen types typescript --linked > lib/supabase/types.ts
```

- [ ] **Step 2: Smoke test types compile**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "chore: generate Supabase TypeScript types"
git push
```

---

## Phase 2 — Authentication

Goal: signup, login, logout flows. Authenticated users redirected to `/admin`; guests can reach public site and login form.

### Task 2.1: Auth middleware (session refresh)

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|mp3)$).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): middleware for Supabase session refresh"
git push
```

---

### Task 2.2: Signup page

**Files:**
- Create: `app/(auth)/signup/page.tsx`, `app/(auth)/signup/actions.ts`, `app/(auth)/layout.tsx`

- [ ] **Step 1: Auth layout (minimal, no tabbar)**

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Signup server action**

```typescript
// app/(auth)/signup/actions.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}
```

- [ ] **Step 3: Signup page UI**

```tsx
// app/(auth)/signup/page.tsx
"use client";
import { useState } from "react";
import { signupAction } from "./actions";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    const result = await signupAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={handle} className="space-y-4">
      <h1 className="text-2xl font-semibold mb-6">내 청첩장 만들기</h1>
      <input
        name="email"
        type="email"
        required
        placeholder="이메일"
        className="w-full p-3 rounded-sm border border-border bg-surface"
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="비밀번호 (8자 이상)"
        className="w-full p-3 rounded-sm border border-border bg-surface"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full p-3 bg-ink text-bg rounded-pill disabled:opacity-50"
      >
        {pending ? "가입 중..." : "가입하기"}
      </button>
      <p className="text-sm text-center text-secondary">
        이미 계정이 있으신가요? <Link href="/login" className="underline">로그인</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 4: Manual test**

```bash
pnpm dev
# Visit http://localhost:3000/signup
# Try valid signup, observe redirect to /admin (will 404 for now — OK)
# Check Supabase dashboard → Authentication → Users
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): signup page with server action"
git push
```

---

### Task 2.3: Login page

**Files:**
- Create: `app/(auth)/login/page.tsx`, `app/(auth)/login/actions.ts`

- [ ] **Step 1: Login server action**

```typescript
// app/(auth)/login/actions.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  redirect("/admin");
}
```

- [ ] **Step 2: Login page UI (mirror of signup)**

```tsx
// app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={handle} className="space-y-4">
      <h1 className="text-2xl font-semibold mb-6">로그인</h1>
      <input name="email" type="email" required placeholder="이메일"
        className="w-full p-3 rounded-sm border border-border bg-surface" />
      <input name="password" type="password" required placeholder="비밀번호"
        className="w-full p-3 rounded-sm border border-border bg-surface" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending}
        className="w-full p-3 bg-ink text-bg rounded-pill disabled:opacity-50">
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-sm text-center text-secondary">
        처음 오셨나요? <Link href="/signup" className="underline">가입하기</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Manual test**

```bash
pnpm dev
# Visit /login, sign in with the account from Task 2.2
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(auth): login page with server action"
git push
```

---

### Task 2.4: Logout action and auth guard helper

**Files:**
- Create: `lib/auth/require-user.ts`, `app/admin/logout/route.ts`

- [ ] **Step 1: `requireUser()` helper for protected pages**

```typescript
// lib/auth/require-user.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
```

- [ ] **Step 2: Logout route handler**

```typescript
// app/admin/logout/route.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
```

- [ ] **Step 3: Placeholder admin index using guard**

```tsx
// app/admin/page.tsx
import { requireUser } from "@/lib/auth/require-user";

export default async function AdminHome() {
  const user = await requireUser();
  return (
    <main className="p-6">
      <h1 className="text-xl">어드민 — {user.email}</h1>
      <form action="/admin/logout" method="POST">
        <button className="text-secondary text-sm underline">로그아웃</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Manual test**

```bash
pnpm dev
# Visit /admin while logged out → redirects to /login
# Log in → /admin shows email + logout button
# Click logout → back to /login
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): logout + requireUser guard + admin placeholder"
git push
```

---

## Phase 3 — Admin Form

Goal: a single editable form at `/admin` saving to `wedding_sites`. Built in field-group order so user can save partial drafts.

### Task 3.1: Bootstrap admin form with slug check (TDD)

**Files:**
- Create: `lib/slug/validate.ts`, `lib/slug/validate.test.ts`, `lib/db/wedding-site.ts`, `app/admin/page.tsx` (modify), `app/admin/actions.ts`

- [ ] **Step 1: Add Vitest**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: "./vitest.setup.ts" },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Create `vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
"test": "vitest"
```

- [ ] **Step 2: Write failing test for `validateSlug`**

```typescript
// lib/slug/validate.test.ts
import { describe, it, expect } from "vitest";
import { validateSlug } from "./validate";

describe("validateSlug", () => {
  it("accepts lowercase alphanumeric with hyphens between", () => {
    expect(validateSlug("changhwan-jiyoung").ok).toBe(true);
    expect(validateSlug("abc").ok).toBe(true);
  });
  it("rejects too short", () => {
    expect(validateSlug("a").ok).toBe(false);
  });
  it("rejects too long (over 50)", () => {
    expect(validateSlug("a".repeat(51)).ok).toBe(false);
  });
  it("rejects leading or trailing hyphen", () => {
    expect(validateSlug("-abc").ok).toBe(false);
    expect(validateSlug("abc-").ok).toBe(false);
  });
  it("rejects uppercase or special chars", () => {
    expect(validateSlug("ABC").ok).toBe(false);
    expect(validateSlug("abc_def").ok).toBe(false);
    expect(validateSlug("abc.def").ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run test, confirm fail**

```bash
pnpm test --run lib/slug
```

Expected: FAIL with "Cannot find module './validate'".

- [ ] **Step 4: Implement `validateSlug`**

```typescript
// lib/slug/validate.ts
export type SlugCheck = { ok: true } | { ok: false; reason: string };

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function validateSlug(slug: string): SlugCheck {
  if (!slug) return { ok: false, reason: "슬러그가 비어 있습니다." };
  if (slug.length < 3) return { ok: false, reason: "3자 이상이어야 합니다." };
  if (slug.length > 50) return { ok: false, reason: "50자 이하이어야 합니다." };
  if (!SLUG_RE.test(slug)) return { ok: false, reason: "소문자·숫자·중간 하이픈만 가능합니다." };
  return { ok: true };
}
```

- [ ] **Step 5: Run test, confirm pass**

```bash
pnpm test --run lib/slug
```

Expected: all 5 tests pass.

- [ ] **Step 6: DB helper — get or create site for user**

```typescript
// lib/db/wedding-site.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOrCreateSiteForOwner(ownerId: string) {
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (existing) return existing;

  const tempSlug = `draft-${ownerId.slice(0, 8)}`;
  const { data: created, error } = await supabase
    .from("wedding_sites")
    .insert({ owner_id: ownerId, slug: tempSlug })
    .select("*")
    .single();
  if (error) throw error;
  return created;
}

export async function isSlugAvailable(slug: string, excludeOwnerId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("wedding_sites")
    .select("owner_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return true;
  return data.owner_id === excludeOwnerId;
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(admin): slug validator (TDD) + wedding-site DB helpers"
git push
```

---

### Task 3.2: Admin form — basic info section (이름·날짜·슬러그)

**Files:**
- Modify: `app/admin/page.tsx`
- Create: `app/admin/actions.ts`, `app/admin/_components/BasicInfoSection.tsx`, `app/admin/_components/SlugField.tsx`, `app/api/slug-check/route.ts`

- [ ] **Step 1: Slug-check API route (async availability)**

```typescript
// app/api/slug-check/route.ts
import { NextResponse } from "next/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const v = validateSlug(slug);
  if (!v.ok) return NextResponse.json({ available: false, reason: v.reason });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ available: false, reason: "로그인 필요" }, { status: 401 });

  const available = await isSlugAvailable(slug, user.id);
  return NextResponse.json({ available, reason: available ? null : "이미 사용 중인 슬러그입니다." });
}
```

- [ ] **Step 2: `SlugField` client component**

```tsx
// app/admin/_components/SlugField.tsx
"use client";
import { useEffect, useState } from "react";

export function SlugField({ defaultValue }: { defaultValue: string }) {
  const [slug, setSlug] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || slug === defaultValue) { setStatus("idle"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      const r = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`);
      const json = await r.json();
      if (json.available) { setStatus("ok"); setReason(null); }
      else { setStatus("bad"); setReason(json.reason); }
    }, 500);
    return () => clearTimeout(t);
  }, [slug, defaultValue]);

  return (
    <label className="block">
      <span className="text-sm text-secondary">슬러그 (URL의 마지막 부분)</span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-muted text-sm">wedding-zip.vercel.app/w/</span>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          pattern="[a-z0-9][a-z0-9-]{1,48}[a-z0-9]"
          className="flex-1 p-2 rounded-sm border border-border bg-surface"
        />
      </div>
      {status === "checking" && <p className="text-xs text-muted mt-1">확인 중…</p>}
      {status === "ok" && <p className="text-xs text-green-700 mt-1">사용 가능 ✓</p>}
      {status === "bad" && <p className="text-xs text-red-600 mt-1">{reason}</p>}
    </label>
  );
}
```

- [ ] **Step 3: `BasicInfoSection` server component**

```tsx
// app/admin/_components/BasicInfoSection.tsx
import { SlugField } from "./SlugField";
import type { Tables } from "@/lib/supabase/types";

export function BasicInfoSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <SlugField defaultValue={site.slug} />

      <label className="block">
        <span className="text-sm text-secondary">신랑 이름</span>
        <input name="groom_name" defaultValue={site.groom_name ?? ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface" />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">신부 이름</span>
        <input name="bride_name" defaultValue={site.bride_name ?? ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface" />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">결혼식 일시</span>
        <input name="wedding_at" type="datetime-local"
          defaultValue={site.wedding_at ? new Date(site.wedding_at).toISOString().slice(0,16) : ""}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface" />
      </label>

      <label className="block">
        <span className="text-sm text-secondary">이름 사이 구분</span>
        <select name="name_joiner" defaultValue={site.name_joiner}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface">
          <option value=" ♡ ">창환 ♡ 지영</option>
          <option value=" · ">창환 · 지영</option>
          <option value=" & ">창환 &amp; 지영</option>
          <option value="  ">창환  지영 (공백)</option>
        </select>
      </label>
    </section>
  );
}
```

- [ ] **Step 4: Save server action**

```typescript
// app/admin/actions.ts
"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug/validate";
import { isSlugAvailable } from "@/lib/db/wedding-site";
import { revalidatePath } from "next/cache";

export async function saveBasicInfo(formData: FormData) {
  const user = await requireUser();
  const supabase = createSupabaseServerClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const groom_name = String(formData.get("groom_name") ?? "").trim();
  const bride_name = String(formData.get("bride_name") ?? "").trim();
  const wedding_at_raw = String(formData.get("wedding_at") ?? "");
  const name_joiner = String(formData.get("name_joiner") ?? " ♡ ");

  const v = validateSlug(slug);
  if (!v.ok) return { error: v.reason };
  if (!(await isSlugAvailable(slug, user.id))) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const wedding_at = wedding_at_raw ? new Date(wedding_at_raw).toISOString() : null;

  const { error } = await supabase
    .from("wedding_sites")
    .update({ slug, groom_name, bride_name, wedding_at, name_joiner })
    .eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
```

- [ ] **Step 5: Admin page wires it together**

```tsx
// app/admin/page.tsx
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { BasicInfoSection } from "./_components/BasicInfoSection";
import { saveBasicInfo } from "./actions";

export default async function AdminHome() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">내 청첩장 편집</h1>
        <form action="/admin/logout" method="POST">
          <button className="text-sm text-secondary underline">로그아웃</button>
        </form>
      </header>

      <form action={saveBasicInfo} className="space-y-6">
        <BasicInfoSection site={site} />
        <button type="submit" className="w-full p-3 bg-ink text-bg rounded-pill">
          기본 정보 저장
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 6: Manual test**

Log in, change names + slug, click 저장. Refresh — values persist. Try duplicate slug — error shown.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(admin): basic info section (slug, names, date, joiner)"
git push
```

---

### Task 3.3: Admin form — parents section (양가 부모님 + 고인)

**Files:**
- Create: `app/admin/_components/ParentsSection.tsx`, `lib/parents/types.ts`
- Modify: `app/admin/actions.ts`, `app/admin/page.tsx`

- [ ] **Step 1: Types**

```typescript
// lib/parents/types.ts
export type ParentStatus = "alive" | "go" | "hyeon";
export type ParentEntry = { name: string; status: ParentStatus };
export type ParentsBlock = {
  groom_father?: ParentEntry;
  groom_mother?: ParentEntry;
  bride_father?: ParentEntry;
  bride_mother?: ParentEntry;
};
```

- [ ] **Step 2: ParentsSection component**

```tsx
// app/admin/_components/ParentsSection.tsx
import type { ParentsBlock, ParentEntry } from "@/lib/parents/types";

function Row({
  side, role, label, value,
}: {
  side: "groom" | "bride";
  role: "father" | "mother";
  label: string;
  value: ParentEntry | undefined;
}) {
  const baseName = `${side}_${role}`;
  const isMother = role === "mother";
  return (
    <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
      <span className="text-sm text-secondary">{label}</span>
      <input
        name={`${baseName}_name`}
        defaultValue={value?.name ?? ""}
        placeholder="이름"
        className="p-2 rounded-sm border border-border bg-surface"
      />
      <select
        name={`${baseName}_status`}
        defaultValue={value?.status ?? "alive"}
        className="p-2 rounded-sm border border-border bg-surface"
      >
        <option value="alive">생존</option>
        <option value="go">故</option>
        <option value="hyeon">{isMother ? "顯妣" : "顯考"}</option>
      </select>
    </div>
  );
}

export function ParentsSection({ parents }: { parents: ParentsBlock }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">양가 부모님</h2>
      <Row side="groom" role="father" label="신랑 아버지" value={parents.groom_father} />
      <Row side="groom" role="mother" label="신랑 어머니" value={parents.groom_mother} />
      <Row side="bride" role="father" label="신부 아버지" value={parents.bride_father} />
      <Row side="bride" role="mother" label="신부 어머니" value={parents.bride_mother} />
    </section>
  );
}
```

- [ ] **Step 3: Extend `saveBasicInfo` action to include parents**

Add to `app/admin/actions.ts`:

```typescript
function readParentsFromForm(formData: FormData) {
  const sides = ["groom", "bride"] as const;
  const roles = ["father", "mother"] as const;
  const out: any = {};
  for (const side of sides) {
    for (const role of roles) {
      const name = String(formData.get(`${side}_${role}_name`) ?? "").trim();
      const status = String(formData.get(`${side}_${role}_status`) ?? "alive");
      if (name) out[`${side}_${role}`] = { name, status };
    }
  }
  return out;
}
```

Update `saveBasicInfo` to also save parents:

```typescript
const parents = readParentsFromForm(formData);
// ...in the update:
const { error } = await supabase
  .from("wedding_sites")
  .update({ slug, groom_name, bride_name, wedding_at, name_joiner, parents })
  .eq("owner_id", user.id);
```

- [ ] **Step 4: Wire `ParentsSection` into `app/admin/page.tsx`**

```tsx
import { ParentsSection } from "./_components/ParentsSection";

// inside the form:
<ParentsSection parents={(site.parents as any) ?? {}} />
```

- [ ] **Step 5: Manual test**

Edit 4 parent rows, mix in 故/顯, save. Refresh — confirms persistence.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): parents section with 故/顯考/顯妣 status"
git push
```

---

### Task 3.4: Admin form — venue + Kakao geocoding

**Files:**
- Create: `app/admin/_components/VenueSection.tsx`, `lib/kakao/geocode.ts`, `app/api/geocode/route.ts`
- Modify: `app/admin/actions.ts`, `app/admin/page.tsx`

- [ ] **Step 1: Get Kakao JS key**

Go to https://developers.kakao.com/ → Add app → Web platform → register domain `http://localhost:3000` + `https://wedding-zip.vercel.app`. Enable Kakao Maps API. Copy JavaScript key.

Add to `.env.local`:

```
NEXT_PUBLIC_KAKAO_MAP_KEY=<your-js-key>
KAKAO_REST_API_KEY=<your-rest-key>
```

Add both to Vercel env vars too.

- [ ] **Step 2: Geocode helper (server-side, uses REST API)**

```typescript
// lib/kakao/geocode.ts
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const r = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` }, cache: "no-store" }
  );
  if (!r.ok) return null;
  const json = await r.json();
  const doc = json.documents?.[0];
  if (!doc) return null;
  return { lat: Number(doc.y), lng: Number(doc.x) };
}
```

- [ ] **Step 3: Geocode API route (called from client on blur)**

```typescript
// app/api/geocode/route.ts
import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/kakao/geocode";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("q") ?? "";
  if (!address) return NextResponse.json({ ok: false });
  const point = await geocodeAddress(address);
  return NextResponse.json(point ? { ok: true, ...point } : { ok: false });
}
```

- [ ] **Step 4: VenueSection client component**

```tsx
// app/admin/_components/VenueSection.tsx
"use client";
import { useState } from "react";

type Props = { name: string; address: string; lat: number | null; lng: number | null };

export function VenueSection({ name, address, lat, lng }: Props) {
  const [addr, setAddr] = useState(address);
  const [coord, setCoord] = useState<{lat:number;lng:number}|null>(
    lat != null && lng != null ? { lat, lng } : null
  );
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"fail">("idle");

  async function geocode() {
    if (!addr) return;
    setStatus("loading");
    const r = await fetch(`/api/geocode?q=${encodeURIComponent(addr)}`);
    const json = await r.json();
    if (json.ok) { setCoord({ lat: json.lat, lng: json.lng }); setStatus("ok"); }
    else { setCoord(null); setStatus("fail"); }
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">식장</h2>
      <label className="block">
        <span className="text-sm text-secondary">식장 이름</span>
        <input name="venue_name" defaultValue={name}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface" />
      </label>
      <label className="block">
        <span className="text-sm text-secondary">주소</span>
        <input
          name="venue_address"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onBlur={geocode}
          className="w-full mt-1 p-2 rounded-sm border border-border bg-surface"
        />
        {status === "loading" && <p className="text-xs text-muted mt-1">주소 확인 중…</p>}
        {status === "ok" && <p className="text-xs text-green-700 mt-1">좌표 확인됨 ({coord!.lat.toFixed(4)}, {coord!.lng.toFixed(4)})</p>}
        {status === "fail" && <p className="text-xs text-red-600 mt-1">주소를 찾지 못했습니다. 다시 입력하거나 더 정확한 주소를 적어주세요.</p>}
      </label>
      <input type="hidden" name="venue_lat" value={coord?.lat ?? ""} />
      <input type="hidden" name="venue_lng" value={coord?.lng ?? ""} />
    </section>
  );
}
```

- [ ] **Step 5: Extend save action**

In `app/admin/actions.ts`, read venue fields:

```typescript
const venue_name = String(formData.get("venue_name") ?? "").trim();
const venue_address = String(formData.get("venue_address") ?? "").trim();
const venue_lat = Number(formData.get("venue_lat")) || null;
const venue_lng = Number(formData.get("venue_lng")) || null;

// extend update:
.update({ ..., venue_name, venue_address, venue_lat, venue_lng })
```

- [ ] **Step 6: Wire into admin page**

```tsx
<VenueSection
  name={site.venue_name}
  address={site.venue_address}
  lat={site.venue_lat}
  lng={site.venue_lng}
/>
```

- [ ] **Step 7: Manual test**

Type a real address → blur → coordinates appear. Save. Refresh — persists.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(admin): venue section with Kakao geocoding on blur"
git push
```

---

### Task 3.5: Admin form — photo upload (main + gallery)

**Files:**
- Create: `app/admin/_components/PhotoSection.tsx`, `lib/storage/upload.ts`, `app/api/admin/upload-photo/route.ts`

- [ ] **Step 1: Upload route handler (server uploads + returns public URL)**

```typescript
// app/api/admin/upload-photo/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const kind = String(form.get("kind") ?? "gallery"); // 'main' or 'gallery'

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "8MB 초과" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path =
    kind === "main"
      ? `${site.id}/main.${ext}`
      : `${site.id}/gallery/${crypto.randomUUID()}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("wedding-photos")
    .upload(path, buf, { upsert: kind === "main", contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-photos").getPublicUrl(path);

  if (kind === "main") {
    await supabase.from("wedding_sites").update({ main_photo_url: pub.publicUrl }).eq("id", site.id);
  } else {
    const next = [...(site.gallery_urls ?? []), pub.publicUrl];
    await supabase.from("wedding_sites").update({ gallery_urls: next }).eq("id", site.id);
  }

  return NextResponse.json({ url: pub.publicUrl });
}
```

- [ ] **Step 2: Delete-photo route**

```typescript
// app/api/admin/delete-photo/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { url, kind } = await req.json();
  const supabase = createSupabaseServerClient();

  // path is everything after /wedding-photos/
  const path = String(url).split("/wedding-photos/")[1];
  if (path) await supabase.storage.from("wedding-photos").remove([path]);

  if (kind === "main") {
    await supabase.from("wedding_sites").update({ main_photo_url: null }).eq("id", site.id);
  } else {
    const next = (site.gallery_urls ?? []).filter((u: string) => u !== url);
    await supabase.from("wedding_sites").update({ gallery_urls: next }).eq("id", site.id);
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: `PhotoSection` client component**

```tsx
// app/admin/_components/PhotoSection.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { mainUrl: string | null; galleryUrls: string[] };

export function PhotoSection({ mainUrl, galleryUrls }: Props) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function upload(file: File, kind: "main" | "gallery") {
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    await fetch("/api/admin/upload-photo", { method: "POST", body: fd });
    setBusy(false);
    router.refresh();
  }

  async function remove(url: string, kind: "main" | "gallery") {
    setBusy(true);
    await fetch("/api/admin/delete-photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, kind }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">사진</h2>

      <div>
        <p className="text-sm text-secondary mb-2">메인 사진 (1장)</p>
        {mainUrl && (
          <div className="relative w-40 h-48 mb-2">
            <img src={mainUrl} alt="" className="w-full h-full object-cover rounded-sm" />
            <button type="button" disabled={busy} onClick={() => remove(mainUrl, "main")}
              className="absolute top-1 right-1 bg-ink text-bg text-xs px-2 py-1 rounded-pill">삭제</button>
          </div>
        )}
        <input type="file" accept="image/*" disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "main")} />
      </div>

      <div>
        <p className="text-sm text-secondary mb-2">갤러리 ({galleryUrls.length}장)</p>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {galleryUrls.map((u) => (
            <div key={u} className="relative aspect-square">
              <img src={u} alt="" className="w-full h-full object-cover rounded-sm" />
              <button type="button" disabled={busy} onClick={() => remove(u, "gallery")}
                className="absolute top-1 right-1 bg-ink text-bg text-xs px-1.5 py-0.5 rounded-pill">X</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "gallery")} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire into admin page (outside the main form, since uploads are separate)**

```tsx
// app/admin/page.tsx — add OUTSIDE the basic-info form:
<PhotoSection mainUrl={site.main_photo_url} galleryUrls={site.gallery_urls ?? []} />
```

- [ ] **Step 5: Manual test**

Upload main photo + 2 gallery photos. Delete one gallery photo. Confirm Supabase Storage shows correct folder structure (`{site_id}/main.jpg`, `{site_id}/gallery/<uuid>.jpg`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): photo upload (main + gallery) with delete"
git push
```

---

### Task 3.6: Admin form — BGM playlist upload

**Files:**
- Create: `app/admin/_components/BgmSection.tsx`, `app/api/admin/upload-bgm/route.ts`, `app/api/admin/update-bgm/route.ts`

- [ ] **Step 1: Upload BGM route**

```typescript
// app/api/admin/upload-bgm/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export const runtime = "nodejs";
const MAX_TRACKS = 5;

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const tracks = (site.bgm_tracks as any[]) ?? [];
  if (tracks.length >= MAX_TRACKS) return NextResponse.json({ error: "최대 5곡" }, { status: 400 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const title = String(form.get("title") ?? "").trim() || "Untitled";
  const artist = String(form.get("artist") ?? "").trim() || null;

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "15MB 초과" }, { status: 400 });
  if (!file.type.startsWith("audio/")) return NextResponse.json({ error: "오디오만" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
  const path = `${site.id}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("wedding-bgm").upload(path, buf, { contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from("wedding-bgm").getPublicUrl(path);
  const order = tracks.length + 1;
  const next = [...tracks, { order, url: pub.publicUrl, title, artist }];

  await supabase.from("wedding_sites").update({ bgm_tracks: next }).eq("id", site.id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Update/delete BGM route**

```typescript
// app/api/admin/update-bgm/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";

export async function POST(req: Request) {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const { action, url } = await req.json() as { action: "delete"; url: string };

  const supabase = createSupabaseServerClient();
  const tracks = ((site.bgm_tracks as any[]) ?? []).filter((t) => t.url !== url);
  // reindex order
  tracks.forEach((t, i) => (t.order = i + 1));

  const path = String(url).split("/wedding-bgm/")[1];
  if (action === "delete" && path) {
    await supabase.storage.from("wedding-bgm").remove([path]);
  }
  await supabase.from("wedding_sites").update({ bgm_tracks: tracks }).eq("id", site.id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: BgmSection client component**

```tsx
// app/admin/_components/BgmSection.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Track = { order: number; url: string; title: string; artist: string | null };

export function BgmSection({ tracks }: { tracks: Track[] }) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const router = useRouter();

  async function upload(file: File) {
    if (!title) { alert("제목을 입력하세요"); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("artist", artist);
    await fetch("/api/admin/upload-bgm", { method: "POST", body: fd });
    setTitle(""); setArtist("");
    setBusy(false);
    router.refresh();
  }

  async function remove(url: string) {
    setBusy(true);
    await fetch("/api/admin/update-bgm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "delete", url }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">BGM 플레이리스트 ({tracks.length}/5)</h2>
      <ul className="space-y-2">
        {tracks.map((t) => (
          <li key={t.url} className="flex items-center gap-3 p-2 bg-bg rounded-sm">
            <span className="w-6 h-6 rounded-full bg-ink text-bg text-xs flex items-center justify-center">{t.order}</span>
            <span className="flex-1 text-sm">{t.title} {t.artist && <span className="text-muted">— {t.artist}</span>}</span>
            <audio src={t.url} controls className="h-8" />
            <button type="button" disabled={busy} onClick={() => remove(t.url)}
              className="text-xs text-red-600">삭제</button>
          </li>
        ))}
      </ul>

      {tracks.length < 5 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="곡 제목"
            className="p-2 rounded-sm border border-border bg-surface" />
          <input value={artist} onChange={(e)=>setArtist(e.target.value)} placeholder="아티스트 (선택)"
            className="p-2 rounded-sm border border-border bg-surface" />
          <label className="px-3 py-2 bg-ink text-bg rounded-pill text-sm cursor-pointer">
            업로드
            <input type="file" accept="audio/*" hidden disabled={busy}
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Wire into admin page**

```tsx
<BgmSection tracks={(site.bgm_tracks as any[]) ?? []} />
```

- [ ] **Step 5: Manual test**

Upload 2 MP3 tracks with title/artist. Confirm playback inline. Delete one. Confirm Storage cleared.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): BGM playlist upload (max 5 tracks)"
git push
```

---

### Task 3.7: Admin form — story timeline + greeting + profiles

**Files:**
- Create: `app/admin/_components/StorySection.tsx`, `app/admin/_components/GreetingSection.tsx`, `app/admin/_components/ProfileSection.tsx`
- Modify: `app/admin/actions.ts`, `app/admin/page.tsx`

- [ ] **Step 1: `GreetingSection`**

```tsx
// app/admin/_components/GreetingSection.tsx
import type { Tables } from "@/lib/supabase/types";

export function GreetingSection({ site }: { site: Tables<"wedding_sites"> }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">인사말</h2>
      <textarea name="greeting" rows={5} defaultValue={site.greeting ?? ""}
        placeholder="저희 두 사람이 새로운 시작을 함께합니다..."
        className="w-full p-2 rounded-sm border border-border bg-surface" />
    </section>
  );
}
```

- [ ] **Step 2: `ProfileSection` (groom + bride)**

```tsx
// app/admin/_components/ProfileSection.tsx
type Profile = { mbti?: string; intro?: string };

export function ProfileSection({
  groom, bride,
}: { groom: Profile; bride: Profile }) {
  function Block({ side, label, p }: { side: "groom"|"bride"; label: string; p: Profile }) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <input name={`${side}_mbti`} defaultValue={p.mbti ?? ""} placeholder="MBTI"
          className="w-full p-2 rounded-sm border border-border bg-surface" />
        <textarea name={`${side}_intro`} rows={3} defaultValue={p.intro ?? ""}
          placeholder="간단한 소개"
          className="w-full p-2 rounded-sm border border-border bg-surface" />
      </div>
    );
  }
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">신랑·신부 프로필</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Block side="groom" label="신랑" p={groom} />
        <Block side="bride" label="신부" p={bride} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `StorySection` (variable count items via JSON textarea — simplest v1)**

```tsx
// app/admin/_components/StorySection.tsx
"use client";
import { useState } from "react";

type StoryItem = { date: string; title: string; body: string };

export function StorySection({ items }: { items: StoryItem[] }) {
  const [list, setList] = useState<StoryItem[]>(items.length ? items : [{ date:"", title:"", body:"" }]);

  function update(i: number, key: keyof StoryItem, val: string) {
    setList((prev) => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it));
  }
  function add() { setList((prev) => [...prev, { date:"", title:"", body:"" }]); }
  function remove(i: number) { setList((prev) => prev.filter((_, idx) => idx !== i)); }

  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">우리 스토리</h2>
      {list.map((it, i) => (
        <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-2">
          <input value={it.date} onChange={(e)=>update(i,"date",e.target.value)} placeholder="2023.05"
            className="p-2 rounded-sm border border-border bg-surface" />
          <div className="space-y-1">
            <input value={it.title} onChange={(e)=>update(i,"title",e.target.value)} placeholder="제목"
              className="w-full p-2 rounded-sm border border-border bg-surface" />
            <textarea value={it.body} onChange={(e)=>update(i,"body",e.target.value)} placeholder="내용" rows={2}
              className="w-full p-2 rounded-sm border border-border bg-surface" />
          </div>
          <button type="button" onClick={() => remove(i)} className="text-red-600 text-sm">X</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm underline">+ 항목 추가</button>
      <input type="hidden" name="story_items_json" value={JSON.stringify(list)} />
    </section>
  );
}
```

- [ ] **Step 4: Extend save action**

```typescript
// app/admin/actions.ts — add to saveBasicInfo:
const greeting = String(formData.get("greeting") ?? "").trim();
const groom_profile = {
  mbti: String(formData.get("groom_mbti") ?? "").trim() || undefined,
  intro: String(formData.get("groom_intro") ?? "").trim() || undefined,
};
const bride_profile = {
  mbti: String(formData.get("bride_mbti") ?? "").trim() || undefined,
  intro: String(formData.get("bride_intro") ?? "").trim() || undefined,
};
let story_items: any[] = [];
try { story_items = JSON.parse(String(formData.get("story_items_json") ?? "[]")); } catch {}
story_items = story_items.filter((s) => s.date || s.title || s.body);

// add to update:
.update({ ..., greeting, groom_profile, bride_profile, story_items })
```

- [ ] **Step 5: Wire into admin page**

```tsx
<GreetingSection site={site} />
<ProfileSection
  groom={(site.groom_profile as any) ?? {}}
  bride={(site.bride_profile as any) ?? {}} />
<StorySection items={(site.story_items as any[]) ?? []} />
```

- [ ] **Step 6: Manual test & commit**

```bash
git add -A
git commit -m "feat(admin): greeting, profiles, story timeline sections"
git push
```

---

### Task 3.8: Admin form — account info (6 accounts) + sections toggle + theme

**Files:**
- Create: `app/admin/_components/AccountSection.tsx`, `app/admin/_components/ThemeSection.tsx`
- Modify: `app/admin/actions.ts`, `app/admin/page.tsx`

- [ ] **Step 1: `AccountSection`**

```tsx
// app/admin/_components/AccountSection.tsx
type Acc = { bank?: string; account?: string; holder?: string };
type AccountInfo = {
  groom?: { self?: Acc; father?: Acc; mother?: Acc };
  bride?: { self?: Acc; father?: Acc; mother?: Acc };
};

function Row({ prefix, label, value }: { prefix: string; label: string; value: Acc | undefined }) {
  return (
    <div className="grid grid-cols-[80px_1fr_1.5fr_1fr] gap-2 items-center">
      <span className="text-xs text-secondary">{label}</span>
      <input name={`${prefix}_bank`} defaultValue={value?.bank ?? ""} placeholder="은행"
        className="p-1.5 rounded-sm border border-border bg-surface text-sm" />
      <input name={`${prefix}_account`} defaultValue={value?.account ?? ""} placeholder="계좌번호"
        className="p-1.5 rounded-sm border border-border bg-surface text-sm" />
      <input name={`${prefix}_holder`} defaultValue={value?.holder ?? ""} placeholder="예금주"
        className="p-1.5 rounded-sm border border-border bg-surface text-sm" />
    </div>
  );
}

export function AccountSection({ info }: { info: AccountInfo }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">마음전하기 (계좌 — 입력하지 않으면 숨겨짐)</h2>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">신랑측</h3>
        <Row prefix="acc_groom_self" label="본인" value={info.groom?.self} />
        <Row prefix="acc_groom_father" label="아버지" value={info.groom?.father} />
        <Row prefix="acc_groom_mother" label="어머니" value={info.groom?.mother} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">신부측</h3>
        <Row prefix="acc_bride_self" label="본인" value={info.bride?.self} />
        <Row prefix="acc_bride_father" label="아버지" value={info.bride?.father} />
        <Row prefix="acc_bride_mother" label="어머니" value={info.bride?.mother} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `ThemeSection` (theme + section toggles + published)**

```tsx
// app/admin/_components/ThemeSection.tsx
const THEMES = [
  { key: "ivory", label: "🪶 Ivory" },
  { key: "sage", label: "🌿 Sage" },
  { key: "pink", label: "🌸 Pink" },
  { key: "cobalt", label: "🔵 Cobalt" },
  { key: "mocha", label: "☕ Mocha" },
  { key: "ash", label: "🌫 Ash" },
];

const SECTIONS = [
  { key: "story", label: "📖 우리 스토리" },
  { key: "gallery", label: "📷 사진첩" },
  { key: "guestbook", label: "💬 일촌평" },
  { key: "rsvp", label: "📋 RSVP" },
  { key: "account", label: "💝 마음전하기" },
  { key: "profile", label: "👤 프로필" },
];

export function ThemeSection({
  theme, sectionsEnabled, published,
}: { theme: string; sectionsEnabled: Record<string, boolean>; published: boolean }) {
  return (
    <section className="bg-surface border border-border rounded-md p-6 space-y-4 shadow-card">
      <h2 className="text-lg font-semibold">디자인·섹션·공개</h2>

      <div>
        <p className="text-sm text-secondary mb-2">테마</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <label key={t.key} className="cursor-pointer">
              <input type="radio" name="theme" value={t.key} defaultChecked={theme === t.key} className="peer sr-only" />
              <span className="px-3 py-1.5 rounded-pill border border-border peer-checked:bg-ink peer-checked:text-bg text-sm">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-secondary mb-2">표시할 섹션</p>
        <div className="grid grid-cols-2 gap-2">
          {SECTIONS.map((s) => (
            <label key={s.key} className="flex items-center gap-2 p-2 bg-bg rounded-sm">
              <input type="checkbox" name={`section_${s.key}`} defaultChecked={sectionsEnabled[s.key] ?? true} />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 p-3 bg-bg rounded-sm cursor-pointer">
        <input type="checkbox" name="published" defaultChecked={published} />
        <span className="text-sm font-semibold">공개 사이트 활성화</span>
      </label>
    </section>
  );
}
```

- [ ] **Step 3: Extend save action**

```typescript
// app/admin/actions.ts — add:
function readAccount(formData: FormData, prefix: string) {
  const bank = String(formData.get(`${prefix}_bank`) ?? "").trim();
  const account = String(formData.get(`${prefix}_account`) ?? "").trim();
  const holder = String(formData.get(`${prefix}_holder`) ?? "").trim();
  if (!bank && !account && !holder) return null;
  return { bank, account, holder };
}
const account_info = {
  groom: {
    self: readAccount(formData, "acc_groom_self"),
    father: readAccount(formData, "acc_groom_father"),
    mother: readAccount(formData, "acc_groom_mother"),
  },
  bride: {
    self: readAccount(formData, "acc_bride_self"),
    father: readAccount(formData, "acc_bride_father"),
    mother: readAccount(formData, "acc_bride_mother"),
  },
};

const theme = String(formData.get("theme") ?? "ivory");
const sections_enabled = {
  story: formData.get("section_story") === "on",
  gallery: formData.get("section_gallery") === "on",
  guestbook: formData.get("section_guestbook") === "on",
  rsvp: formData.get("section_rsvp") === "on",
  account: formData.get("section_account") === "on",
  profile: formData.get("section_profile") === "on",
};
const published = formData.get("published") === "on";

// add to update:
.update({ ..., account_info, theme, sections_enabled, published })
```

- [ ] **Step 4: Wire into admin page**

```tsx
<AccountSection info={(site.account_info as any) ?? {}} />
<ThemeSection
  theme={site.theme}
  sectionsEnabled={(site.sections_enabled as any) ?? {}}
  published={site.published}
/>
```

- [ ] **Step 5: Manual test**

Fill all sections, save, refresh. Confirm everything persists. Toggle `published` on.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(admin): account info, theme, section toggles, publish flag"
git push
```

---

## Phase 4 — Public Site

Goal: `/w/{slug}` renders a fully styled wedding invitation from DB. Splash + 5 tabs work end-to-end.

### Task 4.1: Public site loader and splash page

**Files:**
- Create: `app/w/[slug]/page.tsx`, `app/w/[slug]/_lib/load-site.ts`, `app/w/[slug]/_components/Splash.tsx`, `app/w/[slug]/layout.tsx`

- [ ] **Step 1: Loader**

```typescript
// app/w/[slug]/_lib/load-site.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function loadSite(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("wedding_sites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) notFound();
  return data;
}
```

- [ ] **Step 2: Layout applies theme + Pretendard via data-theme attribute**

```tsx
// app/w/[slug]/layout.tsx
import { loadSite } from "./_lib/load-site";

export default async function PublicLayout({
  children, params,
}: { children: React.ReactNode; params: { slug: string } }) {
  const site = await loadSite(params.slug);
  return (
    <div data-theme={site.theme} className="min-h-screen bg-bg text-ink">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Splash component**

```tsx
// app/w/[slug]/_components/Splash.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  groomName: string; brideName: string;
  weddingAt: string | null; nameJoiner: string;
  venueName: string; greeting: string;
  mainPhotoUrl: string | null; slug: string;
};

export function Splash(p: Props) {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => { setOpacity(1); }, []);

  const dateText = p.weddingAt
    ? new Date(p.weddingAt).toLocaleString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        weekday: "short", hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 transition-opacity duration-700"
         style={{ opacity }}>
      {p.mainPhotoUrl && (
        <img src={p.mainPhotoUrl} alt="" className="w-56 h-72 object-cover rounded-sm shadow-card" />
      )}
      <h1 className="text-2xl font-medium tracking-tight">
        {p.groomName}{p.nameJoiner}{p.brideName}
      </h1>
      {dateText && <p className="text-sm text-muted tracking-widest">{dateText}</p>}
      {p.venueName && <p className="text-sm text-secondary">📍 {p.venueName}</p>}
      {p.greeting && (
        <p className="text-sm text-secondary whitespace-pre-line max-w-xs leading-relaxed">
          {p.greeting}
        </p>
      )}
      <Link href={`/w/${p.slug}?tab=home`} className="mt-4 px-6 py-3 bg-ink text-bg rounded-pill text-sm">
        🎵 청첩장 자세히 보기 ↓
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Page (decides between splash and tabbed view based on `?tab=` query)**

```tsx
// app/w/[slug]/page.tsx
import { loadSite } from "./_lib/load-site";
import { Splash } from "./_components/Splash";

export default async function PublicPage({
  params, searchParams,
}: { params: { slug: string }; searchParams: { tab?: string } }) {
  const site = await loadSite(params.slug);
  if (!searchParams.tab) {
    return (
      <Splash
        groomName={site.groom_name} brideName={site.bride_name}
        weddingAt={site.wedding_at} nameJoiner={site.name_joiner}
        venueName={site.venue_name} greeting={site.greeting}
        mainPhotoUrl={site.main_photo_url} slug={site.slug}
      />
    );
  }
  // Tab view rendered in Task 4.2
  return <div>탭 뷰 (TODO Task 4.2)</div>;
}
```

- [ ] **Step 5: Manual test**

In admin, publish your draft. Visit `/w/<your-slug>`. Confirm splash renders.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): splash page with theme + loader"
git push
```

---

### Task 4.2: Tabbed shell with hidden-sections logic

**Files:**
- Create: `app/w/[slug]/_components/TabShell.tsx`, `app/w/[slug]/_components/TabBar.tsx`, `app/w/[slug]/_lib/tabs.ts`
- Modify: `app/w/[slug]/page.tsx`

- [ ] **Step 1: Define the tabs in a single source of truth**

```typescript
// app/w/[slug]/_lib/tabs.ts
export type TabKey = "home" | "story" | "gallery" | "guestbook" | "info";
export const TAB_LABELS: Record<TabKey, { icon: string; label: string }> = {
  home: { icon: "🏠", label: "홈" },
  story: { icon: "📖", label: "스토리" },
  gallery: { icon: "📷", label: "사진첩" },
  guestbook: { icon: "💬", label: "일촌평" },
  info: { icon: "📍", label: "더보기" },
};
// info(오시는길) is always enabled (required). The others map to sections_enabled keys.
export function visibleTabs(sectionsEnabled: Record<string, boolean>): TabKey[] {
  const tabs: TabKey[] = ["home"];
  if (sectionsEnabled.story) tabs.push("story");
  if (sectionsEnabled.gallery) tabs.push("gallery");
  if (sectionsEnabled.guestbook) tabs.push("guestbook");
  tabs.push("info"); // always
  return tabs;
}
```

- [ ] **Step 2: TabBar component**

```tsx
// app/w/[slug]/_components/TabBar.tsx
import Link from "next/link";
import { TAB_LABELS, type TabKey } from "../_lib/tabs";

export function TabBar({ slug, tabs, active }: { slug: string; tabs: TabKey[]; active: TabKey }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-bg border-t border-border flex">
      {tabs.map((t) => (
        <Link key={t} href={`/w/${slug}?tab=${t}`}
          className={`flex-1 flex flex-col items-center py-2 ${active === t ? "text-ink font-semibold" : "text-muted"}`}>
          <span>{TAB_LABELS[t].icon}</span>
          <span className="text-xs">{TAB_LABELS[t].label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: TabShell wraps tab content + tabbar + top bar (BGM toggle + share placeholder)**

```tsx
// app/w/[slug]/_components/TabShell.tsx
import { TabBar } from "./TabBar";
import type { TabKey } from "../_lib/tabs";

export function TabShell({
  slug, tabs, active, children,
}: { slug: string; tabs: TabKey[]; active: TabKey; children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex justify-between items-center z-10">
        <span className="text-xs tracking-widest text-muted">WEDDING</span>
        <div id="topbar-controls" className="flex gap-3 text-sm">
          {/* BGM toggle, share — wired in later tasks */}
        </div>
      </header>
      <div className="p-4">{children}</div>
      <TabBar slug={slug} tabs={tabs} active={active} />
    </div>
  );
}
```

- [ ] **Step 4: Wire into `page.tsx`**

```tsx
// app/w/[slug]/page.tsx
import { loadSite } from "./_lib/load-site";
import { Splash } from "./_components/Splash";
import { TabShell } from "./_components/TabShell";
import { visibleTabs, type TabKey } from "./_lib/tabs";

const VALID: TabKey[] = ["home","story","gallery","guestbook","info"];

export default async function PublicPage({
  params, searchParams,
}: { params: { slug: string }; searchParams: { tab?: string } }) {
  const site = await loadSite(params.slug);

  if (!searchParams.tab) {
    return (
      <Splash
        groomName={site.groom_name} brideName={site.bride_name}
        weddingAt={site.wedding_at} nameJoiner={site.name_joiner}
        venueName={site.venue_name} greeting={site.greeting}
        mainPhotoUrl={site.main_photo_url} slug={site.slug}
      />
    );
  }

  const tabs = visibleTabs((site.sections_enabled as any) ?? {});
  const active = (VALID.includes(searchParams.tab as TabKey) ? searchParams.tab : "home") as TabKey;
  if (!tabs.includes(active)) {
    // requested tab is disabled — fallback to home
    return <TabShell slug={site.slug} tabs={tabs} active="home"><HomeTab site={site} /></TabShell>;
  }

  return (
    <TabShell slug={site.slug} tabs={tabs} active={active}>
      {/* HomeTab / StoryTab / etc. dispatched in subsequent tasks; placeholder for now */}
      <div className="text-center text-secondary py-8">탭 = {active}</div>
    </TabShell>
  );
}

// placeholder import — replaced as we add tabs
function HomeTab({ site }: { site: any }) { return <div>홈 (TODO)</div>; }
```

- [ ] **Step 5: Manual test**

`/w/<slug>?tab=home` shows tab shell with bottom tabbar. Disabled sections (e.g., RSVP off) shouldn't change visible tabs (RSVP lives under info).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): tab shell + tabbar with visibility logic"
git push
```

---

### Task 4.3: HomeTab (D-day, photo, names, parents)

**Files:**
- Create: `app/w/[slug]/_components/HomeTab.tsx`, `app/w/[slug]/_components/ParentsLine.tsx`, `lib/date/dday.ts`, `lib/date/dday.test.ts`

- [ ] **Step 1: Failing test for `daysUntil`**

```typescript
// lib/date/dday.test.ts
import { describe, it, expect } from "vitest";
import { daysUntil } from "./dday";

describe("daysUntil", () => {
  it("returns positive count for future date", () => {
    const future = new Date(Date.now() + 5 * 86400_000);
    expect(daysUntil(future.toISOString())).toBe(5);
  });
  it("returns 0 on the same day", () => {
    expect(daysUntil(new Date().toISOString())).toBe(0);
  });
  it("returns negative for past", () => {
    const past = new Date(Date.now() - 3 * 86400_000);
    expect(daysUntil(past.toISOString())).toBe(-3);
  });
});
```

- [ ] **Step 2: Run, confirm fail**

```bash
pnpm test --run lib/date
```

- [ ] **Step 3: Implement**

```typescript
// lib/date/dday.ts
export function daysUntil(iso: string): number {
  const target = new Date(iso);
  const today = new Date();
  const t0 = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const t1 = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.round((t1 - t0) / 86400_000);
}
```

- [ ] **Step 4: Run, confirm pass**

- [ ] **Step 5: ParentsLine renders 故/顯考/顯妣 with warm-brown color**

```tsx
// app/w/[slug]/_components/ParentsLine.tsx
type Entry = { name: string; status: "alive" | "go" | "hyeon" };
function prefix(role: "father" | "mother", status: Entry["status"]) {
  if (status === "go") return <span className="text-deceased font-semibold">故 </span>;
  if (status === "hyeon") return <span className="text-deceased font-semibold">{role === "father" ? "顯考" : "顯妣"} </span>;
  return null;
}
export function ParentsLine({
  father, mother, childLabel, childName,
}: {
  father?: Entry; mother?: Entry; childLabel: string; childName: string;
}) {
  if (!father && !mother) return null;
  return (
    <p className="text-sm text-secondary">
      {father && (<>{prefix("father", father.status)}{father.name}</>)}
      {father && mother && <span> · </span>}
      {mother && (<>{prefix("mother", mother.status)}{mother.name}</>)}
      <span> 의 {childLabel} </span>
      <strong className="text-ink">{childName}</strong>
    </p>
  );
}
```

- [ ] **Step 6: HomeTab**

```tsx
// app/w/[slug]/_components/HomeTab.tsx
import { ParentsLine } from "./ParentsLine";
import { daysUntil } from "@/lib/date/dday";

export function HomeTab({ site }: { site: any }) {
  const dday = site.wedding_at ? daysUntil(site.wedding_at) : null;
  const parents = site.parents ?? {};
  return (
    <div className="text-center space-y-4 pt-4">
      {dday !== null && dday >= 0 && (
        <span className="inline-block bg-ink text-bg px-3 py-1 rounded-pill text-xs tracking-widest">
          D - {dday}
        </span>
      )}
      {site.main_photo_url && (
        <img src={site.main_photo_url} alt="" className="w-full max-w-xs mx-auto aspect-[4/5] object-cover rounded-sm" />
      )}
      <h1 className="text-xl font-medium">{site.groom_name}{site.name_joiner}{site.bride_name}</h1>
      {site.greeting && (
        <p className="text-sm text-secondary whitespace-pre-line max-w-xs mx-auto leading-relaxed">
          {site.greeting}
        </p>
      )}
      <div className="space-y-2 pt-4 border-t border-border max-w-xs mx-auto">
        <ParentsLine
          father={parents.groom_father} mother={parents.groom_mother}
          childLabel="장남" childName={site.groom_name}
        />
        <ParentsLine
          father={parents.bride_father} mother={parents.bride_mother}
          childLabel="장녀" childName={site.bride_name}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire `HomeTab` in page.tsx (replace placeholder)**

```tsx
import { HomeTab } from "./_components/HomeTab";

// inside dispatch:
{active === "home" && <HomeTab site={site} />}
{active === "story" && <div>스토리 (TODO)</div>}
{active === "gallery" && <div>사진첩 (TODO)</div>}
{active === "guestbook" && <div>일촌평 (TODO)</div>}
{active === "info" && <div>더보기 (TODO)</div>}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(public): home tab with D-day, parents (故/顯) rendering"
git push
```

---

### Task 4.4: StoryTab (timeline)

**Files:**
- Create: `app/w/[slug]/_components/StoryTab.tsx`
- Modify: `app/w/[slug]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
// app/w/[slug]/_components/StoryTab.tsx
type Item = { date: string; title: string; body: string };

export function StoryTab({ items }: { items: Item[] }) {
  if (!items.length) return <p className="text-center text-muted py-8">아직 스토리가 없습니다.</p>;
  return (
    <ol className="relative max-w-md mx-auto py-4">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[16px_1fr] gap-3 relative pb-6">
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 rounded-full bg-ink mt-1.5" />
            {i < items.length - 1 && <span className="flex-1 w-px bg-border mt-1" />}
          </div>
          <div>
            <p className="text-xs text-muted tracking-widest">{it.date}</p>
            <h3 className="text-sm font-semibold mt-1">{it.title}</h3>
            {it.body && <p className="text-sm text-secondary mt-1 whitespace-pre-line">{it.body}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Wire in page.tsx**

```tsx
import { StoryTab } from "./_components/StoryTab";

{active === "story" && <StoryTab items={(site.story_items as any[]) ?? []} />}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): story timeline tab"
git push
```

---

### Task 4.5: GalleryTab with lightbox

**Files:**
- Create: `app/w/[slug]/_components/GalleryTab.tsx`

- [ ] **Step 1: Implement (own minimal lightbox — no library)**

```tsx
// app/w/[slug]/_components/GalleryTab.tsx
"use client";
import { useState, useEffect } from "react";

export function GalleryTab({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => i === null ? null : Math.max(0, i - 1));
      if (e.key === "ArrowRight") setOpen((i) => i === null ? null : Math.min(urls.length - 1, i + 1));
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, urls.length]);

  if (!urls.length) return <p className="text-center text-muted py-8">아직 사진이 없습니다.</p>;

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5">
        {urls.map((u, i) => (
          <button key={u} onClick={() => setOpen(i)} className="aspect-square">
            <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
             onClick={() => setOpen(null)}>
          <img src={urls[open]} alt="" className="max-w-full max-h-full object-contain" />
          <button onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            className="absolute top-4 right-4 text-white text-2xl">×</button>
          {open > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl">‹</button>
          )}
          {open < urls.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl">›</button>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Wire + commit**

```tsx
import { GalleryTab } from "./_components/GalleryTab";
{active === "gallery" && <GalleryTab urls={site.gallery_urls ?? []} />}
```

```bash
git add -A
git commit -m "feat(public): gallery with lightbox (arrow keys + click)"
git push
```

---

### Task 4.6: GuestbookTab with realtime

**Files:**
- Create: `app/w/[slug]/_components/GuestbookTab.tsx`, `app/w/[slug]/_actions/guestbook.ts`

- [ ] **Step 1: Server action to post a message**

```typescript
// app/w/[slug]/_actions/guestbook.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function postGuestbook(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!guest_name || !message) return { error: "이름과 메시지를 입력해주세요." };
  if (message.length > 200) return { error: "200자 이하로 입력해주세요." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("guestbook").insert({ site_id: siteId, guest_name, message });
  if (error) return { error: error.message };
  return { ok: true };
}
```

- [ ] **Step 2: GuestbookTab with realtime subscription**

```tsx
// app/w/[slug]/_components/GuestbookTab.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { postGuestbook } from "../_actions/guestbook";

type Entry = { id: string; guest_name: string; message: string; created_at: string };

export function GuestbookTab({
  siteId, initial,
}: { siteId: string; initial: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`guestbook:${siteId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook", filter: `site_id=eq.${siteId}` },
        (payload) => setEntries((prev) => [payload.new as Entry, ...prev])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [siteId]);

  async function handle(formData: FormData) {
    setPending(true); setError(null);
    const result = await postGuestbook(siteId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    else formRef.current?.reset();
  }

  return (
    <div className="space-y-4 max-w-md mx-auto py-2">
      <form ref={formRef} action={handle}
        className="bg-surface border border-border rounded-md p-4 space-y-2 shadow-card">
        <input name="name" required maxLength={30} placeholder="이름 또는 애칭"
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm" />
        <textarea name="message" required maxLength={200} placeholder="축하 메시지 (최대 200자)"
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm h-16" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button disabled={pending} className="px-4 py-1.5 bg-ink text-bg rounded-pill text-sm float-right">
          {pending ? "남기는 중..." : "남기기"}
        </button>
        <div className="clear-both" />
      </form>

      <p className="text-xs text-muted text-center">총 {entries.length}개</p>

      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="bg-surface border border-border rounded-md p-3 shadow-card">
            <p className="text-sm font-semibold">{e.guest_name}</p>
            <p className="text-sm text-secondary mt-1">{e.message}</p>
            <p className="text-xs text-muted mt-1">{new Date(e.created_at).toLocaleString("ko-KR")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Loader for initial guestbook**

In `page.tsx`, after loading site, fetch the initial 50 guestbook entries:

```tsx
const supabase = createSupabaseServerClient();
const { data: initialGuestbook } = await supabase
  .from("guestbook")
  .select("*")
  .eq("site_id", site.id)
  .order("created_at", { ascending: false })
  .limit(50);

// inside dispatch:
{active === "guestbook" && (
  <GuestbookTab siteId={site.id} initial={initialGuestbook ?? []} />
)}
```

- [ ] **Step 4: Enable Realtime in Supabase**

Supabase dashboard → Database → Replication → enable for `guestbook` table.

- [ ] **Step 5: Manual test**

Open two browser windows on the guestbook tab. Submit from one — should appear in the other within 1-2 seconds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): guestbook tab with realtime + post"
git push
```

---

### Task 4.7: InfoTab — Venue (Kakao Map + Naver navigation)

**Files:**
- Create: `app/w/[slug]/_components/InfoTab.tsx`, `app/w/[slug]/_components/VenueView.tsx`, `app/w/[slug]/_components/KakaoMap.tsx`

- [ ] **Step 1: Kakao Map client component (loads SDK on demand)**

```tsx
// app/w/[slug]/_components/KakaoMap.tsx
"use client";
import { useEffect, useRef } from "react";

declare global { interface Window { kakao: any } }

export function KakaoMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!KEY) return;

    function init() {
      if (!ref.current || !window.kakao?.maps) return;
      window.kakao.maps.load(() => {
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(ref.current, { center, level: 4 });
        const marker = new window.kakao.maps.Marker({ position: center });
        marker.setMap(map);
        const info = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;">${name}</div>`,
        });
        info.open(map, marker);
      });
    }

    if (window.kakao?.maps) { init(); return; }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
    script.onload = init;
    document.head.appendChild(script);
  }, [lat, lng, name]);

  return <div ref={ref} className="w-full h-64 rounded-md border border-border" />;
}
```

- [ ] **Step 2: VenueView (uses KakaoMap, has Naver directions + copy buttons)**

```tsx
// app/w/[slug]/_components/VenueView.tsx
"use client";
import { useState } from "react";
import { KakaoMap } from "./KakaoMap";

type Props = { name: string; address: string; lat: number | null; lng: number | null };

export function VenueView({ name, address, lat, lng }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const naverUrl =
    lat != null && lng != null
      ? `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=wedding-zip`
      : null;
  const naverWebFallback =
    lat != null && lng != null
      ? `https://map.naver.com/v5/directions/-/-/-/${lng},${lat},${encodeURIComponent(name)},,/public`
      : null;

  return (
    <div className="space-y-4">
      {lat != null && lng != null
        ? <KakaoMap lat={lat} lng={lng} name={name} />
        : <p className="text-sm text-muted text-center py-6">아직 식장 위치가 설정되지 않았습니다.</p>}

      <div className="bg-surface border border-border rounded-md p-3">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-sm text-secondary mt-1">{address}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={copyAddress}
          className="flex-1 p-2 border border-ink rounded-pill text-sm">
          {copied ? "복사됨 ✓" : "📋 주소 복사"}
        </button>
        {naverUrl && (
          <a href={naverUrl} onClick={(e) => {
            // fallback to web if app not installed
            setTimeout(() => { window.location.href = naverWebFallback!; }, 800);
          }} className="flex-1 p-2 border border-ink rounded-pill text-sm text-center">
            🚗 길찾기
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: InfoTab — sub-tabs (오시는길 / RSVP / 마음전하기 / 프로필) — uses URL query `?sub=`**

```tsx
// app/w/[slug]/_components/InfoTab.tsx
import Link from "next/link";
import { VenueView } from "./VenueView";

type SubKey = "venue" | "rsvp" | "account" | "profile";
const SUB_LABELS: Record<SubKey, string> = {
  venue: "오시는길", rsvp: "RSVP", account: "마음전하기", profile: "프로필",
};

export function InfoTab({
  site, sub,
}: { site: any; sub: SubKey | null }) {
  const enabled = (site.sections_enabled as any) ?? {};
  const subs: SubKey[] = ["venue"];
  if (enabled.rsvp) subs.push("rsvp");
  if (enabled.account) subs.push("account");
  if (enabled.profile) subs.push("profile");

  const active: SubKey = sub && subs.includes(sub) ? sub : "venue";

  return (
    <div className="space-y-4">
      <nav className="flex gap-2 overflow-x-auto">
        {subs.map((s) => (
          <Link key={s} href={`/w/${site.slug}?tab=info&sub=${s}`}
            className={`px-3 py-1 rounded-pill text-xs whitespace-nowrap ${
              active === s ? "bg-ink text-bg" : "bg-bg border border-border"
            }`}>
            {SUB_LABELS[s]}
          </Link>
        ))}
      </nav>
      {active === "venue" && (
        <VenueView name={site.venue_name} address={site.venue_address} lat={site.venue_lat} lng={site.venue_lng} />
      )}
      {/* rsvp / account / profile rendered in next tasks */}
    </div>
  );
}
```

- [ ] **Step 4: Wire into page.tsx and pass `searchParams.sub`**

```tsx
{active === "info" && <InfoTab site={site} sub={(searchParams.sub as any) ?? null} />}
```

- [ ] **Step 5: Manual test**

Open `/w/<slug>?tab=info`. Map loads, copy address works (browser HTTPS required for clipboard on Vercel — fine, localhost works too). Click 길찾기 — on mobile phone tests it opens Naver Map app or falls back to web.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): info tab with Kakao map + Naver directions + copy"
git push
```

---

### Task 4.8: InfoTab — RSVP form, Account view, Profile view

**Files:**
- Create: `app/w/[slug]/_components/RsvpView.tsx`, `app/w/[slug]/_actions/rsvp.ts`, `app/w/[slug]/_components/AccountView.tsx`, `app/w/[slug]/_components/ProfileView.tsx`
- Modify: `app/w/[slug]/_components/InfoTab.tsx`

- [ ] **Step 1: RSVP server action**

```typescript
// app/w/[slug]/_actions/rsvp.ts
"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function postRsvp(siteId: string, formData: FormData) {
  const guest_name = String(formData.get("name") ?? "").trim();
  const attending = formData.get("attending") === "yes";
  const party_size = Math.max(1, Math.min(20, Number(formData.get("party_size") ?? 1)));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!guest_name) return { error: "이름을 입력해주세요." };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("rsvp").insert({
    site_id: siteId, guest_name, attending, party_size, phone, message,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
```

- [ ] **Step 2: RsvpView**

```tsx
// app/w/[slug]/_components/RsvpView.tsx
"use client";
import { useState } from "react";
import { postRsvp } from "../_actions/rsvp";

export function RsvpView({ siteId }: { siteId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true); setError(null);
    const result = await postRsvp(siteId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done) return (
    <div className="text-center py-12 space-y-3">
      <p className="text-lg">참석 알려주셔서 감사합니다 💛</p>
      <p className="text-sm text-secondary">결혼식에서 만나요</p>
    </div>
  );

  return (
    <form action={handle} className="bg-surface border border-border rounded-md p-4 space-y-3 shadow-card">
      <p className="text-sm text-secondary">뒤풀이 참석 여부를 알려주세요</p>
      <input name="name" required maxLength={30} placeholder="이름"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm" />
      <input name="phone" placeholder="연락처 (선택)"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm" />

      <div className="flex gap-3">
        <label className="flex-1 flex items-center gap-2 p-2 bg-bg rounded-sm">
          <input type="radio" name="attending" value="yes" required /> 참석
        </label>
        <label className="flex-1 flex items-center gap-2 p-2 bg-bg rounded-sm">
          <input type="radio" name="attending" value="no" required /> 불참
        </label>
      </div>

      <label className="block">
        <span className="text-xs text-secondary">인원수</span>
        <input name="party_size" type="number" min={1} max={20} defaultValue={1}
          className="w-full p-2 rounded-sm border border-border bg-bg text-sm" />
      </label>

      <textarea name="message" maxLength={200} placeholder="메시지 (선택)"
        className="w-full p-2 rounded-sm border border-border bg-bg text-sm h-16" />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button disabled={pending} className="w-full p-2 bg-ink text-bg rounded-pill text-sm">
        {pending ? "보내는 중..." : "응답 보내기"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: AccountView with copy-on-click**

```tsx
// app/w/[slug]/_components/AccountView.tsx
"use client";
import { useState } from "react";

type Acc = { bank?: string; account?: string; holder?: string } | null;
type Info = { groom?: { self?: Acc; father?: Acc; mother?: Acc }; bride?: { self?: Acc; father?: Acc; mother?: Acc } };

function Card({ label, acc }: { label: string; acc: Acc }) {
  const [copied, setCopied] = useState(false);
  if (!acc || !acc.account) return null;
  async function copy() {
    await navigator.clipboard.writeText(acc!.account!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <button onClick={copy}
      className="w-full text-left bg-surface border border-border rounded-md p-3 shadow-card">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold mt-1">{acc.bank} · {acc.holder}</p>
      <p className="text-sm text-secondary mt-0.5 font-mono">{acc.account}</p>
      <p className="text-xs mt-1 text-accent">{copied ? "복사됨 ✓" : "탭하면 계좌번호 복사"}</p>
    </button>
  );
}

export function AccountView({ info }: { info: Info }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-secondary">신랑측</h3>
        <Card label="신랑" acc={info.groom?.self ?? null} />
        <Card label="신랑 아버지" acc={info.groom?.father ?? null} />
        <Card label="신랑 어머니" acc={info.groom?.mother ?? null} />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-secondary">신부측</h3>
        <Card label="신부" acc={info.bride?.self ?? null} />
        <Card label="신부 아버지" acc={info.bride?.father ?? null} />
        <Card label="신부 어머니" acc={info.bride?.mother ?? null} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: ProfileView**

```tsx
// app/w/[slug]/_components/ProfileView.tsx
type Profile = { mbti?: string; intro?: string };
export function ProfileView({
  groom, groomName, bride, brideName,
}: { groom: Profile; groomName: string; bride: Profile; brideName: string }) {
  function Card({ label, name, p }: { label: string; name: string; p: Profile }) {
    if (!p.mbti && !p.intro) return null;
    return (
      <div className="bg-surface border border-border rounded-md p-4 shadow-card">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-base font-semibold mt-1">{name}</p>
        {p.mbti && <p className="text-sm text-accent mt-1">{p.mbti}</p>}
        {p.intro && <p className="text-sm text-secondary mt-2 whitespace-pre-line">{p.intro}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Card label="신랑" name={groomName} p={groom} />
      <Card label="신부" name={brideName} p={bride} />
    </div>
  );
}
```

- [ ] **Step 5: Wire into InfoTab**

```tsx
// app/w/[slug]/_components/InfoTab.tsx — extend with the 3 new views:
import { RsvpView } from "./RsvpView";
import { AccountView } from "./AccountView";
import { ProfileView } from "./ProfileView";

// inside the dispatch:
{active === "rsvp" && <RsvpView siteId={site.id} />}
{active === "account" && <AccountView info={(site.account_info as any) ?? {}} />}
{active === "profile" && (
  <ProfileView
    groom={(site.groom_profile as any) ?? {}}
    groomName={site.groom_name}
    bride={(site.bride_profile as any) ?? {}}
    brideName={site.bride_name}
  />
)}
```

- [ ] **Step 6: Manual test all 4 sub-tabs + commit**

```bash
git add -A
git commit -m "feat(public): RSVP form + account + profile views"
git push
```

---

### Task 4.9: BGM player (global) + top-bar controls

**Files:**
- Create: `app/w/[slug]/_components/BgmPlayer.tsx`, `lib/storage/local.ts`
- Modify: `app/w/[slug]/_components/TabShell.tsx`

- [ ] **Step 1: BgmPlayer component (singleton-ish, mounted in TabShell)**

```tsx
// app/w/[slug]/_components/BgmPlayer.tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Track = { order: number; url: string; title: string; artist: string | null };

export function BgmPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pulse, setPulse] = useState(true);

  // user must tap once due to autoplay policy
  function start() {
    if (!audioRef.current || tracks.length === 0) return;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    setPulse(false);
  }
  function pause() { audioRef.current?.pause(); setPlaying(false); }
  function next() {
    if (!tracks.length) return;
    setIdx((i) => (i + 1) % tracks.length);
  }

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = tracks[idx]?.url ?? "";
    if (playing) audioRef.current.play().catch(() => {});
  }, [idx, tracks, playing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} onEnded={next} preload="metadata" />
      <button
        onClick={playing ? pause : start}
        className={`text-base ${pulse && !playing ? "animate-pulse" : ""}`}
        aria-label={playing ? "BGM 정지" : "BGM 재생"}>
        {playing ? "🔊" : "🔇"}
      </button>
      {tracks.length > 1 && playing && (
        <button onClick={next} aria-label="다음 곡" className="text-sm">⏭</button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Mount in TabShell**

```tsx
// app/w/[slug]/_components/TabShell.tsx — modify to accept tracks:
import { BgmPlayer } from "./BgmPlayer";

export function TabShell({
  slug, tabs, active, bgmTracks, children,
}: {
  slug: string; tabs: TabKey[]; active: TabKey;
  bgmTracks: any[]; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 bg-bg/95 backdrop-blur border-b border-border px-4 py-3 flex justify-between items-center z-10">
        <span className="text-xs tracking-widest text-muted">WEDDING</span>
        <div className="flex gap-3 text-sm items-center">
          <BgmPlayer tracks={bgmTracks} />
          {/* share button in next task */}
        </div>
      </header>
      <div className="p-4">{children}</div>
      <TabBar slug={slug} tabs={tabs} active={active} />
    </div>
  );
}
```

- [ ] **Step 3: Pass tracks from page**

```tsx
<TabShell slug={site.slug} tabs={tabs} active={active} bgmTracks={(site.bgm_tracks as any[]) ?? []}>
```

- [ ] **Step 4: Manual test**

Tap 🔇 → playback starts. Tap again → pauses. ⏭ advances. End of last track → loops to first.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(public): global BGM player with playlist loop and pulse hint"
git push
```

---

### Task 4.10: KakaoTalk share button

**Files:**
- Create: `app/w/[slug]/_components/ShareButton.tsx`, `lib/kakao/load-sdk.ts`
- Modify: `app/w/[slug]/_components/TabShell.tsx`, `app/(auth)/login/page.tsx` (no — actually `app/layout.tsx` not needed)

- [ ] **Step 1: SDK loader (singleton)**

```typescript
// lib/kakao/load-sdk.ts
declare global { interface Window { Kakao: any } }

let loaded = false;

export function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loaded || (typeof window !== "undefined" && window.Kakao?.isInitialized?.())) {
      resolve(); return;
    }
    if (typeof document === "undefined") return reject();
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.integrity = "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_SHARE_KEY);
      loaded = true; resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

- [ ] **Step 2: ShareButton component**

```tsx
// app/w/[slug]/_components/ShareButton.tsx
"use client";
import { loadKakaoSdk } from "@/lib/kakao/load-sdk";

type Props = { url: string; title: string; description: string; imageUrl: string | null };

export function ShareButton({ url, title, description, imageUrl }: Props) {
  async function share() {
    try {
      await loadKakaoSdk();
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title, description, imageUrl: imageUrl ?? `${url}/og.png`,
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
    } catch {
      // fallback to navigator.share
      if (navigator.share) navigator.share({ title, text: description, url });
      else navigator.clipboard.writeText(url);
    }
  }

  return (
    <button onClick={share} aria-label="카톡 공유" className="text-base">📤</button>
  );
}
```

- [ ] **Step 3: Wire into TabShell**

```tsx
// in TabShell, accept additional props for share:
import { ShareButton } from "./ShareButton";

<ShareButton
  url={shareUrl}
  title={shareTitle}
  description={shareDescription}
  imageUrl={mainPhotoUrl}
/>
```

Update TabShell signature and page.tsx accordingly:

```tsx
// page.tsx:
<TabShell
  slug={site.slug} tabs={tabs} active={active}
  bgmTracks={(site.bgm_tracks as any[]) ?? []}
  shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/w/${site.slug}`}
  shareTitle={`${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식에 초대합니다`}
  shareDescription={site.wedding_at ? new Date(site.wedding_at).toLocaleDateString("ko-KR") : ""}
  mainPhotoUrl={site.main_photo_url}
>
```

- [ ] **Step 4: Add Kakao app key to env (reuse JS key)**

```
NEXT_PUBLIC_KAKAO_SHARE_KEY=<same JS key>
```

(Same Kakao app, same JS key works for both Maps and Share.)

- [ ] **Step 5: Manual test**

On a mobile phone (or KakaoTalk web), tap 📤 — Kakao share dialog appears with title + image + URL.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(public): KakaoTalk share button with feed template"
git push
```

---

## Phase 5 — Admin Tools (Guestbook moderation, RSVP list)

### Task 5.1: Guestbook moderation page

**Files:**
- Create: `app/admin/guestbook/page.tsx`, `app/admin/guestbook/actions.ts`

- [ ] **Step 1: Server action to delete**

```typescript
// app/admin/guestbook/actions.ts
"use server";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteGuestbookEntry(id: string) {
  await requireUser();
  const supabase = createSupabaseServerClient();
  // RLS ensures only owner can delete
  await supabase.from("guestbook").delete().eq("id", id);
  revalidatePath("/admin/guestbook");
}
```

- [ ] **Step 2: Page**

```tsx
// app/admin/guestbook/page.tsx
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteGuestbookEntry } from "./actions";

export default async function GuestbookAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("guestbook").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">일촌평 ({data?.length ?? 0}개)</h1>
      <ul className="space-y-2">
        {data?.map((e) => (
          <li key={e.id} className="bg-surface border border-border rounded-md p-3 flex justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{e.guest_name}</p>
              <p className="text-sm text-secondary">{e.message}</p>
              <p className="text-xs text-muted mt-1">{new Date(e.created_at).toLocaleString("ko-KR")}</p>
            </div>
            <form action={deleteGuestbookEntry.bind(null, e.id)}>
              <button className="text-xs text-red-600 self-start">삭제</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 3: Add nav link from `/admin`**

In `app/admin/page.tsx` header:

```tsx
<Link href="/admin/guestbook" className="text-sm underline">일촌평 관리</Link>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(admin): guestbook moderation page"
git push
```

---

### Task 5.2: RSVP list + CSV export

**Files:**
- Create: `app/admin/rsvp/page.tsx`, `app/admin/rsvp/csv/route.ts`

- [ ] **Step 1: RSVP list page**

```tsx
// app/admin/rsvp/page.tsx
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RsvpAdmin() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("rsvp").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: false });

  const attending = data?.filter((r) => r.attending) ?? [];
  const totalGuests = attending.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">RSVP</h1>
        <a href="/admin/rsvp/csv" download
          className="text-sm px-3 py-1.5 bg-ink text-bg rounded-pill">CSV 다운로드</a>
      </header>

      <div className="bg-surface border border-border rounded-md p-4 grid grid-cols-3 gap-3 text-center">
        <div><p className="text-xs text-muted">전체 응답</p><p className="text-2xl font-semibold">{data?.length ?? 0}</p></div>
        <div><p className="text-xs text-muted">참석</p><p className="text-2xl font-semibold">{attending.length}</p></div>
        <div><p className="text-xs text-muted">총 인원</p><p className="text-2xl font-semibold">{totalGuests}</p></div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr><th className="p-2 text-left">이름</th><th className="p-2">참석</th><th className="p-2">인원</th><th className="p-2">연락처</th></tr>
        </thead>
        <tbody>
          {data?.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="p-2">{r.guest_name}</td>
              <td className="p-2 text-center">{r.attending ? "✓" : "✗"}</td>
              <td className="p-2 text-center">{r.party_size}</td>
              <td className="p-2 text-secondary">{r.phone ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

- [ ] **Step 2: CSV download route**

```typescript
// app/admin/rsvp/csv/route.ts
import { requireUser } from "@/lib/auth/require-user";
import { getOrCreateSiteForOwner } from "@/lib/db/wedding-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function escape(s: string) { return `"${(s ?? "").replace(/"/g, '""')}"`; }

export async function GET() {
  const user = await requireUser();
  const site = await getOrCreateSiteForOwner(user.id);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("rsvp").select("*").eq("site_id", site.id)
    .order("created_at", { ascending: true });

  const header = ["이름","참석","인원","연락처","메시지","응답시각"].map(escape).join(",");
  const rows = (data ?? []).map((r) => [
    r.guest_name, r.attending ? "참석" : "불참",
    String(r.party_size), r.phone ?? "", r.message ?? "",
    new Date(r.created_at).toLocaleString("ko-KR"),
  ].map(escape).join(",")).join("\n");

  // ﻿ BOM for Excel to recognize UTF-8 Korean
  const csv = "﻿" + header + "\n" + rows;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="rsvp-${site.slug}.csv"`,
    },
  });
}
```

- [ ] **Step 3: Add link to admin nav, commit**

```tsx
// app/admin/page.tsx header:
<Link href="/admin/rsvp" className="text-sm underline">RSVP</Link>
```

```bash
git add -A
git commit -m "feat(admin): RSVP list + CSV export with Excel-friendly BOM"
git push
```

---

### Task 5.3: Preview link in admin

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add preview banner**

```tsx
// at top of AdminHome:
{site.slug && (
  <div className="bg-surface border border-border rounded-md p-3 flex justify-between items-center">
    <p className="text-sm">내 청첩장: <code className="font-mono">/w/{site.slug}</code></p>
    <a href={`/w/${site.slug}`} target="_blank" className="text-sm underline">미리보기 ↗</a>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(admin): preview link to public site"
git push
```

---

## Phase 6 — Polish

### Task 6.1: 404 + robots.txt + landing page

**Files:**
- Create: `app/not-found.tsx`, `app/robots.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: 404 page**

```tsx
// app/not-found.tsx
import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-3">
      <p className="text-3xl">404</p>
      <p className="text-secondary">청첩장을 찾을 수 없습니다.</p>
      <Link href="/" className="text-sm underline">메인으로</Link>
    </main>
  );
}
```

- [ ] **Step 2: robots.txt**

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: ["/admin", "/w"] }, sitemap: undefined };
}
```

(Disallow `/w/*` blocks search engines from indexing personal invitations.)

- [ ] **Step 3: Replace landing with proper marketing intro**

```tsx
// app/page.tsx
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-5 max-w-md mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight">wedding-zip</h1>
      <p className="text-secondary leading-relaxed">
        싸이월드 미니홈피 감성 모바일 청첩장.<br />
        폼만 채우면 나만의 청첩장 사이트가 만들어져요.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="px-5 py-2.5 bg-ink text-bg rounded-pill text-sm">내 청첩장 만들기</Link>
        <Link href="/login" className="px-5 py-2.5 border border-ink rounded-pill text-sm">로그인</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 404 page, robots.txt block /admin and /w, landing intro"
git push
```

---

### Task 6.2: OG metadata for public sites

**Files:**
- Modify: `app/w/[slug]/page.tsx`

- [ ] **Step 1: Generate metadata per site**

```tsx
// app/w/[slug]/page.tsx — add at top:
import type { Metadata } from "next";
import { loadSite } from "./_lib/load-site";

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const site = await loadSite(params.slug);
  const title = `${site.groom_name}${site.name_joiner}${site.bride_name} 결혼식`;
  const description = site.greeting?.slice(0, 80) || "결혼식에 초대합니다";
  return {
    title,
    description,
    openGraph: {
      title, description,
      images: site.main_photo_url ? [site.main_photo_url] : [],
      type: "website",
    },
  };
}
```

- [ ] **Step 2: Manual test**

Share `/w/<slug>` URL via KakaoTalk → preview shows correct title + photo.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(public): per-site OG metadata for share previews"
git push
```

---

### Task 6.3: Playwright smoke test (signup → admin → publish → public)

**Files:**
- Create: `playwright.config.ts`, `e2e/full-flow.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 2: Config**

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "pnpm dev", port: 3000, reuseExistingServer: true },
});
```

- [ ] **Step 3: Smoke test**

```typescript
// e2e/full-flow.spec.ts
import { test, expect } from "@playwright/test";

const stamp = Date.now();
const email = `test-${stamp}@example.com`;
const password = "weddingtest1234";
const slug = `e2e-${stamp}`;

test("signup → fill admin → publish → public site loads", async ({ page }) => {
  // Signup
  await page.goto("/signup");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin/);

  // Fill basic info
  await page.fill('input[name="slug"]', slug);
  await page.fill('input[name="groom_name"]', "테스트신랑");
  await page.fill('input[name="bride_name"]', "테스트신부");
  // Publish + save
  await page.check('input[name="published"]');
  await page.click('button[type="submit"]');

  // Visit public
  await page.goto(`/w/${slug}`);
  await expect(page.locator("h1")).toContainText("테스트신랑");
});
```

- [ ] **Step 4: Run**

```bash
pnpm exec playwright test
```

Expected: passes.

- [ ] **Step 5: Add npm script + commit**

```json
"e2e": "playwright test"
```

```bash
git add -A
git commit -m "test(e2e): full flow signup → admin → publish → public"
git push
```

---

### Task 6.4: User's own wedding content + final publish

**Files:** None (just data entry through admin form)

- [ ] **Step 1: Log in to production**

Visit `https://wedding-zip.vercel.app/signup` and sign up with your real email.

- [ ] **Step 2: Fill every section**

Walk through admin form top to bottom. Include real names, date, venue (geocode), 4 parents, sections, account info, theme.

- [ ] **Step 3: Upload real photos and BGM**

Main photo + 8-12 gallery photos. 1-2 BGM tracks.

- [ ] **Step 4: Toggle published, save**

- [ ] **Step 5: Visit `https://wedding-zip.vercel.app/w/<your-slug>` on phone**

Check splash, all tabs, BGM, copy address, navigate.

- [ ] **Step 6: Share via KakaoTalk to yourself**

Verify OG preview renders.

---

## Self-Review

### Spec coverage check

Walking through each spec section to confirm a task implements it:

| Spec § | Topic | Task(s) |
|---|---|---|
| 3-1 | 어드민 사용자 흐름 | 2.2, 2.3, 2.4, 3.1–3.8 |
| 3-2 | 손님 흐름 | 4.1–4.10 |
| 4 | v1 스코프 (모든 항목) | Phase 0–6 |
| 5 | 시스템 아키텍처 | 1.1, 2.1, 4.1 |
| 6-1 | wedding_sites 테이블 | 1.2 |
| 6-1 | parents JSONB + 故 렌더링 | 3.3, 4.3 (ParentsLine) |
| 6-1 | account_info JSONB | 3.8 (AccountSection), 4.8 (AccountView) |
| 6-1 | sections_enabled | 3.8, 4.2 (visibleTabs), 4.7 (InfoTab subs) |
| 6-1 | bgm_tracks max 5 | 3.6, 4.9 |
| 6-2 | guestbook/rsvp | 1.3 |
| 6-3 | RLS 정책 | 1.4 |
| 6-4 | Storage 버킷·정책 | 1.5, 3.5, 3.6 |
| 7 | URL 라우팅 | All public + admin routes |
| 8 | 스플래시 + 5탭 | 4.1, 4.2 |
| 8 | 우상단 상시 (BGM + 공유) | 4.9, 4.10 |
| 9 | BGM 시스템 (펄스·loop·2초 페이드) | 4.9 |
| 9 | 일촌평 realtime | 4.6 |
| 9 | 사진첩 라이트박스 | 4.5 |
| 9 | 오시는길 (카카오맵 + 네이버 길찾기) | 4.7 |
| 9 | RSVP 감사화면 | 4.8 |
| 9 | 마음전하기 복사 | 4.8 |
| 9 | 카톡 공유 | 4.10 |
| 10 | 디자인 토큰·테마 6종·폰트·여백 | 0.2 |
| 10 | 故 한자 색상 #8B5A3C | 0.2 (CSS), 4.3 (component) |
| 10 | 싸이 디테일 (펄스·도트·카드) | 4.9 (pulse), 4.4 (story dots), 4.6 (cards) |
| 10 | 이름 구분 기호 ♡ | 3.2 (selector), 4.1 (render) |
| 11 | 기술 스택·환경 변수 | 0.1, 0.2, 1.1, 3.4, 4.10 |
| 12 | 어드민 폼 필드 | 3.2–3.8 |
| 13 | 배포 흐름 | 0.3, 1.1, 1.2, etc. |
| 14 | 운영 (모더레이션·CSV) | 5.1, 5.2 |

**Gaps found:**

- BGM 2초 페이드 (Phase 9 spec mentions this) — not implemented in Task 4.9. Minor polish. **Add as v1.1 if not done in 4.9 fade is a stretch goal.** Marking as intentional omission for v1 — keep playback simple.
- "곡 사이 2초 페이드" → adjust Task 4.9 BgmPlayer to add a 1.5s fade-out when track ends and fade-in on next track. Optional polish — not in v1 critical path.

### Placeholder scan

- All "TODO" comments removed in dispatch lines after each tab is wired in.
- One remaining: in Task 4.10, the `og.png` fallback path is referenced but not generated. v1 acceptable since `main_photo_url` is the actual fallback. No placeholder gap that blocks shipping.

### Type consistency check

- `validateSlug` returns `SlugCheck` (discriminated union) — used in API route ✓
- `Tables<"wedding_sites">` from generated types — used in admin form ✓
- `TabKey` exported from `_lib/tabs.ts`, imported in TabBar, TabShell, page.tsx ✓
- `Track` type in BgmPlayer matches DB shape `bgm_tracks` ✓
- `parents` shape in admin (`groom_father` keys) matches public render (`ParentsLine` props) ✓

### Scope check

- Single product, all features for v1 are buildable in this plan as written.
- Estimated total work: ~40-60 focused hours. Phase 0-1 (foundation + DB) ≈ 4 hours. Phase 2 (auth) ≈ 3 hours. Phase 3 (admin form) ≈ 15-20 hours. Phase 4 (public site) ≈ 15-20 hours. Phase 5-6 (admin tools + polish) ≈ 5-8 hours.

### Ambiguity check

- "What does '故 표시' mean visually?" → resolved: warm brown #8B5A3C font color, no other decoration. Documented in Task 0.2 CSS + Task 4.3 ParentsLine.
- "Where exactly do parents show?" → spec § 8.4 says "홈 탭". Implemented in Task 4.3.
- "When can a user re-pick slug?" → at any time via admin form; uniqueness re-validated server-side in Task 3.2.

---

## Execution Handoff

**Plan complete and saved to** `docs/superpowers/plans/2026-06-03-wedding-zip-implementation.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — A fresh subagent runs each task; I review between tasks. Fastest iteration, isolated context per task, less drift.

**2. Inline Execution** — Tasks executed in the current session via `superpowers:executing-plans`. Batch execution with periodic review checkpoints.

**Which approach?**
