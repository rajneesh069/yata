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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased h-[100vh]`}>
        <Providers>
          <header className="flex justify-between items-center p-4 gap-4 h-[8vh] border border-b">
            <div>
              <Link href="/">
                <div className="leading-tight">
                  <h1 className="text-3xl font-bold tracking-tight">YATA</h1>
                  <p className="text-xs text-muted-foreground">
                    Yet Another Ticketing App
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex gap-3">
              <SignedOut>
                <ModeToggle />
                <SignInButton>Login</SignInButton>
              </SignedOut>

              <SignedIn>
                <Link href="/">
                  <Button
                    className="flex items-center gap-2 text-sm font-medium"
                    variant={"outline"}
                  >
                    <HomeIcon className="size-4" />
                  </Button>
                </Link>
                <ModeToggle />
                <OrganizationSwitcher
                  afterSelectOrganizationUrl={":slug"}
                  afterSelectPersonalUrl={":id"}
                />
                <CustomUserButton />
              </SignedIn>
            </div>
          </header>
          <div className="mt-2 h-[92vh]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
