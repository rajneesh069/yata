import { getAllDataForAWorkspace } from "@/app/actions/getAllDataForAWorkspace";
import { getAllWorkspaces } from "@/app/actions/getAllWorkspaces";
import { TicketBoard } from "@/components/ticket-board";
import { redirect } from "next/navigation";

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ w: string }>;
}) {
  const { w } = await searchParams;
  if (!w) {
    const allWorkspaces = await getAllWorkspaces();
    if (allWorkspaces[0]) {
      redirect(`?w=${allWorkspaces[0]?.id}`);
    }
  }

  const data = await getAllDataForAWorkspace(w);

  return (
    <div>
      <TicketBoard data={data} />
    </div>
  );
}
