# TOOLS.md - Local Notes

## Supabase Keys (Current)
| Key | Value | Where to get |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bvoaijksstjzseiywylf.supabase.co` | Project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_SrQxMX-JJqE-EW2Rgr8fgg_9s0mp4ez` | Project settings → API |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ⚠️ NEVER commit - keep in 1Password/Vault |

## Environment Security Rules
1. ✅ Public keys (URL, publishable key) → OK in `.env.local`, committed to repo
2. ❌ Secret keys (service role, access tokens) → NEVER commit, use env vars at runtime
3. `.env.local` is in `.gitignore` - safe for local dev
4. For Vercel: add secrets in Vercel dashboard → Environment Variables

## Current .env.local Contents
```
NEXT_PUBLIC_SUPABASE_URL=https://bvoaijksstjzseiywylf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_SrQxMX-JJqE-EW2Rgr8fgg_9s0mp4ez
```

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + SSR
- **Deployment**: Vercel

---
*Last updated: 2026-03-27*