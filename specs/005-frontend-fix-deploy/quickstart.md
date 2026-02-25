# Quickstart: Local Development & Deployment

**Date**: 2026-01-15 | **Feature**: 005-frontend-fix-deploy

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Git
- Terminal/CLI access

---

## Local Development Setup

### 1. Clone & Navigate

```bash
# Clone repository (if not already done)
git clone https://github.com/MuhammadAther11/hackathon-2-phase-2.git
cd phase-2

# Checkout feature branch
git checkout 005-frontend-fix-deploy
```

### 2. Backend Setup (if not running)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# NEON_DATABASE_URL=postgresql://user:password@host/dbname
# BETTER_AUTH_SECRET=your-secret-key

# Run migrations (if needed)
# alembic upgrade head

# Start backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running on**: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev
# or
yarn dev
```

**Frontend running on**: `http://localhost:3000`

---

## Development Workflow

### 1. Run Build (Catch TypeScript & Build Errors)

```bash
cd frontend
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ No TypeScript errors
```

**If Errors**:
- TypeScript errors: Run `npm run type-check` for details
- Build errors: Check console for specific file/line
- Create task to fix each error

### 2. Test Key User Flows Locally

#### Login Flow

1. Open `http://localhost:3000`
2. Click "Login"
3. Enter: `user@example.com` / `password`
4. Expected: Redirect to dashboard
5. Check localStorage: `auth.session` should contain token
6. Check cookies: `auth_token` should be set

#### Create Task

1. On dashboard, enter task title
2. Click "Create"
3. Expected: Task appears in list, spinner shows briefly
4. Check network tab: POST `/tasks` succeeds

#### Logout

1. Click "Logout" in navbar
2. Expected: Redirect to login
3. Check localStorage: `auth.session` cleared
4. Check cookies: `auth_token` cleared

### 3. Test Responsive Design

**Using Browser DevTools**:

1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Test viewports:
   - **Mobile**: 375px width
   - **Tablet**: 768px width
   - **Desktop**: 1920px width

**Expected**: All elements visible and clickable, no layout breaks

### 4. Test Error Scenarios

#### Invalid Login

- Enter: `test@test.com` / `wrongpassword`
- Expected: Error message displayed, stay on login page

#### Network Timeout

- Disconnect internet or throttle network
- Try creating task
- Expected: "Connection lost" message shown

#### 401 Unauthorized

- Manually delete `auth_token` cookie in DevTools
- Try navigating to dashboard
- Expected: Redirect to login

---

## Build & Deployment

### 1. Pre-Deployment Checklist

```bash
cd frontend

# Verify no TypeScript errors
npm run type-check

# Verify build succeeds
npm run build

# Run linting (if configured)
npm run lint

# Fix any errors before proceeding
```

**Expected**: All checks pass with zero errors.

### 2. Deploy to Vercel

#### Option A: Git Push (Automatic)

```bash
# Commit changes
git add .
git commit -m "feat: fix frontend auth and deployment"

# Push to feature branch
git push origin 005-frontend-fix-deploy

# Create PR and merge to main
# (Vercel auto-deploys from main)
```

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd phase-2
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set environment variables:
#   NEXT_PUBLIC_API_URL=https://api.example.com
# - Deploy
```

#### Option C: Manual Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select project
3. Connect GitHub repo (if not already done)
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.production.com`
5. Trigger deployment
6. Monitor build logs

### 3. Environment Variables

**Local** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Staging** (Vercel):
```
NEXT_PUBLIC_API_URL=https://api-staging.example.com
```

**Production** (Vercel):
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Note**: `NEXT_PUBLIC_` prefix makes variable available to browser. Never expose secrets this way.

### 4. Verify Deployment

**Post-Deploy Checklist**:

1. **Build Succeeded**: Check Vercel dashboard (green checkmark)
2. **No Runtime Errors**: Open DevTools console on deployed site, no red errors
3. **Login Works**: Navigate to `/login`, signup, login
4. **Tasks Work**: Create, edit, delete tasks
5. **Responsive**: Test on mobile viewport
6. **Landing Page**: Open `/` without auth, see public landing page
7. **Logout Works**: Logout redirects to login

