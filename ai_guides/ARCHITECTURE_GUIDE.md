# YATA Architecture Guide

> All major architectural decisions, finalized stack, auth flow, database strategy, and data fetching patterns — with code examples.

## Finalized Stack

| Layer         | Tech                                                        |
| ------------- | ----------------------------------------------------------- |
| Frontend      | Next.js 16 (Turbopack), React 19, shadcn/ui, Zod, superjson |
| Data Fetching | TanStack Query (client) + `fetch()` (server)                |
| Auth          | Clerk (`@clerk/nextjs`, middleware)                         |
| Backend       | Go (Gin), pgx/v5, godotenv                                  |
| DB            | PostgreSQL (via pgx connection pool)                        |
| Monorepo      | Turborepo + Bun                                             |

### Key Decisions Made

| Question                    | Decision                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| TanStack Query?             | **Yes, from day one.** Chat, AI, dashboards, and real-time features demand it.                            |
| tRPC?                       | **No.** Requires TS on both sides. Go backend is incompatible.                                            |
| gRPC?                       | **No.** Adds complexity without clear benefit — no TS client gen means no type safety gains for frontend. |
| Type safety?                | **OpenAPI codegen** (swaggo → openapi-typescript) or manual Zod schemas.                                  |
| Own Postgres for user data? | **Yes.** Cache Clerk profile data locally. Never store credentials.                                       |
| Sync strategy?              | **Clerk Webhooks** (primary) + **JIT sync** (fallback for missed webhooks).                               |

---

## Part 1: Data Fetching Architecture

### How Data Flows

```
┌────────────────────────────────────────────────────────────┐
│                     Next.js 16                              │
│                                                             │
│  Server Components                                          │
│    └─ fetch() to Go API ─── prefetchQuery() ──┐            │
│                                                ▼            │
│                                         HydrationBoundary   │
│                                                │            │
│  Client Components                             ▼            │
│    └─ useQuery() / useMutation()  (reads hydrated cache)   │
│       TanStack Query handles caching, polling, optimistic  │
└────────────────────────┬───────────────────────────────────┘
                         │ Bearer JWT (from Clerk)
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   Go (Gin) REST API                         │
│  Clerk JWT middleware → Handlers → Repository → Postgres   │
└────────────────────────────────────────────────────────────┘
```

### Why TanStack Query From Day One

| YATA Feature          | Why TanStack Query Is Needed                                                       |
| --------------------- | ---------------------------------------------------------------------------------- |
| Per-ticket chat       | Real-time, client-heavy. `useQuery` + `refetchInterval` for polling / WebSocket.   |
| AI streaming          | Client-side state to append streaming tokens. `useMutation` for prompt submission. |
| Tagging users         | Autocomplete = rapid debounced client requests. Dynamic `queryKey` per keystroke.  |
| Performance Dashboard | Live metrics. `useQuery({ refetchInterval: 5000 })` for polling.                   |
| Ticket CRUD           | `useMutation` + `invalidateQueries` for instant optimistic updates.                |
| PWA / Offline         | `persistQueryClient` plugin → persist cache to IndexedDB for offline access.       |
| Search/Pagination     | URL params drive `queryKey`, `keepPreviousData` prevents layout shift.             |

### TanStack Query Setup

```tsx
// lib/get-query-client.ts
import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// React cache() scopes one QueryClient per server request (not per component)
// Different requests get different clients — no data leaking between users
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // don't refetch for 60s after hydration
        },
      },
    }),
);

export default getQueryClient;
```

```tsx
// components/providers.tsx — Add QueryClientProvider
"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

// Browser: reuse the same client. Server: always create new.
let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function ClerkProviderWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <ClerkProvider
      appearance={{ theme: resolvedTheme === "dark" ? dark : undefined }}
    >
      {children}
    </ClerkProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkProviderWithTheme>{children}</ClerkProviderWithTheme>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
```

### Server Component Prefetch + Hydration Pattern

