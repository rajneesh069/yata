import { Task } from "@/types/task";

export const mockTasks: Task[] = [
  {
    id: "task-0001-0000-0000-000000000001",
    workspaceId: "a1b2c3d4-0001-0000-0000-000000000001",
    name: "set-up-ci-pipeline",
    createdAt: new Date("2025-01-12T10:00:00Z"),
    updatedAt: new Date("2025-01-12T10:00:00Z"),
  },
  {
    id: "task-0002-0000-0000-000000000002",
    workspaceId: "a1b2c3d4-0001-0000-0000-000000000001",
    name: "migrate-postgres-to-v16",
    createdAt: new Date("2025-02-01T09:00:00Z"),
    updatedAt: new Date("2025-02-15T14:00:00Z"),
  },
  {
    id: "task-0003-0000-0000-000000000003",
    workspaceId: "a1b2c3d4-0003-0000-0000-000000000003",
    name: "auth-service-refactor",
    createdAt: new Date("2025-01-20T08:30:00Z"),
    updatedAt: new Date("2025-03-01T16:00:00Z"),
  },
  {
    id: "task-0004-0000-0000-000000000004",
    workspaceId: "a1b2c3d4-0003-0000-0000-000000000003",
    name: "design-system-tokens",
    createdAt: new Date("2025-02-10T11:00:00Z"),
    updatedAt: new Date("2025-04-01T10:30:00Z"),
  },
  {
    id: "task-0005-0000-0000-000000000005",
    workspaceId: "a1b2c3d4-0004-0000-0000-000000000004",
    name: "onboarding-flow-redesign",
    createdAt: new Date("2025-03-01T09:00:00Z"),
    updatedAt: new Date("2025-04-10T15:00:00Z"),
  },
  {
    id: "task-0006-0000-0000-000000000006",
    workspaceId: "a1b2c3d4-0005-0000-0000-000000000005",
    name: "rate-limiting-middleware",
    createdAt: new Date("2025-01-05T07:00:00Z"),
    updatedAt: new Date("2025-02-20T13:00:00Z"),
  },
  {
    id: "task-0007-0000-0000-000000000007",
    workspaceId: "a1b2c3d4-0006-0000-0000-000000000006",
    name: "kubernetes-cluster-upgrade",
    createdAt: new Date("2025-02-28T08:00:00Z"),
    updatedAt: new Date("2025-04-11T09:00:00Z"),
  },
  {
    id: "task-0008-0000-0000-000000000008",
    workspaceId: "a1b2c3d4-0007-0000-0000-000000000007",
    name: "open-pr-graph-algo-fix",
    createdAt: new Date("2025-03-10T06:30:00Z"),
    updatedAt: new Date("2025-03-15T11:00:00Z"),
  },
  {
    id: "task-0009-0000-0000-000000000009",
    workspaceId: "a1b2c3d4-0008-0000-0000-000000000008",
    name: "user-analytics-dashboard",
    createdAt: new Date("2024-11-01T10:00:00Z"),
    updatedAt: new Date("2025-01-20T14:00:00Z"),
  },
  {
    id: "task-0010-0000-0000-000000000010",
    workspaceId: "a1b2c3d4-0003-0000-0000-000000000003",
    name: "billing-webhook-handler",
    createdAt: new Date("2025-04-01T08:00:00Z"),
    updatedAt: new Date("2025-04-12T12:00:00Z"),
  },
];
