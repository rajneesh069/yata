import { HitMe } from "@/components/hit-me";

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      Slug: {slug}
      <HitMe />
    </div>
  );
}