```tsx
// app/org/[slug]/tickets/page.tsx
import { auth } from "@clerk/nextjs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/lib/get-query-client";
import { TicketBoard } from "@/components/ticket-board";

async function fetchTickets(slug: string, token: string) {
  const res = await fetch(`${process.env.API_URL}/orgs/${slug}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { getToken } = await auth();
  const token = (await getToken())!;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["tickets", slug],
    queryFn: () => fetchTickets(slug, token),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Client component — reads from hydrated cache, no refetch */}
      <TicketBoard orgSlug={slug} />
    </HydrationBoundary>
  );
}
```

```tsx
// components/ticket-board.tsx — Client Component
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function TicketBoard({ orgSlug }: { orgSlug: string }) {
  const queryClient = useQueryClient();

  // Reads from hydrated cache on first render — instant, no loading spinner
  const { data, isLoading } = useQuery({
    queryKey: ["tickets", orgSlug],
    queryFn: () =>
      fetch(`/api/proxy/orgs/${orgSlug}/tickets`).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (newTicket: { title: string }) =>
      fetch(`/api/proxy/orgs/${orgSlug}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      }),
    onSuccess: () => {
      // Invalidate → any component using ["tickets", orgSlug] auto-refetches
      queryClient.invalidateQueries({ queryKey: ["tickets", orgSlug] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ticketId: string) =>
      fetch(`/api/proxy/tickets/${ticketId}`, { method: "DELETE" }),
    // Optimistic update: remove from cache immediately
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ["tickets", orgSlug] });
      const previous = queryClient.getQueryData(["tickets", orgSlug]);
      queryClient.setQueryData(["tickets", orgSlug], (old: any) => ({
        ...old,
        tickets: old.tickets.filter((t: any) => t.id !== ticketId),
      }));
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Revert on error
      queryClient.setQueryData(["tickets", orgSlug], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", orgSlug] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => createMutation.mutate({ title: "New Ticket" })}>
        Create Ticket
      </button>
      {data?.tickets?.map((ticket: any) => (
        <div key={ticket.id}>
          <span>{ticket.title}</span>
          <button onClick={() => deleteMutation.mutate(ticket.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Part 2: Authentication — Clerk → Go Backend

### The Complete Auth Flow

```
1. User visits Next.js page
2. Clerk middleware (proxy.ts) checks auth
3. Server Component calls auth() → getToken() → JWT
4. Next.js sends JWT as Bearer token to Go API
5. Go Gin middleware verifies JWT using clerk-sdk-go
6. Go extracts clerk_user_id from JWT claims
7. Go looks up user in Postgres by clerk_id
8. If user not found → JIT sync (fetch from Clerk API, insert into Postgres)
9. Go processes request and returns response
```

### Next.js Side — Sending the JWT

```tsx
// lib/api.ts — Centralized API helper
import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.API_URL!; // http://localhost:8080

export async function apiGet<T>(path: string): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
```

### Go Side — Auth Middleware (Using Clerk's Built-in Middleware)

Clerk's SDK provides `RequireHeaderAuthorization` which handles JWT verification **with built-in JWKS caching** (1hr TTL). Since it wraps `http.Handler` (not Gin's `gin.HandlerFunc`), we use a small adapter.

> **Why Clerk's built-in over custom?**
> Our custom `jwt.Verify()` call hits Clerk's JWKS endpoint on **every request**. Clerk's built-in middleware caches the public key for 1 hour, which is faster and won't get rate-limited.

```go
// internal/config/config.go
package config

import (
    "log"
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    DATABASE_URL               string
    PORT                       string
    CLERK_SECRET_KEY           string
    CLERK_WEBHOOK_SIGNING_SECRET string
}

func LoadConfig() (*Config, error) {
    err := godotenv.Load()
    if err != nil {
        log.Println("Unable to load .env file", err)
        return nil, err
    }

    config := &Config{
        DATABASE_URL:               os.Getenv("DATABASE_URL"),
        PORT:                       os.Getenv("PORT"),
        CLERK_SECRET_KEY:           os.Getenv("CLERK_SECRET_KEY"),
        CLERK_WEBHOOK_SIGNING_SECRET: os.Getenv("CLERK_WEBHOOK_SIGNING_SECRET"),
    }

    return config, nil
}
```

```go
// internal/middlewares/clerk_auth.go
package middlewares

import (
    "net/http"

    "github.com/clerk/clerk-sdk-go/v2"
    clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
    "github.com/gin-gonic/gin"
)

// ClerkAuthMiddleware wraps Clerk's built-in RequireHeaderAuthorization
// for use with Gin. It verifies the JWT, caches JWKS keys (1hr TTL),
// and puts SessionClaims into the request context.
func ClerkAuthMiddleware() gin.HandlerFunc {
    // Clerk's built-in middleware — handles:
    // 1. Extracting Bearer token from Authorization header
    // 2. Fetching & caching JWKS public keys
    // 3. Verifying JWT signature + expiry
    // 4. Setting SessionClaims in request context
    clerkMiddleware := clerkhttp.RequireHeaderAuthorization()

    return func(c *gin.Context) {
        // Wrap Gin's handler chain as an http.Handler for Clerk's middleware
        handler := clerkMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Transfer enriched context (with claims) back to Gin
            c.Request = r
            c.Next()
        }))

        handler.ServeHTTP(c.Writer, c.Request)
    }
}

// RequireOrg middleware — use AFTER ClerkAuthMiddleware.
// Ensures the user has an active organization selected.
func RequireOrg() gin.HandlerFunc {
    return func(c *gin.Context) {
        claims, ok := clerk.SessionClaimsFromContext(c.Request.Context())
        if !ok || claims.ActiveOrganizationID == "" {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
                "error": "No organization selected",
            })
            return
        }
        c.Next()
    }
}
```

#### Accessing Claims in Handlers

`SessionClaims` has first-class fields for org info — **no type assertions needed**:

```go
// In any handler after ClerkAuthMiddleware runs:
func listTicketsHandler(pool *pgxpool.Pool) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Clerk's helper reads claims from request context
        claims, ok := clerk.SessionClaimsFromContext(c.Request.Context())
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        // Standard JWT claims
        userId := claims.Subject                          // "user_2nFbKl9xRz"

        // Clerk-specific org claims (first-class fields, not a map)
        orgId := claims.ActiveOrganizationID              // "org_abc123" or ""
        orgSlug := claims.ActiveOrganizationSlug          // "my-startup" or ""
        orgRole := claims.ActiveOrganizationRole          // "org:admin" or ""

        // Built-in permission/role helpers
        if claims.HasPermission("org:tickets:manage") {
            // user can manage tickets
        }
        if claims.HasRole("org:admin") {
            // user is admin (prefer HasPermission over HasRole)
        }

        // ... use userId, orgId to scope your DB queries
    }
}
```

#### SessionClaims Struct (from clerk-sdk-go source)

```go
// What jwt.Verify() / clerk.SessionClaimsFromContext() returns:
type SessionClaims struct {
    RegisteredClaims                          // sub, iss, aud, exp, iat, nbf, jti
    Claims                                    // Clerk-specific fields (below)
    Custom any `json:"-"`                     // For your own custom claims
}

