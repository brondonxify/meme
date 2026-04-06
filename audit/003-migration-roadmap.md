# Migration Roadmap — Risks, Impacted Files, and Execution Plan

**Date:** 2026-04-05
**Status:** Proposed

---

## 1. Risk Assessment

### 1.1 Critical Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R1 | **Admin breaks during Supabase removal** — 100% of admin data operations use Supabase client. Rewriting all services and server actions simultaneously is high-risk. | CRITICAL | HIGH | Migrate one domain at a time (products first, then orders, etc.). Keep Supabase as fallback during transition. |
| R2 | **Type mismatch between frontend and backend** — Frontend uses `Product`, backend uses `Article`. Admin uses Supabase-generated types. All three are incompatible. | CRITICAL | HIGH | Define canonical types in `@meme/types` FIRST. Both frontends and backend import from there. |
| R3 | **Auth gap during migration** — Admin has working Supabase auth. Removing it before JWT backend is ready leaves admin unusable. | CRITICAL | MEDIUM | Build JWT auth in backend BEFORE touching admin auth. Keep Supabase auth working until JWT is verified. |
| R4 | **Image URLs break** — Product images currently served from Supabase Storage. New storage solution must serve identical URLs or all images break. | HIGH | HIGH | Phase 1: Keep Supabase Storage URLs working while building new upload endpoint. Phase 2: Migrate images. |

### 1.2 Moderate Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R5 | **Redux cart conflicts with server cart** — If cart exists in both localStorage and DB, they can diverge. | MEDIUM | HIGH | Server is source of truth. On login, merge localStorage cart into DB cart, then clear localStorage. |
| R6 | **Admin server actions depend on Supabase revalidation** — `revalidatePath()` works with Supabase. Must verify it works with API-based data. | MEDIUM | LOW | Test revalidation after each server action rewrite. |
| R7 | **CORS issues** — Admin and client on different ports than backend during development. | LOW | MEDIUM | Backend CORS already configured for `*`. Tighten to specific origins in production. |
| R8 | **hono-file-router compatibility** — File-based routing may conflict with new middleware structure. | LOW | LOW | Test middleware + file-based routing combination early. |

### 1.3 Low Risks

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R9 | **Turborepo cache invalidation** — Renaming `frontend` → `client` may break turbo cache. | LOW | HIGH | Clear `.turbo/` cache after rename. Update all references. |
| R10 | **pnpm workspace resolution** — New packages may not resolve correctly. | LOW | LOW | Run `pnpm install` after each structural change. |

---

## 2. Impacted Files — Complete Inventory

### 2.1 Backend — Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/package.json` | MODIFY | Add `zod`, `jsonwebtoken`, `cookie` dependencies |
| `apps/backend/src/index.ts` | MODIFY | Add JWT middleware, global error handler, cookie parsing |
| `apps/backend/src/middleware/auth.ts` | **NEW** | JWT verification middleware |
| `apps/backend/src/middleware/validate.ts` | **NEW** | Zod validation middleware |
| `apps/backend/src/middleware/error.ts` | **NEW** | Global error handler |
| `apps/backend/src/routes/api/auth/*.ts` | REWRITE | JWT-based auth endpoints (login, register, refresh, logout) |
| `apps/backend/src/routes/api/auth/admin/*.ts` | REWRITE | Admin JWT auth endpoints |
| `apps/backend/src/routes/api/articles/*.ts` | MODIFY | Add auth middleware to write routes, Zod validation |
| `apps/backend/src/routes/api/categories/*.ts` | MODIFY | Add auth middleware to write routes, Zod validation |
| `apps/backend/src/routes/api/orders/*.ts` | MODIFY | Add auth middleware, Zod validation |
| `apps/backend/src/routes/api/customers/*.ts` | MODIFY | Add auth middleware, Zod validation |
| `apps/backend/src/routes/api/admin/*.ts` | MODIFY | Add JWT admin role verification |
| `apps/backend/src/routes/api/upload/*.ts` | **NEW** | File upload endpoint for product images |
| `apps/backend/src/services/*.ts` | MODIFY | Add Zod validation, improve error handling |
| `apps/backend/.env` | MODIFY | Add JWT secrets, upload config |

