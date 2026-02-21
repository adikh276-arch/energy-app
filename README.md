# Energy Pattern Discovery Tracker

A mobile-friendly energy tracking application for Employee Assistance Programmes (EAP). Track energy levels, discover personal patterns, and get actionable insights.

## Features

- **Energy Logging** — Log energy on a 1-5 scale with contributing factors
- **Pattern Discovery** — Automated correlation analysis reveals what impacts your energy
- **Today's Timeline** — Visual timeline of energy levels throughout the day
- **Weekly Trends** — 7-day line chart with trend indicators
- **Cross-Tracker Insights** — Correlates with sleep, consumption, and withdrawal data
- **Expert Booking** — Surfaces support options when persistent low energy is detected
- **Multi-Language** — 10 languages via Google Translate API
- **History & Export** — Full log history with CSV export

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Translation**: Google Translate API

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translation API key |

## Authentication

The app uses token-based authentication:

1. User arrives with `?token=UUID` URL parameter
2. Token is validated against `https://api.mantracare.com/user/user-info`
3. User ID is stored in `sessionStorage`
4. All subsequent API calls include the authenticated user ID

## Database Tables

### `energy_logs`
| Column | Type | Description |
|---|---|---|
| `user_id` | BIGINT | Foreign key to users |
| `timestamp` | TIMESTAMPTZ | When the log was created |
| `level` | INTEGER (1-5) | Energy level |
| `factors` | JSONB | Array of contributing factors |

### `energy_actions` (optional)
| Column | Type |
|---|---|
| `user_id` | BIGINT |
| `timestamp` | TIMESTAMPTZ |
| `action_type` | TEXT |

### Cross-tracker tables (optional)
- `sleep_logs` — Sleep quality data
- `consumption_logs` — Substance use tracking
- `withdrawal_logs` — Cessation tracking

## Discovery Algorithm

Patterns are calculated when 10+ entries exist:

1. For each factor, calculate average energy WITH and WITHOUT the factor
2. Compute percentage difference: `((with - without) / without) × 100`
3. Show as discovery if `|percentage| > 15%` AND sample size > 5

## Development

```bash
npm install
npm run dev
```

## License

Private — EAP Programme Use Only
