# Current State Audit — Monorepo Architecture

**Date:** 2026-04-05
**Scope:** `apps/admin`, `apps/frontend`, `apps/backend`, `packages/*`

---

## 1. Monorepo Infrastructure

| Aspect | Current State |
|--------|--------------|
| Package Manager | pnpm 10.28.0 |
| Build Orchestrator | Turborepo 2.7.5 |
| Workspace Config | `pnpm-workspace.yaml` — 4 workspaces |
| Workspaces | `apps/frontend`, `apps/backend`, `apps/admin`, `packages/*` |
| Shared Packages | `@meme/types`, `@meme/api-client`, `packages/ui` (empty) |
| Root Scripts | `dev`, `build`, `start` via turbo |

### Workspace Dependency Graph

```
apps/frontend ──┐
                ├──→ @meme/types (unused by frontend)
apps/admin ─────┤
                ├──→ @meme/api-client (unused by both)
apps/backend ───┘
```

**Finding:** The shared packages exist but are NOT consumed by either frontend or admin. This is dead infrastructure.

---

## 2. App-by-App Audit

### 2.1 Admin Dashboard (`apps/admin/`)

#### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.1.4 |
| Language | TypeScript | latest (5.x) |
| UI Library | shadcn/ui (Radix primitives) | 28 components |
| Styling | Tailwind CSS 3.4.1 | + animate plugin |
| State Management | React Context + TanStack Query | @tanstack/react-query 5.28.6 |
| Data Tables | @tanstack/react-table | 8.10.7 |
| Forms | react-hook-form + Zod | 7.46.2 + 3.22.2 |
| Charts | Chart.js + react-chartjs-2 | 4.4.2 + 5.2.0 |
| PDF Export | jsPDF + html2canvas | 3.0.1 + 1.4.1 |
| Notifications | Sonner | 2.0.5 |
| File Upload | react-dropzone | 14.3.8 |
| HTTP Client | axios | 1.5.1 (UNUSED) |

#### Authentication — Supabase Auth (CRITICAL DEPENDENCY)
- **Provider:** `@supabase/auth-helpers-nextjs` 0.8.1 + `@supabase/supabase-js` 2.36.0
- **Flow:** Email/password + OAuth (Google, GitHub)
- **Session:** HTTP-only cookies via Supabase Auth Helpers
- **Middleware:** `src/middleware.ts` — checks `supabase.auth.getSession()` on every request
- **Protected routes:** All routes except `/login`, `/signup`, `/forgot-password`, `/update-password`
- **User Context:** `src/contexts/UserContext.tsx` — provides `user`, `profile` (via RPC `get_my_profile`)

#### Data Access — 100% Supabase Client
- **No ORM** — direct Supabase client queries everywhere
- **Service layer:** `src/services/{products,orders,customers,categories,coupons,staff,notifications}/index.ts`
- **Server Actions:** `src/actions/{products,orders,categories,coupons,customers,staff,profile}/*.ts` — 30+ actions
- **All services call:** `supabase.from('table').select/insert/update/delete()`
- **Pagination helper:** `src/helpers/queryPaginatedTable.ts` — uses Supabase `.range()` and count

#### Storage — Supabase Storage
- **Bucket:** `assets`
- **Usage:** Product image uploads in `src/actions/products/addProduct.ts`
- **URL pattern:** `https://nxnukzawitjgnropmmgh.supabase.co/storage/v1/object/public/assets/...`

#### Database Schema (Supabase/PostgreSQL)
Tables: `products`, `orders`, `order_items`, `customers`, `categories`, `coupons`, `staff`, `staff_roles`, `notifications`, `inventory_logs`

Enums: `order_status_enum`, `payment_method_enum`, `discount_type_enum`, `notification_type`, `staff_role`

RPC Functions: `get_my_profile()`, `get_user_role()`, `authorize_super_admin_or_error()`, `generate_slug()`