### 2.2 Admin — Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/admin/package.json` | MODIFY | Remove Supabase packages, add `@meme/api-client` |
| `apps/admin/src/middleware.ts` | **REPLACE** | JWT cookie validation instead of Supabase session |
| `apps/admin/src/lib/supabase/client.ts` | **DELETE** | Remove Supabase browser client |
| `apps/admin/src/lib/supabase/server.ts` | **DELETE** | Remove Supabase server client |
| `apps/admin/src/lib/supabase/server-action.ts` | **DELETE** | Remove Supabase server action client |
| `apps/admin/src/lib/api/client.ts` | **NEW** | HTTP client wrapping @meme/api-client |
| `apps/admin/src/lib/auth/index.ts` | **NEW** | JWT auth utilities |
| `apps/admin/src/contexts/UserContext.tsx` | **REWRITE** | Use JWT token instead of Supabase session |
| `apps/admin/src/services/products/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/orders/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/customers/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/categories/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/coupons/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/staff/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/services/notifications/index.ts` | **REWRITE** | Replace Supabase queries with API calls |
| `apps/admin/src/actions/products/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/orders/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/categories/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/coupons/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/customers/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/staff/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/actions/profile/*.ts` | **REWRITE** | Replace Supabase calls with API calls |
| `apps/admin/src/app/(authentication)/auth/*/route.ts` | **REPLACE** | JWT-based auth API routes |
| `apps/admin/src/types/supabase.ts` | **DELETE** | Replace with @meme/types imports |
| `apps/admin/src/helpers/axiosInstance.ts` | **DELETE** | Unused, remove |
| `apps/admin/.env.example` | **REPLACE** | Remove Supabase vars, add API URL |
| `apps/admin/next.config.js` | MODIFY | Remove Supabase image domains, add backend URL |

### 2.3 Client (Frontend) — Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend/package.json` | MODIFY | Add `@meme/api-client`, `@meme/types` dependencies |
| `apps/frontend/.env.local` | **NEW** | Add `NEXT_PUBLIC_API_URL` |
| `apps/frontend/src/app/page.tsx` | **REWRITE** | Replace hardcoded data with API calls |
| `apps/frontend/src/app/shop/page.tsx` | **REWRITE** | Replace hardcoded data with API calls |
| `apps/frontend/src/app/shop/product/[...slug]/page.tsx` | **REWRITE** | Replace hardcoded data with API calls |
| `apps/frontend/src/lib/features/products/productsSlice.ts` | **REWRITE** | Fetch products from API instead of static data |
| `apps/frontend/src/lib/features/carts/cartsSlice.ts` | MODIFY | Add server sync capability |
| `apps/frontend/src/types/product.types.ts` | **REPLACE** | Import from @meme/types |
| `apps/frontend/src/app/auth/login/page.tsx` | **NEW** | Login page |
| `apps/frontend/src/app/auth/register/page.tsx` | **NEW** | Registration page |
| `apps/frontend/src/app/profile/page.tsx` | **NEW** | User profile page |
| `apps/frontend/src/app/checkout/page.tsx` | **NEW** | Checkout flow |
| `apps/frontend/src/app/orders/page.tsx` | **NEW** | Order history |
| `apps/frontend/src/middleware.ts` | **NEW** | Auth route protection |

