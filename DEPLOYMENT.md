# Deployment Instructions - Contractor Directory Backend

## Prerequisites

1. **Supabase Project**: Create a project at https://supabase.com
2. **Node.js**: Version 18+ installed
3. **Vercel** (recommended) or similar Next.js hosting

## Phase 1: Database Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note your `Project URL` and `anon public` key from Settings → API

### 1.2 Run the Database Schema
1. Open the Supabase SQL Editor
2. Copy and paste the contents of `schema.sql`
3. Execute the SQL

### 1.3 Get API Keys
- Go to Settings → API
- Copy `Project URL` 
- Copy `anon public` key
- Copy `service_role` key (⚠️ Keep secret - only for server-side operations)

## Phase 2: Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: API URL (for frontend)
NEXT_PUBLIC_API_URL=/api/contractors
```

## Phase 3: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 to test.

## Phase 4: Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com and import the project
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Alternative: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t contractor-directory .
docker run -p 3000:3000 --env-file .env.local contractor-directory
```

## Phase 5: Verify Security

### Check RLS Policies
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify the following policies exist:
   - `contractors` table: Public read access
   - Service role policies for write operations

### Test Rate Limiting
```bash
# Try multiple rapid requests
for i in {1..110}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/contractors
done
```
Expected: First 100 return 200, remaining return 429

### Test Input Validation
```bash
# Valid request
curl -X POST http://localhost:3000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"plumber"}'

# Invalid request (missing required field)
curl -X POST http://localhost:3000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

## API Endpoints

### GET /api/contractors
Search contractors with filters.

Query Parameters:
- `category` - Service category (plumber, electrician, etc.)
- `query` - Search text
- `city` - Filter by city
- `state` - Filter by state
- `zip_code` - Filter by zip code
- `lat` - Latitude for proximity search
- `lng` - Longitude for proximity search
- `radius` - Search radius in miles (default: 10)
- `limit` - Results limit (default: 20, max: 100)
- `offset` - Pagination offset

Example:
```bash
curl "http://localhost:3000/api/contractors?category=plumber&lat=40.7128&lng=-74.0060&radius=10"
```

### POST /api/contractors
Add a new contractor.

Request Body:
```json
{
  "name": "ABC Plumbing",
  "category": "plumber",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zip_code": "62701",
  "phone": "(555) 123-4567",
  "website": "https://example.com",
  "rating": 4.5,
  "review_count": 100,
  "source": "yelp",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### GET /api/contractors/:id
Get a single contractor by ID.

Example:
```bash
curl "http://localhost:3000/api/contractors/550e8400-e29b-41d4-a716-446655440000"
```

## Security Checklist

- [ ] RLS policies enabled on `contractors` table
- [ ] Service role key kept secret
- [ ] Rate limiting active on API routes
- [ ] Input validation via Zod on all endpoints
- [ ] HTTPS enforced in production
- [ ] Environment variables set in production

## Troubleshooting

### 403 Forbidden
- Check RLS policies in Supabase Dashboard
- Verify API keys are correct

### Rate limit immediately
- Check rate limit headers in response
- Wait for reset window (15 minutes)

### Database errors
- Verify schema.sql ran successfully
- Check table exists in Supabase Table Editor
