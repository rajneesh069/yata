# Next.js 16+ Caching, Revalidation, URL Search Params & useSWR — The Complete Guide

## Part 1: The 4 Caching Layers (and Why Your Data Won't Refresh)

Next.js has **4 separate caches**. When your page "won't refresh", it's because one (or more) of these is serving stale data:

```
Browser Request
    ↓
1. Router Cache       (client-side, in-memory)
    ↓
2. Full Route Cache   (server, persists across requests)
    ↓
3. Data Cache         (server, persists across deployments)
    ↓
4. Request Memoization (per-request dedup)
    ↓
Your Go API
```

---

### Layer 1: Request Memoization (Per-Request)

**What**: If you call `fetch("http://go-api/tickets")` in both a layout _and_ a page during the same render, it only hits your Go API once.

**Duration**: Single server render pass only. Gone after the response is sent.

**You don't need to worry about this one.** It's always helpful and auto-clears.

---

### Layer 2: Data Cache (Server, Persistent) ⚠️ THE BIG ONE

**What**: Caches the raw response from `fetch()` calls on the server. Persists **across requests AND deployments**.

**Critical change in Next.js 15+**: `fetch()` is **NOT cached by default** in dynamic rendering. You must explicitly opt in:

```tsx
// ❌ NOT cached (default since Next.js 15 in dynamic routes)
const res = await fetch("http://go-api/tickets");

// ✅ Cached — stored in Data Cache
const res = await fetch("http://go-api/tickets", {
  cache: "force-cache",
});

// ✅ Cached with time-based revalidation
const res = await fetch("http://go-api/tickets", {
  next: { revalidate: 60 }, // revalidate every 60 seconds
});

// ✅ Cached with tag-based revalidation (most useful)
const res = await fetch("http://go-api/tickets", {
  next: { tags: ["tickets"] }, // tag it for on-demand invalidation
  cache: "force-cache",
});
```

> **⚠️ IMPORTANT**: If you're using dynamic APIs like `cookies()`, `headers()`, or `searchParams`, your route is **dynamically rendered** and `fetch()` won't cache unless you explicitly set `cache: "force-cache"` or `next: { revalidate: N }`.

---

### Layer 3: Full Route Cache (Server, Persistent)

**What**: Caches the **rendered HTML + RSC payload** of static routes at build time.

**Not relevant for YATA** because most routes use `auth()` from Clerk → `cookies()` → dynamic rendering, which bypasses this cache entirely.

---

### Layer 4: Router Cache (Client-side, In-Memory) ⚠️ THE OTHER SNEAKY ONE

**What**: When you navigate between pages with `<Link>`, Next.js caches the RSC payload in the browser's memory. Navigating back shows the cached version.

**Duration**:

- **Dynamic pages**: Not cached by default (but reused on browser back/forward)
- **Static pages**: 5 minutes
- **Full prefetch** (`<Link prefetch={true}>`): 5 minutes

**This is why `router.refresh()` exists** — to clear THIS cache.

---

## Part 2: The Revalidation Toolkit — When to Use What

### `revalidateTag("tickets")` — Invalidate by Tag

**Use when**: A Server Action mutates data, and you want to invalidate all `fetch()` calls tagged with that name.

**What it does**: Purges the **Data Cache** entries with that tag → invalidates **Full Route Cache** → invalidates **Router Cache** (when called from a Server Action).

#### Full Working Example — Ticket CRUD

```tsx
// lib/api.ts — Data fetching functions
export async function getTickets(orgSlug: string): Promise<Ticket[]> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${process.env.API_URL}/orgs/${orgSlug}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { tags: [`tickets-${orgSlug}`] }, // ← TAG IT
    cache: "force-cache",
  });

  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${process.env.API_URL}/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { tags: [`ticket-${id}`] }, // ← Granular tag
    cache: "force-cache",
  });

  if (!res.ok) throw new Error("Ticket not found");
  return res.json();
}
```

