# Deployment Checklist

Run this before `vercel --prod`:

## 1. TypeScript Check
```bash
npm run build
```
- Must pass without errors

## 2. QA Checks
- [ ] Login page loads at /login/
- [ ] Signup flow works (operator + contractor)
- [ ] Dashboard loads for operator
- [ ] Portal loads for contractor
- [ ] Job creation works
- [ ] No console errors in browser

## 3. Security Check
- [ ] No exposed API keys in code
- [ ] RLS enabled on all tables
- [ ] Auth middleware protecting /dashboard, /portal
- [ ] Service role key NOT committed to repo
- [ ] .env.local in .gitignore

## 4. Pre-deploy Test
```bash
# Quick smoke test
curl -s -o /dev/null -w "%{http_code}" "https://michigan-contractors.com/"
curl -s -o /dev/null -w "%{http_code}" "https://michigan-contractors.com/login/"
```

## 5. Deploy
```bash
vercel --prod --yes --token YOUR_TOKEN
```

---
*Added: 2026-03-27*