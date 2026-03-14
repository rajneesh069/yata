import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function Page() {
  const { userId, isAuthenticated } = await auth();

  if (isAuthenticated) {
    redirect(`/user/${userId}/tickets`);
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center">Hey</div>
  );
}