#### Types
- `src/types/supabase.ts` — 593 lines, auto-generated from Supabase schema
- Service-specific types in `src/services/*/types.ts`
- **Does NOT use `@meme/types`** from shared packages

#### Routing (Next.js App Router)
```
src/app/
├── (authentication)/
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   ├── update-password/
│   └── auth/          # API routes for auth flows
│       ├── sign-in/route.ts
│       ├── sign-up/route.ts
│       ├── sign-out/route.ts
│       ├── callback/route.ts
│       ├── forgot-password/route.ts
│       └── update-password/route.ts
├── (dashboard)/
│   ├── page.tsx                    # Dashboard home
│   ├── products/
│   │   ├── page.tsx               # Product list (table)
│   │   └── [slug]/page.tsx        # Product detail
│   ├── orders/
│   │   ├── page.tsx               # Order list
│   │   └── [id]/page.tsx          # Order detail
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx          # Customer orders
│   ├── categories/page.tsx
│   ├── coupons/page.tsx
│   ├── staff/page.tsx
│   └── edit-profile/page.tsx
└── layout.tsx                      # Root layout with providers
```

#### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

#### Migration Impact: **SEVERE**
- Every data operation must be rewritten (Supabase → Hono.js API calls)
- Auth system must be completely replaced
- Storage must be migrated (Supabase Storage → new solution)
- Server Actions must be rewritten
- Types must be regenerated
- Middleware auth must be replaced
- **UI components are safe** — shadcn/ui is framework-agnostic

---

### 2.2 Frontend Storefront (`apps/frontend/`)

#### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.7 |
| Language | TypeScript | 5.x |
| State Management | Redux Toolkit + redux-persist | 2.2.7 + 6.0.0 |
| UI Library | shadcn/ui (Radix primitives) | 10+ components |
| Styling | Tailwind CSS 3.4.1 | + animate plugin |
| Animations | Framer Motion | 11.5.4 |
| Carousel | Embla Carousel | 8.2.1 |
| Icons | lucide-react + react-icons | 0.438.0 + 5.3.0 |
| Rating | react-simple-star-rating | 5.1.7 |

#### Authentication — **NOT IMPLEMENTED**
- No auth pages, middleware, or token storage
- No login/register functionality
- No protected routes

#### State Management — Redux (Client-Side Only)
```
src/lib/store.ts
├── products slice: colorSelection, sizeSelection (client-only)
└── carts slice: cart, totalPrice, adjustedTotalPrice (persisted to localStorage)
```

**Cart persistence:** `redux-persist` → `localStorage` key `root`, whitelist: `["carts"]`

#### Data Fetching — **NOT IMPLEMENTED**
- **ZERO API calls** — all data is hardcoded in page files
- `src/app/page.tsx` — `newArrivalsData`, `topSellingData`, `relatedProductData` arrays
- `src/app/shop/page.tsx` — uses same static arrays
- `src/app/shop/product/[...slug]/page.tsx` — finds product from static data

#### API Client — EXISTS BUT UNUSED
- `@meme/api-client` package exists with full API coverage
- **Not imported anywhere in the frontend**
- Would need `NEXT_PUBLIC_API_URL` env var

#### Types — Local Only
- `src/types/product.types.ts` — `Product`, `Discount`
- `src/types/review.types.ts` — `Review`
- **Does NOT use `@meme/types`** from shared packages

#### Routing (Next.js App Router)
```
src/app/
├── page.tsx                        # Homepage (hero, brands, products)
├── cart/
│   └── page.tsx                    # Shopping cart
├── shop/
│   ├── page.tsx                    # Product listing (filters UI only)
│   └── product/[...slug]/page.tsx  # Product detail
```

**Missing routes:** auth, checkout, user profile, order history, search results

#### Environment Variables
- **NONE configured** — no `.env` files

#### Migration Impact: **MODERATE**
- UI is complete and safe — no changes needed to components
- Must wire up API calls to Hono.js backend
- Must implement authentication from scratch
- Must add checkout flow, user pages
- Cart must sync with backend (not just localStorage)
- Redux can be kept for cart but should sync with server