### 2.4 Shared Packages — Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/types/src/index.ts` | **RESTRUCTURE** | Split into domain files, add request types |
| `packages/types/src/entities/*.ts` | **NEW** | Entity type files |
| `packages/types/src/api/response.ts` | **NEW** | Response type definitions |
| `packages/types/src/api/auth.ts` | **NEW** | Auth type definitions |
| `packages/types/src/requests/*.ts` | **NEW** | Request type definitions |
| `packages/api-client/src/index.ts` | **RESTRUCTURE** | Split into domain modules |
| `packages/api-client/src/auth.ts` | **NEW** | Auth methods module |
| `packages/api-client/src/products.ts` | **NEW** | Product methods module |
| `packages/api-client/src/orders.ts` | **NEW** | Order methods module |
| `packages/api-client/src/customers.ts` | **NEW** | Customer methods module |
| `packages/api-client/src/admin.ts` | **NEW** | Admin dashboard methods module |
| `packages/config/tsconfig/base.json` | **NEW** | Shared base tsconfig |
| `packages/config/tsconfig/nextjs.json` | **NEW** | Shared Next.js tsconfig |
| `packages/config/tsconfig/node.json` | **NEW** | Shared Node.js tsconfig |

### 2.5 Root — Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `pnpm-workspace.yaml` | MODIFY | Update workspace paths for `client` rename |
| `turbo.json` | MODIFY | Update pipeline for renamed app |
| `package.json` | MODIFY | Update scripts if needed |

---

## 3. Migration Phases — Step-by-Step

### Phase 0: Foundation (Week 1)

**Goal:** Set up shared infrastructure without touching any app logic.

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 0.1 | Restructure `packages/types/` — split into domain files, add request types | 1 day | None |
| 0.2 | Restructure `packages/api-client/` — split into domain modules | 1 day | 0.1 |
| 0.3 | Create `packages/config/` with shared tsconfigs | 0.5 day | None |
| 0.4 | Rename `apps/frontend` → `apps/client` | 0.5 day | None |
| 0.5 | Update `pnpm-workspace.yaml`, `turbo.json`, all internal references | 0.5 day | 0.4 |
| 0.6 | Verify all apps build successfully after restructuring | 0.5 day | 0.1-0.5 |

**Verification:** `pnpm build` passes for all apps. TypeScript compiles without errors.

---

### Phase 1: Backend Enhancement (Week 1-2)

**Goal:** Add JWT auth, validation, error handling, and file upload to the existing Hono.js backend.

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 1.1 | Add dependencies: `zod`, `jsonwebtoken`, `cookie` | 0.5 day | Phase 0 |
| 1.2 | Create JWT middleware (`src/middleware/auth.ts`) | 1 day | 1.1 |
| 1.3 | Create Zod validation middleware (`src/middleware/validate.ts`) | 0.5 day | 1.1 |
| 1.4 | Create global error handler (`src/middleware/error.ts`) | 0.5 day | 1.1 |
| 1.5 | Rewrite auth endpoints with JWT (`src/routes/api/auth/`) | 2 days | 1.2, 1.3 |
| 1.6 | Rewrite admin auth endpoints with JWT | 1 day | 1.2, 1.3 |
| 1.7 | Add auth middleware to all protected routes | 1 day | 1.5, 1.6 |
| 1.8 | Add Zod validation to all POST/PUT endpoints | 2 days | 1.3 |
| 1.9 | Create file upload endpoint | 1 day | 1.1 |
| 1.10 | Update `.env` with JWT secrets | 0.5 day | 1.1 |
| 1.11 | Test all 56 endpoints with new auth + validation | 1 day | 1.5-1.9 |

**Verification:** All endpoints return correct responses. Auth-protected routes reject unauthenticated requests. File upload works.

---

### Phase 2: Client Integration (Week 2-3)

**Goal:** Connect the client (frontend) to the backend API. This is the LOWEST risk phase since the frontend currently has no backend connection.

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 2.1 | Add `@meme/api-client` and `@meme/types` as dependencies | 0.5 day | Phase 0, Phase 1 |
| 2.2 | Create `.env.local` with `NEXT_PUBLIC_API_URL` | 0.5 day | Phase 1 |
| 2.3 | Replace hardcoded product data with API calls in `page.tsx` | 1 day | 2.1 |
| 2.4 | Replace hardcoded data in `shop/page.tsx` | 1 day | 2.1 |
| 2.5 | Replace hardcoded data in `shop/product/[...slug]/page.tsx` | 1 day | 2.1 |
| 2.6 | Update `productsSlice` to use API data | 1 day | 2.3 |
| 2.7 | Add TanStack Query for server state caching (optional) | 1 day | 2.1 |
| 2.8 | Implement customer auth (login/register pages) | 2 days | Phase 1 |
| 2.9 | Add auth middleware to client | 0.5 day | 2.8 |
| 2.10 | Implement checkout flow | 2 days | 2.8 |
| 2.11 | Add user profile and order history pages | 2 days | 2.8 |
| 2.12 | Sync cart with backend on login | 1 day | 2.8 |

