# Target Architecture — Hono.js + MySQL Monorepo

**Date:** 2026-04-05
**Status:** Proposed

---

## 1. Design Principles

1. **Single source of truth** — All data flows through Hono.js backend
2. **Type-safe contracts** — Shared types enforced at API boundary via Zod
3. **No direct DB access from frontends** — Admin and frontend are pure API consumers
4. **Preserve UI** — Zero visual changes to admin or frontend
5. **Progressive migration** — Each step is independently deployable and testable

---

## 2. Target Monorepo Structure

```
web-site/
├── apps/
│   ├── client/                    # Renamed from "frontend"
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   ├── components/       # UI components (preserved)
│   │   │   ├── lib/
│   │   │   │   ├── store.ts      # Redux store (kept for cart)
│   │   │   │   ├── features/     # Redux slices
│   │   │   │   ├── api/          # NEW: API integration layer
│   │   │   │   └── hooks/        # Custom hooks
│   │   │   ├── types/            # Will use @meme/types
│   │   │   └── styles/
│   │   ├── .env.local            # NEW: NEXT_PUBLIC_API_URL
│   │   └── package.json
│   │
│   ├── admin/                     # Kept as-is (rename from current)
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router (structure preserved)
│   │   │   ├── components/       # UI components (preserved)
│   │   │   ├── lib/
│   │   │   │   ├── api/          # NEW: HTTP client replacing Supabase
│   │   │   │   ├── auth/         # NEW: JWT auth utilities
│   │   │   │   └── query/        # TanStack Query config (preserved)
│   │   │   ├── services/         # REWRITTEN: API service layer
│   │   │   ├── actions/          # REWRITTEN: Server actions → API calls
│   │   │   ├── contexts/         # REWRITTEN: UserContext for JWT
│   │   │   ├── middleware.ts     # REPLACED: JWT session validation
│   │   │   └── types/            # REGENERATED: From @meme/types
│   │   ├── .env.local            # NEW: NEXT_PUBLIC_API_URL, JWT_SECRET
│   │   └── package.json
│   │
│   └── backend/                   # Enhanced (already Hono + MySQL)
│       ├── src/
│       │   ├── index.ts          # Hono app entry
│       │   ├── db/
│       │   │   ├── connection.ts  # MySQL pool
│       │   │   └── migrations/    # SQL migration files
│       │   ├── middleware/        # NEW: Auth, validation, error handling
│       │   │   ├── auth.ts        # JWT verification middleware
│       │   │   ├── validate.ts    # Zod validation middleware
│       │   │   └── error.ts       # Global error handler
│       │   ├── routes/            # File-based routes (preserved pattern)
│       │   │   └── api/
│       │   │       ├── auth/      # JWT auth endpoints
│       │   │       ├── articles/  # Product CRUD
│       │   │       ├── categories/
│       │   │       ├── orders/
│       │   │       ├── customers/
│       │   │       ├── admin/
│       │   │       └── upload/    # File upload endpoint
│       │   ├── services/          # Business logic (preserved pattern)
│       │   └── utils/
│       ├── .env
│       └── package.json
│
├── packages/
│   ├── types/                     # ENHANCED: Single source of truth
│   │   └── src/
│   │       ├── index.ts           # All shared interfaces
│   │       ├── api.ts             # Request/Response types
│   │       ├── auth.ts            # Auth-related types
│   │       └── entities.ts        # Domain entity types
│   │
│   ├── api-client/                # ENHANCED: Used by both frontends
│   │   └── src/
│   │       ├── index.ts           # ApiClient class
│   │       ├── auth.ts            # Auth methods
│   │       ├── products.ts        # Product methods
│   │       ├── orders.ts          # Order methods
│   │       ├── customers.ts       # Customer methods
│   │       ├── admin.ts           # Admin dashboard methods
│   │       └── types.ts           # Re-exports from @meme/types
│   │
│   └── config/                    # NEW: Shared configs
│       ├── tsconfig/              # Shared TypeScript configs
│       │   ├── base.json
│       │   ├── nextjs.json
│       │   └── node.json
│       └── eslint/                # Shared ESLint configs (optional)
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### Key Structural Changes

| Change | From | To | Rationale |
|--------|------|-----|-----------|
| Rename `apps/frontend` | `frontend` | `client` | Cleaner naming, matches your instruction |
| Add `packages/config` | N/A | Shared tsconfig/eslint | Eliminate config duplication |
| Split `api-client` | Single file | Modular by domain | Better maintainability, tree-shaking |
| Split `types` | Single file | Domain-separated files | Better organization, faster type-checking |
| Add `backend/middleware` | Inline in routes | Dedicated middleware dir | Proper separation of concerns |

---

## 3. Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MONOREPO (Turborepo + pnpm)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐           ┌──────────────────────┐            │
│  │    apps/client       │           │     apps/admin       │            │
│  │   Next.js 14.2.7     │           │   Next.js 14.1.4     │            │
│  │                      │           │                      │            │
│  │  Redux (cart)        │           │  TanStack Query      │            │
│  │  shadcn/ui           │           │  shadcn/ui           │            │
│  │  Framer Motion       │           │  react-hook-form     │            │
│  │  @meme/api-client    │           │  @meme/api-client    │            │
│  │  @meme/types         │           │  @meme/types         │            │
│  └──────────┬───────────┘           └──────────┬───────────┘            │
│             │                                   │                        │
│             │         HTTP (fetch)              │                        │
│             │         JWT Auth                  │                        │
│             └──────────────┬────────────────────┘                        │
│                            │                                             │
│                            ▼                                             │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │                    apps/backend                            │          │
│  │                   Hono.js 4.x                              │          │
│  │                                                            │          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │          │
│  │  │   Auth      │  │  Validation │  │  Error Handler  │   │          │
│  │  │  Middleware │  │  Middleware │  │   (global)      │   │          │
│  │  │  (JWT)      │  │  (Zod)      │  │                 │   │          │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │          │
│  │                                                            │          │
│  │  ┌──────────────────────────────────────────────────┐     │          │
│  │  │              Route Handlers                       │     │          │
│  │  │  /api/auth/*  /api/articles/*  /api/orders/*     │     │          │
│  │  │  /api/categories/*  /api/customers/*  /api/admin/*│    │          │
│  │  └──────────────────────────────────────────────────┘     │          │
│  │                                                            │          │
│  │  ┌──────────────────────────────────────────────────┐     │          │
│  │  │              Service Layer                        │     │          │
│  │  │  AdminService, CustomerService, ArticleService   │     │          │
│  │  │  CategoryService, OrderService, PaymentService   │     │          │
│  │  └──────────────────────────────────────────────────┘     │          │
│  └────────────────────────┬──────────────────────────────────┘          │
│                           │                                              │
│                           │ mysql2 (connection pool)                     │
│                           ▼                                              │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │                      MySQL 8.x                             │          │
│  │                                                            │          │
│  │  admin │ category │ customer │ article │ orders           │          │
│  │  order_details │ specification │ article_specification    │          │
│  │  contact_messages                                        │          │
│  └───────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │              packages/types (shared)                       │          │
│  │  Customer, Admin, Article, Category, Order, etc.          │          │
│  │  ApiResponse<T>, AuthResponse, PaginatedResponse<T>       │          │
│  └───────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │              packages/api-client (shared)                  │          │
│  │  Typed HTTP client used by BOTH client and admin          │          │
│  └───────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication Architecture (Target)

### 4.1 JWT-Based Auth

```
┌──────────────┐     POST /api/auth/login      ┌──────────────┐
│   Client     │ ────────────────────────────→  │   Backend    │
│   or Admin   │                                │  (Hono.js)   │
│              │ ←────────────────────────────  │              │
│              │   { token, refresh_token,      │              │
│              │     user, message }            │              │
│              │                                │              │
│  Store:      │     Subsequent requests        │              │
│  - httpOnly  │ ────────────────────────────→  │              │
│    cookie    │   Cookie: access_token=JWT     │              │
│  (browser)   │                                │              │
└──────────────┘                                └──────────────┘
```

### 4.2 Token Strategy

| Token | Type | Lifetime | Storage | Purpose |
|-------|------|----------|---------|---------|
| Access Token | JWT (RS256) | 15 minutes | httpOnly cookie | API authentication |
| Refresh Token | JWT (RS256) | 7 days | httpOnly cookie | Token renewal |

### 4.3 Auth Flow

1. **Login:** POST `/api/auth/login` → returns JWT pair in httpOnly cookies
2. **Authenticated requests:** Browser auto-sends cookies → backend middleware validates
3. **Token refresh:** POST `/api/auth/refresh` → uses refresh token to get new access token
4. **Logout:** POST `/api/auth/logout` → clears cookies, invalidates refresh token
5. **Admin auth:** Same flow, different endpoint `/api/auth/admin/login`, role embedded in JWT

### 4.4 JWT Payload

```typescript
interface JWTPayload {
  sub: number;          // user/admin ID
  role: 'customer' | 'admin' | 'super_admin';
  email: string;
  iat: number;          // issued at
  exp: number;          // expires at
}
```

### 4.5 Admin Middleware Replacement

**Current (Supabase):**
```typescript
// apps/admin/src/middleware.ts
const supabase = createMiddlewareClient({ req, res });
const { data: { session } } = await supabase.auth.getSession();
```

**Target (JWT):**
```typescript
// apps/admin/src/middleware.ts
import { verifyJwt } from '@meme/api-client/auth';
const token = req.cookies.get('access_token');
const payload = await verifyJwt(token?.value);
if (!payload) return NextResponse.redirect('/login');
```

---

## 5. Data Flow Architecture

### 5.1 Client (Frontend) Data Flow

```
User Action
    │
    ▼