---

### 2.3 Backend (`apps/backend/`)

#### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | **Hono.js** | 4.11.4 |
| Runtime | Node.js + tsx | 4.7.1 |
| Database | MySQL (mysql2) | 3.16.1 |
| Auth | bcryptjs | 3.0.3 |
| Routing | hono-file-router | 0.0.5 |
| CORS | hono/cors | built-in |

**⚠️ SURPRISE FINDING:** The backend is ALREADY Hono.js + MySQL. The README says Express, but the code is Hono.

#### Authentication — Simple Token (NOT JWT)
- **Token format:** `customer-{id}` or `admin-{id}` (e.g., `Bearer customer-1`)
- **Password hashing:** bcrypt cost factor 12
- **Legacy support:** Auto-hashes plaintext passwords on first login
- **No auth middleware** — token extraction done manually in each handler
- **No JWT, no sessions, no refresh tokens**

#### Database — MySQL with Raw SQL
- **No ORM** — raw `mysql2` queries throughout
- **Connection pool:** `src/db/connection.ts`
- **Migrations:** `src/db/migrations/*.sql` (5 files)
- **Seed script:** `src/scripts/seed.ts`

#### MySQL Schema (9 tables)
```sql
admin           — id, username, email, password, created_at
category        — id, name, description
customer        — id, first_name, last_name, email, password, phone, address, city, postal_code, created_at
article         — id, name, description, price, stock_quantity, image_url, category_id, created_at
orders          — id, order_date, status, payment_status, total_amount, customer_id, tracking_number, carrier, estimated_delivery
order_details   — order_id, article_id, quantity, unit_price (composite PK)
specification   — id, name (UNIQUE)
article_specification — article_id, specification_id (composite PK)
contact_messages — id, name, email, subject, message, created_at
```

#### API Endpoints — 56 Total

| Category | Count | Auth Required |
|----------|-------|--------------|
| Auth (Customer) | 4 | Mixed |
| Auth (Admin) | 3 | Admin |
| Categories | 5 | Read: Public, Write: Admin |
| Articles/Products | 7 | Read: Public, Write: Admin |
| Customers | 4 | Admin/Self |
| Orders | 12 | Mixed |
| Order Details | 4 | Admin/Owner |
| Admin Management | 5 | Admin |
| Admin Dashboard | 11 | Admin |
| Payments | 1 | Customer |
| Specifications | 1 | Public |
| Contact | 1 | Public |
| System | 2 | Public |

**Complete endpoint list:** See `audit/002-api-contract-inventory.md`

#### Service Layer
```
src/services/
├── admin.service.ts        — Admin CRUD + dashboard stats
├── customer.service.ts     — Customer CRUD
├── article.service.ts      — Product CRUD + stock management
├── category.service.ts     — Category CRUD
├── order.service.ts        — Order CRUD + refund + tracking
├── orderDetails.service.ts — Order line items
├── payment.service.ts      — MOCK (always succeeds)
└── specification.service.ts — Product specifications
```

#### Error Handling
- **No global error handler** — each route handles errors individually
- **Response format:** `{ error: "Type", message: "Human readable" }`
- **Status codes:** 400, 401, 403, 404, 409, 402, 500

#### Validation
- **No validation library** — manual checks in each handler
- No Zod, Joi, or express-validator

#### File Upload
- `src/routes/api/upload/` exists but minimal implementation
- No actual file storage configured

#### Migration Impact: **LOW (already Hono + MySQL)**
- Backend framework is correct
- Database is correct
- Needs: JWT auth upgrade, input validation, global error handler, file upload, middleware-based auth protection

---

## 3. Shared Packages Audit