**Verification:** All pages load with real API data. Auth flow works end-to-end. Cart persists across sessions. Checkout creates orders in database.

---

### Phase 3: Admin Migration — Domain by Domain (Week 3-5)

**Goal:** Replace Supabase with Hono.js API calls, one domain at a time. This is the HIGHEST risk phase.

#### 3A: Infrastructure Setup (Week 3, Days 1-3)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3A.1 | Add `@meme/api-client` dependency, remove Supabase packages | 0.5 day | Phase 0, Phase 1 |
| 3A.2 | Create `src/lib/api/client.ts` — HTTP client wrapper | 0.5 day | 3A.1 |
| 3A.3 | Create `src/lib/auth/index.ts` — JWT utilities | 0.5 day | Phase 1 |
| 3A.4 | Rewrite `src/middleware.ts` — JWT cookie validation | 1 day | 3A.3 |
| 3A.5 | Rewrite `src/contexts/UserContext.tsx` — JWT-based | 0.5 day | 3A.3 |
| 3A.6 | Replace `src/types/supabase.ts` with `@meme/types` imports | 1 day | Phase 0 |
| 3A.7 | Update `next.config.js` — remove Supabase image domains | 0.5 day | None |
| 3A.8 | Replace auth routes (`src/app/(authentication)/auth/`) | 1 day | 3A.3 |

**Verification:** Admin login/logout works with JWT. Protected routes redirect correctly. User context provides correct data.

#### 3B: Products Domain (Week 3, Days 4-5)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3B.1 | Rewrite `src/services/products/index.ts` — API calls | 1 day | 3A |
| 3B.2 | Rewrite `src/actions/products/*.ts` — API calls | 1 day | 3B.1 |
| 3B.3 | Test product listing, detail, create, edit, delete | 0.5 day | 3B.2 |
| 3B.4 | Test image upload via new backend endpoint | 0.5 day | Phase 1.9 |

**Verification:** All product operations work. Images upload and display correctly.

#### 3C: Orders Domain (Week 4, Days 1-2)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3C.1 | Rewrite `src/services/orders/index.ts` — API calls | 1 day | 3A |
| 3C.2 | Rewrite `src/actions/orders/*.ts` — API calls | 0.5 day | 3C.1 |
| 3C.3 | Test order listing, detail, status changes | 0.5 day | 3C.2 |

**Verification:** Orders display correctly. Status updates work. Dashboard stats reflect real data.

#### 3D: Customers Domain (Week 4, Days 3-4)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3D.1 | Rewrite `src/services/customers/index.ts` — API calls | 0.5 day | 3A |
| 3D.2 | Rewrite `src/actions/customers/*.ts` — API calls | 0.5 day | 3D.1 |
| 3D.3 | Test customer listing, detail, edit, delete | 0.5 day | 3D.2 |

**Verification:** Customer operations work. Customer order history loads correctly.

#### 3E: Categories Domain (Week 4, Days 5)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3E.1 | Rewrite `src/services/categories/index.ts` — API calls | 0.5 day | 3A |
| 3E.2 | Rewrite `src/actions/categories/*.ts` — API calls | 0.5 day | 3E.1 |
| 3E.3 | Test category CRUD | 0.5 day | 3E.2 |

**Verification:** Categories display and manage correctly.

#### 3F: Coupons Domain (Week 5, Days 1-2)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3F.1 | Rewrite `src/services/coupons/index.ts` — API calls | 0.5 day | 3A |
| 3F.2 | Rewrite `src/actions/coupons/*.ts` — API calls | 0.5 day | 3F.1 |
| 3F.3 | Test coupon CRUD | 0.5 day | 3F.2 |

