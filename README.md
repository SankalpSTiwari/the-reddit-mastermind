# Reddit Mastermind

A content calendar generator for organic Reddit marketing. This tool helps create natural, engaging Reddit posts and comment threads that drive upvotes, views, and inbound leads.

## Features

- **Content Calendar Generation**: Automatically generates weekly content calendars with posts and comments
- **Persona Management**: Support for multiple personas with distinct backgrounds and writing styles
- **Smart Distribution**: Intelligent subreddit rotation to avoid overposting
- **Quality Metrics**: Built-in evaluation of naturalness, diversity, and keyword coverage
- **Sequential Week Generation**: Generate subsequent weeks while maintaining history
- **Export Functionality**: Export calendars as JSON for integration with posting tools

## Algorithm Highlights

The algorithm addresses key concerns:

1. **Natural Conversations**: Posts use varied engagement types (questions, comparisons, discussions)
2. **Authentic Threads**: Comments follow realistic timing patterns and conversation flow
3. **Diversity**: Automatic rotation of subreddits, personas, and engagement types
4. **Avoiding Detection**:
   - No persona comments on their own post first
   - Varied posting times across the week
   - Subreddit frequency limits
5. **Quality Scoring**: Each calendar includes metrics for naturalness, diversity, and warnings

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SankalpSTiwari/the-reddit-mastermind.git
cd the-reddit-mastermind

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Quick Start

1. Click "Load Sample Data" to populate with Slideforge sample data
2. Review and modify the configuration as needed
3. Click "Generate Calendar" to create your first week
4. Click "Generate Week X" to create subsequent weeks

## Configuration

### Company Info

- **Name**: Your product/company name
- **Website**: Product website URL
- **Description**: Detailed product description
- **ICP**: Ideal Customer Profile

### Personas (minimum 2)

Each persona needs:

- **Username**: Reddit username
- **Background**: Character backstory
- **Expertise**: Areas of knowledge
- **Writing Style**: How they communicate
- **Subreddit Affinities**: Relevant subreddits

### Subreddits

List of target subreddits (with r/ prefix)

### Keywords

Target keywords/queries for SEO and LLM citations

### Posts Per Week

Number of posts to generate (1-10)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Supabase (optional persistence)

Persistence is best-effort: if env vars are set, generated calendars are inserted into a `calendars` table.

Env vars:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Suggested schema:

```sql
create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  week_number int not null,
  week_start_date timestamptz not null,
  payload jsonb not null,
  created_at timestamptz default now()
);
```

If the env vars are not provided, the API skips persistence without failing the request.

### Docker

Build and run locally:

```bash
docker build -t reddit-mastermind .
docker run -d -p 3000:3000 --name reddit-mastermind reddit-mastermind
```

The app will be available at http://localhost:3000. Stop with:

```bash
docker stop reddit-mastermind && docker rm reddit-mastermind
```

### Other Platforms

The app is a standard Next.js application and can be deployed to:

- Netlify
- Railway
- AWS Amplify
- Docker containers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-calendar/
│   │       └── route.ts      # API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── CalendarView.tsx      # Calendar display
│   └── InputForms.tsx        # Configuration forms
├── lib/
│   ├── algorithm.ts          # Core generation algorithm
│   ├── sample-data.ts        # Slideforge sample data
│   └── types.ts              # TypeScript types
└── README.md
```

## Algorithm Details

### End-to-end flow (planning algorithm)

1. **Plan distribution**

   - Spread posts Mon–Fri, peak hours 9a–8p
   - Rotate subreddits using usage/history; avoid repeating a subreddit within the same week when enough subs are available
   - Rotate personas with subreddit affinity and usage balancing
   - Rotate engagement types (question, recommendation, comparison, discussion)
   - Select primary keywords in a round-robin, then add 1–2 extras to maximize coverage

2. **Generate posts**

   - Engagement-type templates with keyword cleaning (avoid duplicated prefixes like “best …”)
   - Comparison posts use subreddit-aware competitor lists
   - Titles/bodies kept short, natural, and editable
   - Time jitter on post timestamps to avoid exact patterns

3. **Generate threads**

   - 2–4 comments per post
   - First comment is a natural product mention; second adds social proof; OP closes the loop
   - Optional depth-2 reply from a different persona for thread variety
   - Realistic time gaps between post and replies; OP never comments first

4. **Quality scoring**

   - **Naturalness**: duplicate titles, timing variety, self-replies penalized
   - **Diversity**: subreddit spread, persona balance (std dev), engagement variety
   - **Keyword coverage**: % of keywords used; primary keywords are tracked to discourage repeats
   - **Warnings**: overposting in a subreddit, persona imbalance, low coverage, repeated primaries

5. **History for subsequent weeks**
   - Track used topics (titles) to reduce repetition
   - Track subreddit post counts across weeks to throttle overuse
   - `updateCalendarHistory` merges the latest calendar into history

### Randomness, rotation, and de-duplication

- **Per-week subreddit uniqueness**: If there are enough unique subreddits for the week, the planner avoids repeating a subreddit within that week.
- **Personas/comments**: Commenters are shuffled so different personas participate across threads.
- **Title de-dupe**: Titles prefer unused variants; if all collide, a “(new take)” suffix is added to reduce repetition.
- **Keyword cleaning**: Removes prefixes like “best”, “how to” to avoid awkward duplicates; primaries are rotated before reuse.
- **Time jitter**: Posts get minute-level jitter around optimal hours to reduce predictability.

### Interpreting the metrics

- **Subreddit Distribution**: Number of posts per subreddit for the current week.
- **Persona Activity**: Total contributions (posts + comments) per persona for the week. Example: 3 posts + 7 comments = 10 total activity, which should equal the sum of persona counts.
- **Keyword Coverage**: Percentage of unique keywords used that week. With only 3 posts/week and a long keyword list, coverage will be <100%; increase posts/week to cover more keywords.

### Known constraints

- Cron not wired; “Generate Week N” simulates the scheduled run.
- Supabase persistence is best-effort; skips if env vars are absent.
- Content is template-based (no LLM); you can layer AI generation later if needed.

## Optional LLM enhancement (not required)

If you provide an OpenAI API key, you can wrap the generated titles/bodies in a post-processing LLM call to polish wording and further reduce repetition. If no key is provided, the deterministic template-based algorithm is used as-is.

Suggested env var:

```
OPENAI_API_KEY=...
```

Model used: `gpt-4o-mini` with JSON response. If the LLM call fails or no key is set, the original template output is returned.

## What can be added next

- Stronger keyword scheduling: guarantee every keyword is used before repeating, with explicit per-week coverage targets.
- Adaptive subreddit pacing: weekly caps and cooldowns per subreddit based on historical usage.
- Persona fairness in comments: boost rarely used personas as commenters when imbalance is detected.
- Richer thread shapes: occasional second-level replies from varied personas, with light disagreement for realism.
- A/B style variants: rotate writing tones or compare template families for higher engagement.
- Automated regression tests: snapshot generated calendars to catch regressions in randomness and distribution.

## Future Enhancements

- [ ] AI-powered content generation (OpenAI/Claude integration)
- [ ] Supabase integration for persistence
- [ ] Cron job automation
- [ ] A/B testing different post styles
- [ ] Analytics dashboard
- [ ] Direct Reddit API integration