React Component
    │
    ├──→ Redux dispatch (cart operations, local state)
    │       └──→ localStorage persistence (cart only)
    │
    └──→ @meme/api-client (server data)
            │
            ├──→ fetch() → Backend API
            │       └──→ Response → Component state
            │
            └──→ TanStack Query (optional: add for caching)
```

### 5.2 Admin Data Flow

```
User Action
    │
    ▼
React Component
    │
    ├──→ TanStack Query (read operations)
    │       └──→ @meme/api-client → Backend API
    │               └──→ Cached response
    │
    └──→ Server Action (write operations)
            └──→ @meme/api-client → Backend API
                    └──→ revalidatePath()
```

### 5.3 Backend Request Pipeline

```
HTTP Request
    │
    ▼
┌─────────────────┐
│  CORS Middleware │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Logger          │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Auth Middleware │ ← Skip for public routes
│  (JWT verify)   │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Zod Validation │ ← Validate request body/params
└────────┬────────┘
         ▼
┌─────────────────┐
│  Route Handler   │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Service Layer   │ ← Business logic
└────────┬────────┘
         ▼
┌─────────────────┐
│  MySQL Query     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Response Format │ ← { data, message, total, page, limit }
└─────────────────┘
```

---

## 6. Type Safety Strategy

### 6.1 Single Source of Truth

All types live in `packages/types/` and are consumed by:
- `packages/api-client/` — for typed API methods
- `apps/client/` — for component props and state
- `apps/admin/` — replacing Supabase-generated types
- `apps/backend/` — for response type annotations

### 6.2 Type Organization

```
packages/types/src/
├── index.ts              # Barrel export
├── entities/
│   ├── customer.ts       # Customer entity
│   ├── admin.ts          # Admin entity
│   ├── article.ts        # Product entity
│   ├── category.ts       # Category entity
│   ├── order.ts          # Order entity
│   └── specification.ts  # Specification entity
├── api/
│   ├── response.ts       # ApiResponse<T>, PaginatedResponse<T>
│   └── auth.ts           # AuthResponse, JWT types
└── requests/
    ├── article.ts        # CreateArticleRequest, UpdateArticleRequest
    ├── order.ts          # CreateOrderRequest
    └── auth.ts           # LoginRequest, RegisterRequest