---

## Troubleshooting

### Build Errors

**Error**: `TypeError: Cannot find module '@/lib/api-client'`

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

---

### TypeScript Errors

**Error**: `Property 'isLoading' does not exist on type`

**Solution**:
1. Check React Query version: `npm list @tanstack/react-query`
2. Verify hook usage matches documentation
3. Add explicit type: `const { isLoading }: UseQueryResult<Task[]> = useQuery(...)`

---

### 401 Redirect Loop

**Error**: User redirected to login, then back to login (infinite loop)

**Possible Causes**:
1. Token not stored in localStorage
2. auth_token cookie not set
3. Middleware incorrectly configured

**Debug Steps**:
```javascript
// In browser console
console.log(localStorage.getItem("auth.session")); // Should have token
console.log(document.cookie); // Should include auth_token
```

**Fix**:
- Verify Better Auth is initializing correctly in `auth-client.ts`
- Verify middleware cookie check in `middleware.ts`
- Clear all cookies/localStorage and retry login

---

### Empty Response JSON Parsing

**Error**: `Unexpected end of JSON input`

**Cause**: DELETE returns 204 No Content, but code tries JSON.parse()

**Solution**:
Update `apiFetch` in `api-client.ts`:

```typescript
if (response.status === 204) {
  return null as any; // or return {} for consistency
}
return response.json();
```

---

### Responsive Layout Broken on Mobile

**Error**: Text overlaps, buttons unreachable on 375px viewport

**Cause**: Hardcoded widths or Tailwind breakpoints misconfigured

**Fix**:
1. Check Tailwind config for breakpoint definitions
2. Review component classes: use `w-full` instead of fixed widths
3. Use `sm:`, `md:`, `lg:` prefixes for responsive adjustments
4. Test in DevTools responsive mode at multiple breakpoints

---

## Monitoring & Logging

### Frontend Logging

**Enable Debug Mode**:
```typescript
// In .env.local
NEXT_PUBLIC_DEBUG=true
```

**In Components**:
```typescript
const debug = process.env.NEXT_PUBLIC_DEBUG === "true";
if (debug) console.log("API response:", data);
```

### Backend Logging

**Check Backend Logs**:
```bash
# Terminal running backend
# Watch for:
# ✅ POST /auth/login - 200
# ✅ GET /tasks - 200
# ❌ GET /tasks - 401 (token issue)
```

### Vercel Deployment Logs

1. Go to Vercel dashboard
2. Select deployment
3. View "Deployments" tab
4. Click on failed build to see logs
5. Look for TypeScript errors, missing env vars, etc.

---

## Performance Tips

### 1. Optimize Bundle Size

```bash
# Analyze bundle
npm run build
npm list # Check for duplicate dependencies
```

### 2. Enable Compression

**Vercel** handles this automatically. No action needed.

### 3. Cache Assets

Vercel caches static assets (CSS, images) automatically.

### 4. Database Query Performance

Backend concern, but ensure:
- Migrations run before deployment
- Database indexes created for frequently queried columns

---

## Database Migrations (if needed)

### Local

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Add task indexes"

# Apply migration
alembic upgrade head

# Check current version
alembic current
```

### Production (Vercel Backend)

If using Neon PostgreSQL:
1. Migrations should run automatically on deploy
2. Or manually via Neon dashboard

---

## Common Commands

### Frontend

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run type-check # Check TypeScript
npm run test      # Run tests (if configured)
```

### Backend

```bash
python -m uvicorn src.main:app --reload  # Start dev server
pytest                                   # Run tests
black src/                               # Format code
mypy src/                                # Type check
```

### Git

```bash
git status                                # Check changes
git add .                                 # Stage all
git commit -m "feat: message"             # Commit
git push origin 005-frontend-fix-deploy   # Push
git checkout main                         # Switch branches
```

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Better Auth**: https://better-auth.com
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**Ready to Start?**

1. ✅ Backend running on `:8000`
2. ✅ Frontend running on `:3000`
3. ✅ Execute tasks from `/sp.tasks`

Next: Run `/sp.tasks` to generate implementation task list.
