import { getAllWorkspaces } from "@/app/actions/getAllWorkspaces";
import { getAllDataForAWorkspace } from "@/app/actions/getAllDataForAWorkspace";
import { TicketBoard } from "@/components/ticket-board";
import { redirect } from "next/navigation";

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w: string }>;
}) {
  const { id } = await params;
  const { w } = await searchParams;

  if (!w) {
    const allProjects = await getAllWorkspaces();
    if (allProjects[0]) {
      redirect(`?w=${allProjects[0]?.id}`);
    }
  }

  const data = await getAllDataForAWorkspace(w);

  return (
    <div>
      <TicketBoard data={data} id={id} />
    </div>
  );
}
