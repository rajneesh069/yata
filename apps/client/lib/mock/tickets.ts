import { Ticket } from "@/types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: "3d6f0a32-8c22-4c0a-9d21-9f6c7f6d1a11",
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Login page throws 500 error",
    description:
      "Users report a 500 error when attempting to login with Google OAuth.",
    raisedById: "9e7e1c90-b5b0-4b77-b9e2-37d1c4f0a001",
    status: "OPEN",
    tags: ["auth", "backend", "critical"],
    createdAt: new Date("2026-03-10T10:15:00Z"),
    updatedAt: new Date("2026-03-10T10:15:00Z"),
  },
  {
    id: "7f2a1b9c-4d33-4e8b-8a22-1c5d9e0f3b44",
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Intermittent Database Deadlock on Batch Order Processing",
    description:
      "DETAILED INCIDENT REPORT AND REPRODUCTION STEPS:\n\nSummary:\nDuring high-load periods (specifically between 09:00 and 11:00 UTC), the asynchronous worker service responsible for processing batch orders frequently encounters database deadlocks. This results in failed transactions and inconsistent inventory states.\n\nTechnical Deep Dive:\nInvestigation of the PostgreSQL logs reveals that the deadlock occurs when the `OrderProcessor` service attempts to update the 'inventory_counts' table while simultaneously the `RefundService` is holding a row-level lock on the same 'product_id' entries. The trace indicates a circular dependency in the locking order: \n1. Transaction A (BatchOrder) locks Row X then tries to lock Row Y.\n2. Transaction B (RefundRequest) locks Row Y then tries to lock Row X.\n\nSteps to Reproduce:\n1. Initialize a load testing environment with 50+ concurrent virtual users.\n2. Trigger a CSV import of 10,000 order line items via the Admin Dashboard.\n3. While the import is at 45% completion, initiate multiple refund requests for products included in the middle of the CSV file.\n4. Observe the 'Internal Server Error' in the worker logs and the 'Deadlock detected' message in the DB engine.\n\nEnvironment Details:\n- Environment: Production-Mirror (Staging)\n- Database: PostgreSQL 14.5\n- ORM: Prisma v5.2\n- Infrastructure: AWS RDS (m5.xlarge)\n\nProposed Mitigation:\nWe need to standardize the sequence in which resources are accessed across all services. Specifically, we should implement a sorting algorithm on 'product_id' before initiating transaction locks to ensure that different processes always request locks in the same chronological order, thereby preventing the circular wait condition.\n\nLogged Error:\n'ERROR: deadlock detected. Detail: Process 14002 waits for ShareLock on transaction 88291; blocked by process 14005. Process 14005 waits for ShareLock on transaction 88290; blocked by process 14002.'",
    raisedById: "2a11b090-c4d1-4221-a4f2-99d0c2f1a882",
    status: "OPEN",
    tags: ["database", "high-load", "backend", "critical"],
    createdAt: new Date("2026-03-15T14:20:00Z"),
    updatedAt: new Date("2026-03-15T14:20:00Z"),
  },
  {
    id: "e4a94d0f-5b9a-4c7b-92a4-7d9c5cbb8d22",
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    title: "UI misalignment on dashboard widgets",
    description:
      "Widgets overlap when screen width is between 1024px and 1200px.",
    raisedById: "6c45f2c4-7d2a-4a55-88c4-0c61b7c3d102",
    status: "IN_PROGRESS",
    tags: ["frontend", "ui", "responsive"],
    createdAt: new Date("2026-03-09T14:32:00Z"),
    updatedAt: new Date("2026-03-11T08:05:00Z"),
  },
  {
    id: "1c83e9b4-3b7a-4ef1-9c1c-3a8e5c91f433",
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Email notifications not being sent",
    description: null,
    raisedById: "b2f6c3d0-1d93-4c2e-a3e1-52d7e4c0c203",
    status: "OPEN",
    tags: ["notifications", "email", "bug"],
    createdAt: new Date("2026-03-08T09:20:00Z"),
    updatedAt: new Date("2026-03-08T09:20:00Z"),
  },
  {
    id: "7a2f5d64-9e19-4c61-b3f5-9b6f8e8b7444",
    projectId: "33eb43e1-933e-4f51-8e01-098e9198642a",
    title: "Slow API response on ticket listing",
    description:
      "The /tickets endpoint takes ~2.5 seconds to respond when the database contains more than 500 records. Initial investigation suggests the issue might be related to inefficient joins in the query layer, missing indexes on frequently filtered columns, or excessive serialization overhead in the API layer.",
    raisedById: "d8c1b7f9-6c5e-4f5e-9a8a-5a2c4b0a3104",
    status: "IN_REVIEW",
    tags: ["performance", "backend", "database"],
    createdAt: new Date("2026-03-07T12:00:00Z"),
    updatedAt: new Date("2026-03-12T15:30:00Z"),
  },
  {
    id: "a5c9d71e-44fa-4f9b-8b7b-21c3e9f5e555",
    projectId: "33eb43e1-933e-4f51-8e01-098e9198642a",
    title: "Dark mode toggle not persisting",
    description:
      "When users toggle dark mode from the settings panel, the UI updates correctly for the current session but resets back to light mode after a full page refresh.",
    raisedById: "0f2c1e87-3b55-4a7d-9c2b-8a9f7e6c4205",
    status: "CLOSED",
    tags: ["frontend", "theme", "localStorage"],
    createdAt: new Date("2026-03-05T16:10:00Z"),
    updatedAt: new Date("2026-03-06T09:45:00Z"),
  },
  {
    id: "b9f1f1f4-4e1d-4e58-9e3b-bd98a1c2a901",
    projectId: "33eb43e1-933e-4f51-8e01-098e9198642a",
    title: "Investigate memory leak in background worker",
    description:
      "Over the past few deployments we've observed a steady increase in memory usage in the background worker responsible for processing notification events.",
    raisedById: "14e6c2f1-bf7a-4e4e-b6b1-2b5a7fefc302",
    status: "REVIEW_PENDING",
    tags: ["backend", "memory", "infra"],
    createdAt: new Date("2026-03-04T11:40:00Z"),
    updatedAt: new Date("2026-03-04T11:40:00Z"),
  },
  {
    id: "c3d4a9bb-7c35-45b4-9b92-5db3b0e23903",
    projectId: "33eb43e1-933e-4f51-8e01-098e9198642a",
    title: "Improve onboarding flow for new users",
    description:
      "Several users have reported confusion during the onboarding process, particularly when connecting external integrations and creating their first project.",
    raisedById: "2b91c7e0-ef91-46e3-8f9a-6e2d3e42c404",
    status: "MERGE_APPROVED",
    tags: ["product", "ux", "frontend"],
    createdAt: new Date("2026-03-03T09:10:00Z"),
    updatedAt: new Date("2026-03-03T09:10:00Z"),
  },
];
