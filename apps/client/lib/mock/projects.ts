import { Project } from "@/types/project";

export const mockProjects: Project[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Core E-Commerce Platform",
    scopeId: "62688f00-3486-44a6-90f7-66a9a3b83984", // Organization ID
    scope: "ORG",
    createdAt: new Date("2025-01-15T09:00:00Z"),
    updatedAt: new Date("2026-03-20T11:30:00Z"),
  },
  {
    id: "33eb43e1-933e-4f51-8e01-098e9198642a",
    name: "Internal Admin Dashboard",
    scopeId: "62688f00-3486-44a6-90f7-66a9a3b83984", // Same Org
    scope: "ORG",
    createdAt: new Date("2025-02-10T14:20:00Z"),
    updatedAt: new Date("2026-03-18T10:00:00Z"),
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Mobile App Port (Personal)",
    scopeId: "2a11b090-c4d1-4221-a4f2-99d0c2f1a882", // User ID
    scope: "PERSONAL",
    createdAt: new Date("2026-01-05T12:00:00Z"),
    updatedAt: new Date("2026-01-05T12:00:00Z"),
  },
  {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    name: "Customer Analytics Suite",
    scopeId: "88320000-0000-4000-a000-000000000000", // Different Org
    scope: "ORG",
    createdAt: new Date("2025-11-20T08:45:00Z"),
    updatedAt: new Date("2026-03-15T09:15:00Z"),
  },
  {
    id: "e6231c2d-948a-4074-94c6-e918451f1532",
    name: "Legacy Migration Sandbox",
    scopeId: "6c45f2c4-7d2a-4a55-88c4-0c61b7c3d102", // User ID
    scope: "PERSONAL",
    createdAt: new Date("2026-02-28T16:00:00Z"),
    updatedAt: new Date("2026-03-25T14:00:00Z"),
  },
];
