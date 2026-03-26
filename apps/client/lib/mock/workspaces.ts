import { Workspace } from "@/types/workspace";

export const mockWorkspaces: Workspace[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Frontend Platform",
    scopeId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    scope: "ORG",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Backend Systems",
    scopeId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    scope: "ORG",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-03-05"),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Personal Lab",
    scopeId: "bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    scope: "PERSONAL",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-03-20"),
  },
];
