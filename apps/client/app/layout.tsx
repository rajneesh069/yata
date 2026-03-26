import { Inter } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { CustomUserButton } from "@/components/custom-user-button";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { ModeToggle } from "@workspace/ui/components/mode-toggle";
import { Button } from "@workspace/ui/components/button";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Home",
  description: "Home page of YATA(Yet Another Ticketing App)",
};

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { SmartHeading } from "@/components/smart-heading";
import { Toaster } from "@workspace/ui/components/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased h-[100vh]`}>
        <Providers>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
              <header className="flex justify-between items-center p-4 gap-4 h-[8vh] border-b">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <SmartHeading />
                </div>
                <div className="flex gap-3">
                  <SignedOut>
                    <ModeToggle />
                    <SignInButton>Login</SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <Link href="/" className="md:block hidden">
                      <Button
                        className="flex items-center gap-2 text-sm font-medium"
                        variant={"outline"}
                      >
                        <HomeIcon className="size-4" />
                      </Button>
                    </Link>
                    <ModeToggle />
                    <div className="hidden md:block">
                      <OrganizationSwitcher
                        afterSelectOrganizationUrl={"/org/:slug/tickets"}
                        afterSelectPersonalUrl={"/user/:id/tickets"}
                      />
                    </div>
                    <CustomUserButton />
                  </SignedIn>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
