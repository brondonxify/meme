# Web Site

A monorepo containing a full-stack web application built with Next.js, Express, and TypeScript, managed with pnpm and Turborepo.

## Project Structure

```
web-site/
├── apps/
│   ├── backend/     # Express.js API server
│   ├── frontend/    # Next.js web application
│   └── shared/      # Shared types and utilities
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js (v18 or later)
- pnpm (v10.28.0)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   Edit the `.env` files in each app as needed.

3. Run the development servers:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm start` - Start all apps in production mode

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Express.js, TypeScript
- **Monorepo Tool:** Turborepo
- **Package Manager:** pnpm
