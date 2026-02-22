import { auth } from "@clerk/nextjs/server";
export default async function Page() {
  const { userId, orgId, orgRole, orgSlug, getToken } = await auth();
  console.log("User ID: ", userId);
  console.log("Org ID: ", orgId);
  console.log("Org Role: ", orgRole);
  console.log("Org Slug: ", orgSlug);
  console.log("Get Token: ", await getToken());
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div>User ID: {userId}</div>
      <div>Org ID: {orgId}</div>
      <div>Org Role: {orgRole}</div>
      <div>Org Slug: {orgSlug}</div>
    </div>
  );
}
