# Echolok8 - Technical Design Document

## What Is This?

Echolok8 is a research intelligence tool that surfaces actionable signals from companies using public data sources. Originally designed for sales AEs to monitor their book of business, it's equally useful for **job seekers** researching prospective employers.

**Core Value Prop:** Instead of manually checking HN, TechCrunch, LinkedIn, job boards, etc. for company news, the app aggregates signals in one place with AI-generated "play recommendations" for outreach timing.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Auth | Supabase Auth |
| Database | Supabase (Postgres) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Hosting | Vercel (target) |
| Package Manager | pnpm |

---

## Current Architecture

```
app/
├── (protected)/          # Auth-required routes
│   ├── dashboard/        # Main dashboard
│   ├── onboarding/       # New user flow
│   └── roadmap/          # Feature roadmap
├── auth/                 # Login, sign-up, callbacks
├── demo/                 # Demo mode (no auth required)
└── api/
    └── scan/             # Scan endpoint

components/
├── dashboard/            # Dashboard UI components
├── demo/                 # Demo-specific components
├── onboarding/           # Onboarding wizard
├── roadmap/              # Roadmap view
└── ui/                   # shadcn/ui primitives

lib/
├── scanners/             # Data source integrations
│   ├── hacker-news.ts    # HN Algolia API
│   ├── github.ts         # GitHub public API
│   ├── job-boards.ts     # Greenhouse/Lever scraping
│   ├── techcrunch.ts     # TechCrunch RSS
│   ├── google-news.ts    # Google News RSS
│   ├── pr-newswire.ts    # PR Newswire RSS
│   └── company-blog.ts   # Blog discovery + RSS
├── supabase/             # Supabase client setup
└── types.ts              # TypeScript definitions
```

---

## Database Schema

```sql
-- User's tracked companies
accounts (id, user_id, name, domain, industry, employee_count, notes)

-- Scan execution history
scans (id, user_id, account_id, status, started_at, completed_at, error_message)

-- Detected signals per scan
signals (id, user_id, account_id, scan_id, source, type, title, snippet, url, score, play_recommendation, detected_at)

-- API response cache (avoid re-fetching)
cached_results (id, source, query_key, response_data, cached_at, expires_at)
```

All tables have RLS enabled - users can only see their own data.

---

## Data Sources

| Source | Method | Status | Notes |
|--------|--------|--------|-------|
| Hacker News | Algolia API | Working | Free, no auth |
| GitHub | Public API | Working | 60 req/hr unauthenticated |
| Greenhouse | URL scraping | Working | Direct job board scraping |
| Lever | URL scraping | Working | Direct job board scraping |
| TechCrunch | RSS feed | Implemented | Untested in prod |
| Google News | RSS feed | Implemented | Untested in prod |
| PR Newswire | RSS feed | Implemented | Untested in prod |
| Company Blog | RSS discovery | Implemented | Tries blog.domain.com, domain.com/blog |

---

## What Works

- [x] Auth flow (sign up, login, logout)
- [x] Demo mode with sample data
- [x] Add/delete accounts
- [x] Run scans (calls all scanners in parallel)
- [x] Display signals with scores and play recommendations
- [x] Light/dark theme toggle
- [x] Onboarding wizard for new users
- [x] Database schema with RLS

---

## Known Issues / Needs Work

### Critical
1. **Supabase redirect URL** - Email confirmation links redirect to `localhost:3000` instead of the deployed URL. Need to configure redirect URLs in Supabase dashboard or deploy to Vercel first.

### High Priority
2. **RSS scanners untested** - TechCrunch, Google News, PR Newswire, Company Blog scanners are implemented but haven't been tested against real data.
3. **Error handling** - Scanners fail silently in some cases. Need better error surfacing to users.
4. **No refresh/re-scan UX** - Can only scan once per click, no auto-refresh or scheduled scans.

### Medium Priority
5. **Play recommendations are basic** - Currently hardcoded strings based on signal type. Could use actual AI (OpenAI/Anthropic) to generate contextual recommendations.
6. **No signal deduplication** - Same story from multiple sources shows as multiple signals.
7. **Mobile UX** - Works but not optimized for mobile.
8. **No search/filter** - Can't search signals or filter by source/type.

### Nice to Have
9. **Notifications** - Email/Slack alerts for high-score signals
10. **Team support** - Multiple users sharing accounts
11. **CSV import** - Bulk import accounts from Salesforce/HubSpot export
12. **Browser extension** - Quick-add companies while browsing

---

## Job Seeker Mode (Proposed)

The current architecture supports job seekers with minimal changes:

1. **Reframe terminology** - "Accounts" → "Target Companies", "Expansion signals" → "Research signals"
2. **Add job-seeker-specific signal types** - "Hiring your role", "Glassdoor reviews", "Employee LinkedIn activity"
3. **Different play recommendations** - Tailored for job seekers ("Good time to apply", "Reference this in your cover letter")
4. **Possibly separate onboarding path** - Ask user intent upfront (Sales vs Job Seeking)

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Questions for Discussion

1. Should we add real AI for play recommendations, or keep it rule-based to stay free?
2. Is the signal scoring system (0-100) useful, or should we simplify to high/medium/low?
3. Priority: fix auth redirect issue first, or focus on making scanners more robust?
4. Should job seeker mode be a separate app, a toggle, or just different onboarding?

---

## Contact

Built in v0 by [your name]. Ping me with questions.