type RegisteredClaims struct {
    Subject   string   `json:"sub"`           // Clerk user ID
    Issuer    string   `json:"iss"`
    Audience  []string `json:"aud"`
    Expiry    *int64   `json:"exp"`
    IssuedAt  *int64   `json:"iat"`
    // ...
}

type Claims struct {
    SessionID                     string   `json:"sid"`
    ActiveOrganizationID          string   `json:"org_id"`
    ActiveOrganizationSlug        string   `json:"org_slug"`
    ActiveOrganizationRole        string   `json:"org_role"`
    ActiveOrganizationPermissions []string `json:"org_permissions"`
    AuthorizedParty               string   `json:"azp"`
    // ...
}
```

```go
// cmd/api/main.go — Wire everything together
package main

import (
    "log"
    "net/http"

    "github.com/clerk/clerk-sdk-go/v2"
    "github.com/gin-gonic/gin"

    "yata/apps/server/internal/config"
    "yata/apps/server/internal/database"
    "yata/apps/server/internal/middlewares"
)

func main() {
    cfg, err := config.LoadConfig()
    if err != nil {
        log.Fatal("Failed to load configuration")
    }

    // Initialize Clerk SDK with your secret key
    clerk.SetKey(cfg.CLERK_SECRET_KEY)

    pool, err := database.Connect(cfg.DATABASE_URL)
    if err != nil {
        log.Fatal("Failed to connect to the database", err)
    }
    defer pool.Close()

    router := gin.Default()

    // Public routes (no auth required)
    router.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"message": "Server Healthy.", "code": 200})
    })
    router.POST("/webhooks/clerk", clerkWebhookHandler(pool, cfg.CLERK_WEBHOOK_SIGNING_SECRET))

    // Protected routes (auth required)
    api := router.Group("/api")
    api.Use(middlewares.ClerkAuthMiddleware())
    {
        // User routes
        api.GET("/me", getMeHandler(pool))

        // ──────────────────────────────────────────────
        // Personal tickets (no org required)
        // Any authenticated user can CRUD their own tickets
        // and chat with AI about them (no team chat)
        // ──────────────────────────────────────────────
        personal := api.Group("/tickets")
        {
            personal.GET("", listPersonalTicketsHandler(pool))
            personal.POST("", createPersonalTicketHandler(pool))
            personal.GET("/:ticketId", getPersonalTicketHandler(pool))
            personal.PATCH("/:ticketId", updatePersonalTicketHandler(pool))
            personal.DELETE("/:ticketId", deletePersonalTicketHandler(pool))

            // AI chat on personal tickets (1:1 with AI, no team members)
            personal.GET("/:ticketId/chat", listPersonalChatHandler(pool))
            personal.POST("/:ticketId/chat", sendPersonalChatHandler(pool))   // AI responds
        }

        // ──────────────────────────────────────────────
        // Org-scoped routes (require active org)
        // Team tickets with full team chat + AI
        // ──────────────────────────────────────────────
        org := api.Group("/orgs/:slug")
        org.Use(middlewares.RequireOrg())
        {
            org.GET("/tickets", listTicketsHandler(pool))
            org.POST("/tickets", createTicketHandler(pool))
            org.GET("/tickets/:ticketId", getTicketHandler(pool))
            org.PATCH("/tickets/:ticketId", updateTicketHandler(pool))
            org.DELETE("/tickets/:ticketId", deleteTicketHandler(pool))

            // Team chat on org tickets (tag members, AI participates)
            org.GET("/tickets/:ticketId/chat", listChatHandler(pool))
            org.POST("/tickets/:ticketId/chat", sendChatHandler(pool))
            org.POST("/tickets/:ticketId/chat/ai", askAIChatHandler(pool))    // AI in team context
        }
    }

    router.Run(":" + cfg.PORT)
}
```

```go
// internal/handlers/user_handler.go — JIT sync example
package handlers

