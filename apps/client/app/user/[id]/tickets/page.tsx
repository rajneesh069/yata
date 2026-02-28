import { HitMe } from "@/components/hit-me";
import { UserTickets } from "@/components/user-tickets";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <UserTickets userId={id} />;
      <HitMe />
    </div>
  );
}
