import { UserTickets } from "@/components/user-tickets";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserTickets userId={id} />;
}