import (
    "net/http"

    "github.com/clerk/clerk-sdk-go/v2"
    clerkuser "github.com/clerk/clerk-sdk-go/v2/user"
    "github.com/gin-gonic/gin"
    "github.com/jackc/pgx/v5/pgxpool"
)

// GetOrCreateUser — JIT sync: if user exists in Clerk JWT but not in Postgres,
// fetch from Clerk API and create locally. Handles missed webhooks.
func GetOrCreateUser(c *gin.Context, pool *pgxpool.Pool, clerkUserId string) (*User, error) {
    // Try to find user in our DB first
    user, err := GetUserByClerkID(c.Request.Context(), pool, clerkUserId)
    if err == nil {
        return user, nil
    }

    // Not found — webhook was probably missed
    // Fetch from Clerk Backend API
    clerkUser, err := clerkuser.Get(c.Request.Context(), clerkUserId)
    if err != nil {
        return nil, err
    }

    // Extract primary email
    var email string
    for _, addr := range clerkUser.EmailAddresses {
        if addr.ID == *clerkUser.PrimaryEmailAddressID {
            email = addr.EmailAddress
            break
        }
    }

    // Create in our DB
    newUser := &User{
        ClerkID:   clerkUserId,
        Email:     email,
        Name:      fullName(clerkUser.FirstName, clerkUser.LastName),
        AvatarURL: safeString(clerkUser.ImageURL),
    }

    err = CreateUser(c.Request.Context(), pool, newUser)
    if err != nil {
        return nil, err
    }

    return newUser, nil
}
```

### Go Server `.env`

```env
# apps/server/.env
DATABASE_URL=postgresql://user:password@localhost:5432/yata?sslmode=disable
PORT=8080
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Part 3: Clerk Webhook Sync — Users, Orgs, Memberships

### Webhook Handler (Go)

