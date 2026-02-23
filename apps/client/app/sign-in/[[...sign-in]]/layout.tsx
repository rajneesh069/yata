import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign In page of YATA (Yet Another Ticketing App)",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
