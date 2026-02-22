import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationProfilePage() {
  return (
    <div className="flex items-center h-full justify-center">
      <OrganizationProfile />
    </div>
  );
}