**Verification:** Coupons display and manage correctly.

#### 3G: Staff Domain (Week 5, Days 3-4)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3G.1 | Rewrite `src/services/staff/index.ts` — API calls | 0.5 day | 3A |
| 3G.2 | Rewrite `src/actions/staff/*.ts` — API calls | 0.5 day | 3G.1 |
| 3G.3 | Test staff management | 0.5 day | 3G.2 |

**Verification:** Staff listing, role management, and profile editing work.

#### 3H: Notifications Domain (Week 5, Day 5)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 3H.1 | Rewrite `src/services/notifications/index.ts` — API calls | 0.5 day | 3A |
| 3H.2 | Test notifications | 0.5 day | 3H.1 |

**Verification:** Notifications load and dismiss correctly.

---

### Phase 4: Data Migration (Week 6)

**Goal:** Migrate data from Supabase PostgreSQL to MySQL.

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 4.1 | Export data from Supabase (CSV/JSON) | 0.5 day | Phase 3 complete |
| 4.2 | Transform data to match MySQL schema | 1 day | 4.1 |
| 4.3 | Import data into MySQL | 0.5 day | 4.2 |
| 4.4 | Verify data integrity (counts, relationships) | 1 day | 4.3 |
| 4.5 | Migrate product images from Supabase Storage to local/S3 | 1 day | Phase 1.9 |
| 4.6 | Update image URLs in database | 0.5 day | 4.5 |
| 4.7 | Disable Supabase project (read-only mode first) | 0.5 day | 4.6 |

**Verification:** All data present in MySQL. All images load correctly. No broken references.

---

### Phase 5: Cleanup and Optimization (Week 6-7)

| Step | Task | Duration | Dependencies |
|------|------|----------|-------------|
| 5.1 | Remove all Supabase dependencies from admin | 0.5 day | Phase 4 |
| 5.2 | Remove unused `axiosInstance.ts` from admin | 0.5 day | Phase 4 |
| 5.3 | Clean up `packages/ui/` (remove or populate) | 0.5 day | None |
| 5.4 | Add comprehensive API documentation | 1 day | Phase 1 |
| 5.5 | Performance audit — query optimization, caching | 1 day | Phase 3 |
| 5.6 | Security audit — rate limiting, input sanitization | 1 day | Phase 1 |
| 5.7 | End-to-end testing | 2 days | Phase 4 |

**Verification:** Full end-to-end test passes. No Supabase references remain. Performance benchmarks met.

---

## 4. Parallel Agent Execution Plan

### 4.1 Phase 0 — Can Run Sequentially (Foundation)
No parallelism needed — these are structural changes that must happen in order.

### 4.2 Phase 1 — Backend Enhancement (Parallel Opportunities)

```
Agent A (backend-auth):     Steps 1.2, 1.5, 1.6, 1.7  — JWT auth system
Agent B (backend-validate): Steps 1.3, 1.8             — Zod validation
Agent C (backend-upload):   Step 1.9                    — File upload
Agent D (backend-error):    Step 1.4                    — Error handler
```

**Dependencies:** Agent B, C, D can start after 1.1 (dependencies installed). Agent A must finish before B and C add middleware to routes.

### 4.3 Phase 2 — Client Integration (Parallel Opportunities)

```
Agent E (client-data):      Steps 2.3, 2.4, 2.5, 2.6   — Wire up API to pages
Agent F (client-auth):      Steps 2.8, 2.9              — Auth pages + middleware
Agent G (client-checkout):  Steps 2.10, 2.11, 2.12      — Checkout + profile
```

**Dependencies:** All agents can start after Phase 1 is complete and Step 2.1-2.2 are done.

### 4.4 Phase 3 — Admin Migration (Sequential by Domain)

**DO NOT parallelize admin migration.** Each domain rewrite depends on the previous one being verified. The risk of breaking the admin is too high.

However, within each domain, steps can be parallelized:

