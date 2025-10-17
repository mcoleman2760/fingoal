# FinGoal Backend (v2)

## Quick Start
```bash
npm install
cp .env.example .env  
npm run dev
```

### Sample endpoints
- `GET /api/hello` → `{ message }`
- `GET /api/goals` → mock data (no auth, this week only)
- `POST /api/auth/register` → create user
- `POST /api/auth/login` → get JWT
- `GET /api/transactions` (Bearer token) → list
- `POST /api/transactions` (Bearer token) → create

### Mongo Schemas (drafted)
- **User**: `{ email, passwordHash, username }`
- **Goal**: `{ userId, title, targetAmount, timeline, progress }`
- **Transaction**: `{ userId, merchant, category, amount, date, type }`
```

