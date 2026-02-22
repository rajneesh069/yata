"use client";

import { UserButton } from "@clerk/nextjs";
import { Building } from "lucide-react";

export function CustomUserButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Organization Profile"
          labelIcon={<Building className="size-4" />}
          href="/organization-profile"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
