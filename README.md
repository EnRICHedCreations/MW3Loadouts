# LOADOUT VAULT · MW3

A community site for sharing Modern Warfare 3 loadouts with a full CoD military aesthetic.

## Features
- Submit loadouts with screenshot, attachments, author tag, weapon class
- Browse all community loadouts in a grid feed
- Detail page for each loadout with formatted attachment breakdown
- Full MW3 military UI theme (Bebas Neue, scanlines, green-on-black palette)

---

## Setup

### 1. Supabase (Database + Storage)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-setup.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

That's it — Vercel handles the Next.js build automatically.

---

## Project Structure

```
app/
  page.tsx              # Home feed (all loadouts)
  page.module.css
  layout.tsx            # Root layout + fonts
  globals.css           # CSS variables + base styles
  submit/
    page.tsx            # Submit loadout form
    submit.module.css
  loadout/[id]/
    page.tsx            # Individual loadout detail
    loadout.module.css
lib/
  supabase.ts           # Supabase client + types
supabase-setup.sql      # DB + storage setup
```
