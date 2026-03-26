import { mockWorkspaces } from "@/lib/mock/workspaces";

export async function getAllWorkspaces() {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  return mockWorkspaces;
}