```

### 6.3 Backend Type Enforcement

```typescript
// Backend route with Zod validation + typed response
import { z } from 'zod';
import type { ApiResponse, Article } from '@meme/types';

const createArticleSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0).default(0),
  image_url: z.string().url().optional(),
  category_id: z.number().int().positive(),
});

app.post('/api/articles', validate(createArticleSchema), async (c) => {
  const data = c.req.valid('json');
  const id = await ArticleService.create(data);
  return c.json<ApiResponse<Article>>({
    data: await ArticleService.getById(id),
    message: 'Article created successfully',
  });
});
```

---

## 7. File Storage Strategy

### 7.1 Current: Supabase Storage
- Bucket: `assets`
- Product images uploaded via Supabase SDK

### 7.2 Target: Local + CDN (Phase 1) → S3 (Phase 2)

**Phase 1 — Local Storage:**
```
apps/backend/
└── uploads/
    └── products/
        ├── {uuid}.jpg
        └── {uuid}.png
```

- Endpoint: `POST /api/upload/product`
- Serves files via: `GET /uploads/products/{filename}`
- Hono.js static file middleware

**Phase 2 — S3/Cloud Storage (future):**
- Swap storage adapter without changing API contract
- Admin and client remain unaffected

---

## 8. Environment Variables (Target)

### 8.1 Backend (`apps/backend/.env`)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecommerce
DB_PASSWORD=<secure>
DB_NAME=ecommerce

# JWT
JWT_SECRET=<256-bit-secret>
JWT_REFRESH_SECRET=<256-bit-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

### 8.2 Client (`apps/client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 8.3 Admin (`apps/admin/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

---

## 9. API Contract Standardization

### 9.1 Response Format (All Endpoints)

```typescript
// Success
{
  "data": T | T[],
  "message": "Operation successful",
  "total": 100,      // For paginated responses
  "page": 1,
  "limit": 20
}

// Error
{
  "error": "ValidationError",
  "message": "Email is required",
  "details": [       // Optional, for validation errors
    { "field": "email", "message": "Email is required" }
  ]
}
```

### 9.2 Endpoint Naming Convention

| Resource | Pattern | Example |
|----------|---------|---------|
| List | `GET /api/{resource}` | `GET /api/articles` |
| Detail | `GET /api/{resource}/:id` | `GET /api/articles/1` |
| Create | `POST /api/{resource}` | `POST /api/articles` |
| Update | `PUT /api/{resource}/:id` | `PUT /api/articles/1` |
| Delete | `DELETE /api/{resource}/:id` | `DELETE /api/articles/1` |
| Nested | `GET /api/{resource}/:id/{subresource}` | `GET /api/orders/1/items` |
| Action | `POST /api/{resource}/:id/{action}` | `POST /api/orders/1/cancel` |

---

## 10. What Changes vs What Stays

### 10.1 PRESERVE (No Changes)

| Component | Location | Reason |
|-----------|----------|--------|
| Client UI components | `apps/client/src/components/` | Visual design is complete |
| Client page layouts | `apps/client/src/app/` | Routing structure works |
| Client animations | Framer Motion usage | UX is polished |
| Client Tailwind config | `tailwind.config.ts` | Design system is set |
| Admin UI components | `apps/admin/src/components/ui/` | shadcn/ui is framework-agnostic |
| Admin page layouts | `apps/admin/src/app/(dashboard)/` | Navigation and structure works |
| Admin charts | Chart.js usage | Dashboard visuals are set |
| Admin table patterns | @tanstack/react-table | Data display works |
| Backend service pattern | `apps/backend/src/services/` | Good separation of concerns |
| Backend route pattern | File-based routing | Clean organization |
| Backend DB schema | MySQL tables | Already correct |
| Turborepo config | `turbo.json` | Build orchestration works |
| pnpm workspace | `pnpm-workspace.yaml` | Package management works |

### 10.2 REPLACE (Complete Rewrite)

| Component | Current | Target | Reason |
|-----------|---------|--------|--------|
| Admin auth | Supabase Auth | JWT via Hono.js | Remove Supabase dependency |
| Admin data access | Supabase client | @meme/api-client | Route through backend |
| Admin server actions | Direct Supabase calls | API calls via services | Centralize data layer |
| Admin middleware | Supabase session check | JWT cookie validation | Match new auth system |
| Admin types | Supabase-generated (593 lines) | @meme/types | Single source of truth |
| Admin storage | Supabase Storage | Backend upload endpoint | Remove Supabase dependency |

### 10.3 ADD (New Implementation)

| Component | Where | Purpose |
|-----------|-------|---------|
| JWT auth middleware | Backend | Secure all protected endpoints |
| Zod validation | Backend | Input validation on all endpoints |
| Global error handler | Backend | Consistent error responses |
| File upload endpoint | Backend | Product image uploads |
| Client API integration | Client | Wire up @meme/api-client |
| Client auth pages | Client | Login, register, profile |
| Client checkout flow | Client | Complete purchase flow |
| Shared tsconfig | packages/config | Eliminate duplication |
| Refresh token flow | Backend | Token renewal mechanism |
| Admin auth pages | Admin | Replace Supabase auth routes |