```tsx
// actions/tickets.ts — Server Actions for mutations
"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createTicket(orgSlug: string, formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${process.env.API_URL}/orgs/${orgSlug}/tickets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: formData.get("title"),
      description: formData.get("description"),
    }),
  });

  if (!res.ok) throw new Error("Failed to create ticket");

  revalidateTag(`tickets-${orgSlug}`); // ← Purges list cache, page auto-refreshes
}

export async function updateTicket(
  ticketId: string,
  orgSlug: string,
  formData: FormData,
) {
  const { getToken } = await auth();
  const token = await getToken();

  await fetch(`${process.env.API_URL}/tickets/${ticketId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: formData.get("title"),
      status: formData.get("status"),
    }),
  });

  // Invalidate BOTH the individual ticket AND the list
  revalidateTag(`ticket-${ticketId}`);
  revalidateTag(`tickets-${orgSlug}`);
}

export async function deleteTicket(ticketId: string, orgSlug: string) {
  const { getToken } = await auth();
  const token = await getToken();

  await fetch(`${process.env.API_URL}/tickets/${ticketId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  revalidateTag(`tickets-${orgSlug}`); // ← List refreshes, ticket gone
}
```

```tsx
// app/org/[slug]/tickets/page.tsx — Server Component (list page)
import { getTickets } from "@/lib/api";
import { CreateTicketForm } from "@/components/create-ticket-form";
import { TicketCard } from "@/components/ticket-card";
import { Suspense } from "react";

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tickets = await getTickets(slug); // uses tagged fetch

  return (
    <div>
      <h1>Tickets</h1>
      <CreateTicketForm orgSlug={slug} />
      <Suspense fallback={<div>Loading tickets...</div>}>
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} orgSlug={slug} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
```

```tsx
// components/create-ticket-form.tsx — Client Component (mutation)
"use client";

import { createTicket } from "@/actions/tickets";
import { useTransition, useState } from "react";

export function CreateTicketForm({ orgSlug }: { orgSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");

  function handleSubmit() {
    const formData = new FormData();
    formData.set("title", title);

    startTransition(async () => {
      await createTicket(orgSlug, formData);
      setTitle(""); // reset input after success
      // ✅ NO router.refresh() needed!
      // revalidateTag inside the Server Action auto-refreshes the list
    });
  }

  return (
    <div className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ticket title..."
        disabled={isPending}
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Creating..." : "Create Ticket"}
      </button>
    </div>
  );
}
```

```tsx
// components/ticket-card.tsx — Client Component (delete/update)
"use client";

import { deleteTicket, updateTicket } from "@/actions/tickets";
import { useTransition } from "react";

interface Ticket {
  id: string;
  title: string;
  status: string;
}

export function TicketCard({
  ticket,
  orgSlug,
}: {
  ticket: Ticket;
  orgSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => deleteTicket(ticket.id, orgSlug));
  }

  function handleStatusChange(newStatus: string) {
    const formData = new FormData();
    formData.set("status", newStatus);
    startTransition(() => updateTicket(ticket.id, orgSlug, formData));
  }

  return (
    <div className={`border p-4 rounded ${isPending ? "opacity-50" : ""}`}>
      <h3>{ticket.title}</h3>
      <span>{ticket.status}</span>
      <div className="flex gap-2 mt-2">
        <button onClick={() => handleStatusChange("in-progress")}>Start</button>
        <button onClick={() => handleStatusChange("done")}>Done</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
```

---

### `revalidatePath("/tickets")` — Invalidate by Path

**Use when**: You want to invalidate **everything** on a specific page.

```tsx
"use server";
import { revalidatePath } from "next/cache";

export async function createTicket(orgSlug: string, formData: FormData) {
  await fetch(/* ... */);

  // Option A: Revalidate a specific URL
  revalidatePath(`/org/${orgSlug}/tickets`);

  // Option B: Revalidate all URLs matching a dynamic route pattern
  revalidatePath("/org/[slug]/tickets", "page");

  // Option C: Revalidate a layout and everything beneath it
  revalidatePath("/org/[slug]", "layout");

  // Option D: Nuclear option — revalidate EVERYTHING
  revalidatePath("/");
}
```

> **⚠️ WARNING**: `revalidatePath` is a **sledgehammer**. It invalidates ALL cached fetches on that path. Use `revalidateTag` for precision.

---

### `router.refresh()` — Client-Side Router Cache Bust

**Use when**: You want the current page to re-render with fresh data from the server, but you **don't** need to invalidate the Data Cache.

**What it does**: Clears the **Router Cache** only. **Does NOT touch the Data Cache or Full Route Cache.**

```tsx
"use client";
import { useRouter } from "next/navigation";

function RefreshButton() {
  const router = useRouter();
  return <button onClick={() => router.refresh()}>Refresh</button>;
}
```

---

## Part 3: FAQ — The `router.refresh()` vs `revalidateTag()` Question

### Q: If I do `revalidateTag("some_tag")` in a Server Action but DON'T call `router.refresh()` in the client, will the page show old or new data?

**A: It will show NEW data. You do NOT need `router.refresh()`.**

When you call `revalidateTag("some_tag")` inside a **Server Action**, Next.js does three things automatically:

1. Purges the **Data Cache** entries with that tag ✅
2. Invalidates the **Full Route Cache** ✅
3. Invalidates the **Router Cache** and re-renders the page with fresh data ✅

Server Actions have a **built-in integration with the Router Cache**. After the action finishes, Next.js triggers a re-render of the current route. No `router.refresh()` needed.

### Q: If both my mutation component and list component are Client Components, how do they sync?

**A: You have 3 options, depending on your data fetching strategy:**

#### Option A: Server Action + Server Component List (Pure Next.js, Recommended)

Keep data fetching in a Server Component, mutations via Server Actions:

```tsx
// Server Component — fetches and renders the list
export default async function TicketsPage() {
  const tickets = await getTickets(); // tagged fetch
  return (
    <>
      <CreateButton /> {/* Client: triggers Server Action */}
      <TicketList tickets={tickets} /> {/* Receives data as props */}
    </>
  );
}

// Client Component — triggers mutation
("use client");
export function CreateButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(() => createTicketAction())}>
      {isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

`revalidateTag` in the Server Action auto-refreshes the Server Component parent, which passes new props to the list.

#### Option B: TanStack Query (Best for highly interactive apps)

```tsx
// Component A — mutates
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createTicket,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
});

