import { Ticket } from "@/types/ticket";

export const mockTickets: Ticket[] = [
  // ===== FRONTEND =====
  {
    id: "f-1",
    workspaceId: "11111111-1111-1111-1111-111111111111",
    taskName: "Auth",
    title: "Fix OAuth redirect bug",
    description: null,
    raisedById: "user-1",
    status: "IN_PROGRESS",
    tags: ["auth"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "f-2",
    workspaceId: "11111111-1111-1111-1111-111111111111",
    taskName: "UI/UX",
    title: "Improve navbar responsiveness",
    description: null,
    raisedById: "user-2",
    status: "OPEN",
    tags: ["ui"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "f-3",
    workspaceId: "11111111-1111-1111-1111-111111111111",
    taskName: "Performance",
    title: "Reduce hydration cost",
    description: null,
    raisedById: "user-3",
    status: "IN_REVIEW",
    tags: ["perf"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "f-4",
    workspaceId: "11111111-1111-1111-1111-111111111111",
    taskName: "Accessibility",
    title: "Add ARIA labels",
    description: null,
    raisedById: "user-1",
    status: "OPEN",
    tags: ["a11y"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "f-5",
    workspaceId: "11111111-1111-1111-1111-111111111111",
    taskName: "Testing",
    title: "Add unit tests for login",
    description: null,
    raisedById: "user-2",
    status: "REVIEW_PENDING",
    tags: ["test"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ===== BACKEND =====
  {
    id: "b-1",
    workspaceId: "22222222-2222-2222-2222-222222222222",
    taskName: "API",
    title: "Fix pagination bug",
    description: null,
    raisedById: "user-1",
    status: "IN_PROGRESS",
    tags: ["api"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "b-2",
    workspaceId: "22222222-2222-2222-2222-222222222222",
    taskName: "Database",
    title: "Optimize joins",
    description: null,
    raisedById: "user-2",
    status: "OPEN",
    tags: ["db"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "b-3",
    workspaceId: "22222222-2222-2222-2222-222222222222",
    taskName: "Security",
    title: "Add rate limiting",
    description: null,
    raisedById: "user-3",
    status: "IN_REVIEW",
    tags: ["security"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ===== PERSONAL =====
  {
    id: "p-1",
    workspaceId: "33333333-3333-3333-3333-333333333333",
    taskName: "Rust",
    title: "Implement async runtime",
    description: null,
    raisedById: "user-1",
    status: "IN_PROGRESS",
    tags: ["rust"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p-2",
    workspaceId: "33333333-3333-3333-3333-333333333333",
    taskName: "C++",
    title: "Build memory arena",
    description: null,
    raisedById: "user-1",
    status: "OPEN",
    tags: ["cpp"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ===== BULK GENERATION =====

  // Frontend heavy load
  ...Array.from({ length: 40 }).map(
    (_, i) =>
      ({
        id: `f-bulk-${i}`,
        workspaceId: "11111111-1111-1111-1111-111111111111",
        taskName: ["Auth", "UI/UX", "Performance", "Accessibility", "Testing"][
          i % 5
        ],
        title: `Frontend ticket ${i}`,
        description: i % 3 === 0 ? null : "Generated ticket",
        raisedById: `user-${i % 4}`,
        status: ["OPEN", "IN_PROGRESS", "IN_REVIEW"][i % 3],
        tags: ["auto"],
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as Ticket,
  ),

  // Backend heavy load
  ...Array.from({ length: 40 }).map(
    (_, i) =>
      ({
        id: `b-bulk-${i}`,
        workspaceId: "22222222-2222-2222-2222-222222222222",
        taskName: ["API", "Database", "Infra", "Security", "Caching"][i % 5],
        title: `Backend ticket ${i}`,
        description: null,
        raisedById: `user-${i % 3}`,
        status: ["OPEN", "REVIEW_PENDING", "CLOSED"][i % 3],
        tags: ["backend"],
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as Ticket,
  ),

  // Personal chaos 😄
  ...Array.from({ length: 25 }).map(
    (_, i) =>
      ({
        id: `p-bulk-${i}`,
        workspaceId: "33333333-3333-3333-3333-333333333333",
        taskName: ["Rust", "C++", "Systems Design", "Networking"][i % 4],
        title: `Personal experiment ${i}`,
        description: "Exploration work",
        raisedById: "user-1",
        status: ["OPEN", "IN_PROGRESS"][i % 2],
        tags: ["learning"],
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as Ticket,
  ),
];
