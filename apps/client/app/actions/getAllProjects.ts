import { mockProjects } from "@/lib/mock/projects";

export async function getAllProjects() {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  return mockProjects;
}