```
# For each domain (Products, Orders, Customers, etc.):
Agent H (admin-services):   Rewrite services/*
Agent I (admin-actions):    Rewrite actions/*
# Then sequential verification
```

### 4.5 Recommended Agent Dispatch Order

```
Week 1:
  → Agent A: Backend JWT auth (Phase 1, Steps 1.2, 1.5, 1.6, 1.7)
  → Agent B: Backend Zod validation (Phase 1, Steps 1.3, 1.8)
  → Agent C: Backend file upload (Phase 1, Step 1.9)
  → Agent D: Backend error handler (Phase 1, Step 1.4)

Week 2:
  → Agent E: Client data integration (Phase 2, Steps 2.3-2.7)
  → Agent F: Client auth (Phase 2, Steps 2.8-2.9)

Week 3:
  → Agent G: Client checkout (Phase 2, Steps 2.10-2.12)
  → Agent H: Admin infrastructure (Phase 3A)
  → Agent I: Admin products (Phase 3B)

Week 4:
  → Agent J: Admin orders (Phase 3C)
  → Agent K: Admin customers (Phase 3D)
  → Agent L: Admin categories (Phase 3E)

Week 5:
  → Agent M: Admin coupons (Phase 3F)
  → Agent N: Admin staff (Phase 3G)
  → Agent O: Admin notifications (Phase 3H)

Week 6:
  → Sequential: Data migration (Phase 4)
  → Agent P: Cleanup and optimization (Phase 5)
```

---

## 5. Go/No-Go Checkpoints

### Checkpoint 1: After Phase 0
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` succeeds for all 3 apps
- [ ] `pnpm dev` starts all 3 apps without errors
- [ ] TypeScript compiles with zero errors

### Checkpoint 2: After Phase 1
- [ ] All 56 backend endpoints respond correctly
- [ ] Auth-protected routes return 401 without token
- [ ] JWT tokens validate correctly
- [ ] File upload endpoint accepts and stores files
- [ ] Zod validation rejects invalid input with clear errors

### Checkpoint 3: After Phase 2
- [ ] Client homepage loads with real product data
- [ ] Client shop page displays products with filters
- [ ] Client product detail page shows correct product
- [ ] Customer registration creates user in database
- [ ] Customer login returns valid JWT
- [ ] Cart persists across page refreshes
- [ ] Checkout creates order in database

### Checkpoint 4: After Phase 3A
- [ ] Admin login works with JWT
- [ ] Admin middleware redirects unauthenticated users
- [ ] User context provides correct profile data
- [ ] All auth routes (login, signup, forgot password) work

### Checkpoint 5: After Each Domain Migration (3B-3H)
- [ ] All CRUD operations work for the domain
- [ ] Data displays correctly in tables
- [ ] Create/edit forms submit successfully
- [ ] Delete operations work with confirmation
- [ ] No Supabase references remain in migrated files

### Checkpoint 6: After Phase 4
- [ ] All data migrated from Supabase to MySQL
- [ ] Record counts match between old and new databases
- [ ] All foreign key relationships intact
- [ ] All product images load from new storage
- [ ] Supabase project set to read-only

### Checkpoint 7: After Phase 5
- [ ] Zero Supabase dependencies in any package.json
- [ ] End-to-end test suite passes
- [ ] Performance benchmarks met (page load < 3s)
- [ ] Security audit passes (no exposed secrets, rate limiting active)

---

## 6. Rollback Plan

If any phase fails verification:

| Phase | Rollback Action |
|-------|----------------|
| Phase 0 | `git checkout` — no data affected |
| Phase 1 | Revert backend changes — admin and client unaffected (still using Supabase/static) |
| Phase 2 | Revert client changes — admin unaffected, backend enhancements remain |
| Phase 3A | Revert admin middleware and auth — Supabase auth still works |
| Phase 3B-3H | Revert individual domain — other domains remain migrated |
| Phase 4 | Keep Supabase in read-only mode, revert MySQL data import |
| Phase 5 | No rollback needed — cleanup only |

**Key Principle:** Each phase is independently reversible. No phase destroys data or functionality that can't be restored.
