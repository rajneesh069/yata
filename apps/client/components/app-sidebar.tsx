import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Ticket, Users, Home } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { userId, orgSlug } = await auth();
  const data = {
    navMain: [
      {
        title: "Navigation",
        items: [
          { title: "Home", url: "/", icon: Home },
          {
            title: "Tickets",
            url: orgSlug
              ? `/org/${orgSlug}/tickets`
              : `/user/${userId}/tickets`,
            icon: Ticket,
          },
          { title: "Team Chat", url: "/team", icon: Users },
          // { title: "Settings", url: "/settings", icon: Settings },
        ],
      },
    ],
  } as const;
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2">
          <h1 className="text-3xl font-bold tracking-tight">YATA</h1>
          <p className="text-xs leading-tight text-muted-foreground">
            Yet Another Ticketing App
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-2">
                {item.items.map((subItem) => (
                  <SidebarMenuItem
                    key={subItem.title}
                    className={`${subItem.title === "Home" ? "md:hidden" : undefined}`}
                  >
                    <SidebarMenuButton asChild>
                      <a href={subItem.url}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
