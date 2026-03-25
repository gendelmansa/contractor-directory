# Security Configuration

This document outlines environment variables required for secure operation.

## Required Environment Variables

### POST_API_KEY
- **Purpose**: API key authentication for POST /api/contractors endpoint
- **Required**: Yes (for write access to the API)
- **How to set**: Add to your Vercel project settings or `.env.local` file
- **Example**: `POST_API_KEY=your-secure-api-key-here`

```bash
# In .env.local
POST_API_KEY=your-secure-random-string-min-32-chars
```

## Recommended Practices

1. **Generate a strong API key**: Use a random string of at least 32 characters
2. **Never commit secrets**: Keep API keys out of version control
3. **Rotate periodically**: Change keys regularly
4. **Restrict by IP** (optional): If your Vercel plan supports it, limit API access to known IP addresses

## Security Notes

- The rate limiter uses in-memory storage and is NOT suitable for serverless production environments. For production, use Redis or a similar distributed rate limiting solution.
- Phone numbers are excluded from public API responses for privacy.
- Internal error messages are suppressed; generic messages are returned to clients.
- Search queries are sanitized to prevent ILIKE injection attacks.
