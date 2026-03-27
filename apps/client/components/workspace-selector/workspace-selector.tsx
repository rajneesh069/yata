import { getAllWorkspaces } from "@/app/actions/getAllWorkspaces";
import { WorkspaceSelectorClient } from "./workspace-selector-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function WorkspaceSelector() {
  const allWorkspaces = await getAllWorkspaces();
  const { userId, orgId } = await auth();

  if (!userId && !orgId) {
    redirect("/sign-in");
  }

  return (
    <WorkspaceSelectorClient workspaces={allWorkspaces} id={orgId ?? userId} />
  );
}