// Component B — separate component, auto-refetches when queryKey is invalidated
const { data } = useQuery({ queryKey: ["tickets"], queryFn: fetchTickets });
```

#### Option C: `router.refresh()` (Last resort)

If both components are client-side and you're not using TanStack Query:

```tsx
const router = useRouter();
async function handleCreate() {
  await fetch("/api/tickets", { method: "POST" });
  router.refresh(); // clears Router Cache, triggers server re-render
}
```

This only works if data flows from a Server Component parent down as props.

### Q: When DO I need `router.refresh()`?

Only when you mutate data **outside** of a Server Action (e.g., calling your Go API directly from a client `fetch`) and the mutation doesn't go through Next.js's Server Action pipeline. But even then, it only clears the Router Cache — not the Data Cache.

---

### Quick Reference: What Each Tool Purges

| Tool               | Data Cache | Full Route Cache | Router Cache | Auto re-render? |
| ------------------ | ---------- | ---------------- | ------------ | --------------- |
| `revalidateTag`    | ✅ Tagged  | ✅               | ✅ (from SA) | ✅ (from SA)    |
| `revalidatePath`   | ✅ All     | ✅               | ✅ (from SA) | ✅ (from SA)    |
| `router.refresh()` | ❌         | ❌               | ✅           | ✅              |
| `fetch` no-cache   | N/A        | N/A              | N/A          | N/A             |

_SA = Server Action. From Route Handlers, Router Cache is NOT immediately invalidated._

---

### Common Mistakes & Fixes

| Mistake                                         | Why It Fails                                                  | Fix                                                       |
| ----------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| Used `router.refresh()` after mutation          | Doesn't clear Data Cache                                      | Use `revalidateTag` in a Server Action instead            |
| Called `revalidateTag` in a Route Handler       | Doesn't immediately invalidate Router Cache (only next visit) | Call it from a Server Action for instant UI update        |
| Fetch has `cache: "force-cache"` with no tags   | Data Cache stores it forever, nothing invalidates it          | Add `next: { tags: [...] }`                               |
| Using `cookies()`/`headers()` expecting caching | Route becomes dynamic, fetch isn't cached anyway              | Use `cache: "force-cache"` explicitly if you want caching |

---

## Part 4: URL Search Params Pattern — Eliminate Client State

### Why URL Params Instead of `useState`?

Next.js **strongly recommends** using URL search parameters for:

- **Search/filtering**: `?query=bug`
- **Pagination**: `?page=2`
- **Sorting**: `?sort=created_at&order=desc`
- **Tabs**: `?tab=assigned`
- **Modals**: `?modal=create-ticket`

**Benefits:**

- 📌 **Bookmarkable/Shareable** — Users can share `"/tickets?query=bug&page=2"`
- 🖥️ **SSR-friendly** — Server Components read params directly
- 📊 **Analytics** — Track what users search/filter without extra code
- 🔄 **No state sync bugs** — URL is the single source of truth

### Full Working Example — Search + Filter + Pagination

```tsx
// components/search-filter.tsx — Client Component
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Debounce: wait 300ms after user stops typing
  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);

    if (query) {
      params.set("query", query);
      params.set("page", "1"); // always reset to page 1 on new search
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <input
      type="text"
      placeholder="Search tickets..."
      defaultValue={searchParams.get("query") ?? ""}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

```tsx
// components/status-filter.tsx — Client Component
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

const STATUSES = ["all", "open", "in-progress", "done"];

export function StatusFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentStatus = searchParams.get("status") || "all";

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams);

    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1"); // reset pagination

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map((status) => (
        <button
          key={status}
          onClick={() => handleStatusChange(status)}
          className={currentStatus === status ? "font-bold underline" : ""}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// components/sort-select.tsx — Client Component
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export function SortSelect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams);
    const [sort, order] = value.split("-"); // "created_at-desc"
    params.set("sort", sort);
    params.set("order", order);
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={`${searchParams.get("sort") || "created_at"}-${searchParams.get("order") || "desc"}`}
      onChange={(e) => handleSort(e.target.value)}
    >
      <option value="created_at-desc">Newest first</option>
      <option value="created_at-asc">Oldest first</option>
      <option value="title-asc">Title A-Z</option>
      <option value="title-desc">Title Z-A</option>
    </select>
  );
}
```

```tsx
// components/pagination.tsx — Client Component
"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export function Pagination({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || 1;

  function createPageURL(pageNumber: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="flex gap-2 mt-4">
      {currentPage > 1 && (
        <Link href={createPageURL(currentPage - 1)}>← Prev</Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => (
        <Link
          key={i + 1}
          href={createPageURL(i + 1)}
          className={currentPage === i + 1 ? "font-bold" : ""}
        >
          {i + 1}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={createPageURL(currentPage + 1)}>Next →</Link>
      )}
    </div>
  );
}
```

```tsx
// app/org/[slug]/tickets/page.tsx — Server Component ties it all together
import { auth } from "@clerk/nextjs/server";
import { SearchFilter } from "@/components/search-filter";
import { StatusFilter } from "@/components/status-filter";
import { SortSelect } from "@/components/sort-select";
import { Pagination } from "@/components/pagination";
import { TicketCard } from "@/components/ticket-card";
import { Suspense } from "react";

export default async function TicketsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string;
    sort?: string;
    order?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const query = sp?.query || "";
  const page = Number(sp?.page) || 1;
  const status = sp?.status || "all";
  const sort = sp?.sort || "created_at";
  const order = sp?.order || "desc";

  // Build query string for Go API
  const apiParams = new URLSearchParams({
    q: query,
    page: String(page),
    status,
    sort,
    order,
  });

  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(
    `${process.env.API_URL}/orgs/${slug}/tickets?${apiParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: [`tickets-${slug}`] },
      cache: "force-cache",
    },
  );

  const { tickets, totalPages } = await res.json();

  return (
    <div>
      <h1>Tickets</h1>
      <div className="flex gap-4 mb-4">
        <SearchFilter />
        <StatusFilter />
        <SortSelect />
      </div>

      {/* KEY TRICK: changing the key forces React to show the fallback */}
      <Suspense
        key={query + page + status + sort + order}
        fallback={<div>Loading tickets...</div>}
      >
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket.id} ticket={ticket} orgSlug={slug} />
          ))}
        </div>
      </Suspense>

      <Pagination totalPages={totalPages} />
    </div>
  );
}
```

---

## Part 5: useSWR Walkthrough

### What is SWR?

**SWR** = **Stale-While-Revalidate**. A React Hooks library for client-side data fetching by Vercel.

1. Return **cached (stale) data** immediately → fast UI
2. **Revalidate** by fetching fresh data in the background
3. **Update** the UI when fresh data arrives

### useSWR vs TanStack Query

| Feature         | useSWR            | TanStack Query                |
| --------------- | ----------------- | ----------------------------- |
| Bundle size     | ~4.5KB            | ~13KB                         |
| API             | Simple, minimal   | Feature-rich                  |
| Mutations       | Manual `mutate()` | `useMutation` with optimistic |
| Infinite scroll | `useSWRInfinite`  | `useInfiniteQuery`            |
| Devtools        | No                | Yes (excellent)               |
| SSR hydration   | Manual            | Built-in `HydrationBoundary`  |
| Pagination      | Manual            | Built-in `keepPreviousData`   |

### Basic Usage

```bash
npm i swr
```

```tsx
// lib/fetcher.ts
export const fetcher = (url: string) => fetch(url).then((r) => r.json());
```

```tsx
// components/ticket-list.tsx
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