### 3.1 `@meme/types` (`packages/types/`)
- **104 lines** of TypeScript interfaces
- Exports: `Customer`, `Admin`, `Category`, `CategoryExtended`, `Article`, `Order`, `OrderDetail`, `Coupon`, `Staff`, `ApiResponse<T>`, `AuthResponse`, `PaginatedResponse<T>`
- **Used by:** `@meme/api-client` only
- **NOT used by:** frontend or admin (both define their own types)

### 3.2 `@meme/api-client` (`packages/api-client/`)
- **240 lines** — full API client using native `fetch`
- Covers: auth, articles, categories, orders, customers, admin dashboard, contact
- **Base URL:** `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'`
- **Token handling:** `setToken()` method, adds `Authorization` header
- **NOT imported by:** frontend or admin

### 3.3 `packages/ui/`
- **Empty/minimal** — only `src/` directory exists
- No components exported

---

## 4. Technology Dependencies Requiring Replacement

| Technology | Used By | Replacement Needed | Effort |
|-----------|---------|-------------------|--------|
| Supabase Auth | Admin | JWT/session-based auth | HIGH |
| Supabase DB (PostgreSQL) | Admin | MySQL via Hono.js API | HIGH |
| Supabase Storage | Admin | Local/S3 file storage | MEDIUM |
| Supabase RPC functions | Admin | Backend API endpoints | MEDIUM |
| Redux (frontend) | Frontend | Keep or replace with server state | LOW |
| redux-persist | Frontend | Server-side cart sync | MEDIUM |
| Simple token auth | Backend | JWT with refresh tokens | MEDIUM |
| Manual validation | Backend | Zod validation middleware | MEDIUM |
| No global error handler | Backend | Centralized error middleware | LOW |
| Mock payment | Backend | Real payment integration | HIGH |
| Unused axios instance | Admin | Remove or use for API calls | LOW |

---

## 5. Type Safety Gaps

| Gap | Description | Impact |
|-----|-------------|--------|
| Frontend types ≠ shared types | Frontend uses `Product` (local), backend uses `Article` (shared) | Type mismatch on API boundary |
| Admin types ≠ shared types | Admin uses Supabase-generated types, not `@meme/types` | No end-to-end type safety |
| Admin uses PostgreSQL types | Supabase types include PostgreSQL-specific features | Won't map to MySQL |
| No API response type enforcement | Backend doesn't validate response shapes | Runtime type errors possible |
| `api-client` uses `any` for dashboard endpoints | `getAdminStats()`, `getTopProducts()`, etc. return `ApiResponse<any>` | No type safety for admin dashboard |

---

## 6. Architecture Map — Current State

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONOREPO (Turborepo)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   apps/admin     │    │  apps/frontend   │                   │
│  │  Next.js 14.1.4  │    │  Next.js 14.2.7  │                   │
│  │                  │    │                  │                   │
│  │  Supabase Auth   │    │  NO AUTH         │                   │
│  │  Supabase DB     │    │  Redux (static)  │                   │
│  │  Supabase Storage│    │  NO API calls    │                   │
│  │  TanStack Query  │    │  shadcn/ui       │                   │
│  │  Server Actions  │    │  Framer Motion   │                   │
│  │  shadcn/ui       │    │                  │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           │ Direct Supabase       │ NO CONNECTION                │
│           │ Client calls          │ to anything                  │
│           ▼                       ▼                              │
│  ┌──────────────────────────────────────────────────┐           │
│  │              Supabase (PostgreSQL)               │           │
│  │  Auth + Database + Storage + RPC Functions       │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │              apps/backend (ISOLATED)              │           │
│  │  Hono.js + MySQL + 56 endpoints                  │           │
│  │  Simple token auth (NOT JWT)                     │           │
│  │  Raw SQL queries, no ORM                         │           │
│  │  NOT connected to admin or frontend              │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  @meme/types     │    │ @meme/api-client │                   │
│  │  (shared types)  │    │  (unused)        │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Problem:** The admin talks directly to Supabase (bypassing the backend entirely). The frontend is completely disconnected. The backend exists but serves no one.