```go
// internal/handlers/webhook_handler.go
package handlers

import (
    "encoding/json"
    "io"
    "net/http"

    svix "github.com/svix/svix-webhooks/go"
    "github.com/gin-gonic/gin"
    "github.com/jackc/pgx/v5/pgxpool"
)

type WebhookEvent struct {
    Type string          `json:"type"`
    Data json.RawMessage `json:"data"`
}

type ClerkUserData struct {
    ID                    string `json:"id"`
    FirstName             string `json:"first_name"`
    LastName              string `json:"last_name"`
    ImageURL              string `json:"image_url"`
    PrimaryEmailAddressID string `json:"primary_email_address_id"`
    EmailAddresses        []struct {
        ID           string `json:"id"`
        EmailAddress string `json:"email_address"`
    } `json:"email_addresses"`
}

func ClerkWebhookHandler(pool *pgxpool.Pool, webhookSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 1. Read body
        body, err := io.ReadAll(c.Request.Body)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot read body"})
            return
        }

        // 2. Verify signature using svix
        wh, err := svix.NewWebhook(webhookSecret)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook init failed"})
            return
        }

        headers := http.Header{}
        headers.Set("svix-id", c.GetHeader("svix-id"))
        headers.Set("svix-timestamp", c.GetHeader("svix-timestamp"))
        headers.Set("svix-signature", c.GetHeader("svix-signature"))

        err = wh.Verify(body, headers)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
            return
        }

        // 3. Parse event
        var event WebhookEvent
        if err := json.Unmarshal(body, &event); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
            return
        }

        // 4. Handle event types
        ctx := c.Request.Context()

        switch event.Type {
        case "user.created":
            var userData ClerkUserData
            json.Unmarshal(event.Data, &userData)

            email := getPrimaryEmail(userData)
            name := userData.FirstName + " " + userData.LastName

            _, err = pool.Exec(ctx,
                `INSERT INTO users (clerk_id, email, name, avatar_url)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (clerk_id) DO NOTHING`,
                userData.ID, email, name, userData.ImageURL,
            )

        case "user.updated":
            var userData ClerkUserData
            json.Unmarshal(event.Data, &userData)

            email := getPrimaryEmail(userData)
            name := userData.FirstName + " " + userData.LastName

            _, err = pool.Exec(ctx,
                `UPDATE users
                 SET email = $1, name = $2, avatar_url = $3, updated_at = NOW()
                 WHERE clerk_id = $4`,
                email, name, userData.ImageURL, userData.ID,
            )

        case "user.deleted":
            var data struct{ ID string `json:"id"` }
            json.Unmarshal(event.Data, &data)

            _, err = pool.Exec(ctx,
                `UPDATE users SET deleted_at = NOW() WHERE clerk_id = $1`,
                data.ID,
            )
        }

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"received": true})
    }
}

func getPrimaryEmail(u ClerkUserData) string {
    for _, addr := range u.EmailAddresses {
        if addr.ID == u.PrimaryEmailAddressID {
            return addr.EmailAddress
        }
    }
    if len(u.EmailAddresses) > 0 {
        return u.EmailAddresses[0].EmailAddress
    }
    return ""
}
```

---

## Part 4: Database Schema for Auth

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id    TEXT UNIQUE NOT NULL,
    email       TEXT NOT NULL,
    name        TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ          -- soft delete
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

---

## Part 5: Industry Pattern Summary

### How Auth + Own DB Works at Scale

```
                              Auth Source of Truth
1. User signs up        →    Clerk handles it
2. Clerk fires webhook  →    Go backend creates row in Postgres
3. User makes request   →    Next.js gets JWT → sends to Go → Go verifies
4. Go resolves user     →    Lookup by clerk_id in local users table
5. If user missing      →    JIT sync: fetch from Clerk API, insert into Postgres
6. User updates profile →    Clerk fires webhook → Go updates cached data
```

| Company      | Auth Provider        | Pattern                                       |
| ------------ | -------------------- | --------------------------------------------- |
| **Linear**   | Clerk                | Webhooks + own Postgres for all business data |
| **Supabase** | GoTrue (self-hosted) | Auth triggers → `public.users` table sync     |
| **Vercel**   | Own + third-party    | Webhook sync to own DB                        |

### Why This Pattern

- **Separation of concerns** — Auth is hard; let Clerk do it
- **Performance** — Queries JOIN against local `users` table, not external API
- **Data sovereignty** — Your business data stays in your DB
- **Flexibility** — Switch auth providers without touching business logic
- **Auditability** — Local record of all user actions

---

## Sources & Links

### Clerk

| Topic                     | Link                                                        |
| ------------------------- | ----------------------------------------------------------- |
| Clerk Go SDK              | https://github.com/clerk/clerk-sdk-go                       |
| JWT Verification          | https://clerk.com/docs/backend-requests/handling/manual-jwt |
| Webhooks Guide            | https://clerk.com/docs/webhooks/overview                    |
| Sync Data Guide           | https://clerk.com/docs/users/sync-data                      |
| Svix Webhook Verification | https://docs.svix.com/receiving/verifying-payloads/how      |

### TanStack Query

| Topic                    | Link                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| SSR + Next.js App Router | https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr       |
| Mutations                | https://tanstack.com/query/latest/docs/framework/react/guides/mutations          |
| Optimistic Updates       | https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates |

### Type Safety (Future)

| Topic              | Link                                  |
| ------------------ | ------------------------------------- |
| swaggo/swag        | https://github.com/swaggo/swag        |
| openapi-typescript | https://openapi-ts.dev/               |
| openapi-fetch      | https://openapi-ts.dev/openapi-fetch/ |