function TicketList() {
  const { data, error, isLoading } = useSWR("/api/tickets", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load</div>;

  return (
    <ul>
      {data.tickets.map((ticket: any) => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}
```

### Key Concepts

#### 1. Deduplication — Same Key = One Request

```tsx
// Both components use key "/api/user/123" → only ONE request made
function Header() {
  const { data } = useSWR("/api/user/123", fetcher);
  return <span>{data?.name}</span>;
}
function Sidebar() {
  const { data } = useSWR("/api/user/123", fetcher);
  return <span>{data?.email}</span>;
}
```

#### 2. Reusable Hooks

```tsx
// hooks/use-tickets.ts
export function useTickets(orgSlug: string, page = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/orgs/${orgSlug}/tickets?page=${page}`,
    fetcher,
  );
  return {
    tickets: data?.tickets ?? [],
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
```

#### 3. Mutation

```tsx
import { mutate } from "swr";

async function handleCreate() {
  await fetch("/api/tickets", { method: "POST", body: /* ... */ });

  // Option A: Refetch from server
  mutate("/api/tickets");

  // Option B: Optimistic update
  mutate(
    "/api/tickets",
    (current: any) => ({
      ...current,
      tickets: [...current.tickets, { id: "temp", title: "New" }],
    }),
    { revalidate: false }
  );
}
```

#### 4. Auto-Revalidation (Built-in)

SWR auto-refetches on: window focus, network reconnect, component remount. Optional polling:

```tsx
const { data } = useSWR("/api/tickets", fetcher, {
  refreshInterval: 5000, // poll every 5s
});
```

#### 5. Conditional Fetching

```tsx
const { data } = useSWR(userId ? `/api/user/${userId}` : null, fetcher);
```

#### 6. Global Config

```tsx
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((r) => r.json()),
        revalidateOnFocus: true,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}

// Now you can omit fetcher in components:
const { data } = useSWR("/api/tickets");
```

---

## Part 6: Official Docs Links

### Next.js Caching & Revalidation

| Topic                           | Link                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| Caching Overview (all 4 layers) | https://nextjs.org/docs/app/building-your-application/caching              |
| `revalidateTag` API             | https://nextjs.org/docs/app/api-reference/functions/revalidateTag          |
| `revalidatePath` API            | https://nextjs.org/docs/app/api-reference/functions/revalidatePath         |
| `fetch` API in Next.js          | https://nextjs.org/docs/app/api-reference/functions/fetch                  |
| `useRouter` (router.refresh)    | https://nextjs.org/docs/app/api-reference/functions/use-router             |
| Server Actions (Updating Data)  | https://nextjs.org/docs/app/getting-started/updating-data                  |
| `staleTimes` config             | https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes |

### URL Search Params

| Topic                           | Link                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Search & Pagination Tutorial ⭐ | https://nextjs.org/learn/dashboard-app/adding-search-and-pagination                   |
| `useSearchParams` hook          | https://nextjs.org/docs/app/api-reference/functions/use-search-params                 |
| `usePathname` hook              | https://nextjs.org/docs/app/api-reference/functions/use-pathname                      |
| `searchParams` page prop        | https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional |

### SWR

| Topic           | Link                                             |
| --------------- | ------------------------------------------------ |
| Getting Started | https://swr.vercel.app/docs/getting-started      |
| Data Fetching   | https://swr.vercel.app/docs/data-fetching        |
| Mutation        | https://swr.vercel.app/docs/mutation             |
| Pagination      | https://swr.vercel.app/docs/pagination           |
| Revalidation    | https://swr.vercel.app/docs/revalidation         |
| Global Config   | https://swr.vercel.app/docs/global-configuration |
