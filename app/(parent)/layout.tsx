// app/(parent)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ParentLayoutClient from "./ParentLayoutClient";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getSession();

  // if (!session) {
  //   redirect("/auth/login");
  // }

  // if (session.user.role === "admin") {
  //   redirect("/dashboard");
  // }

  // if (session.user.role !== "parent") {
  //   redirect("/auth/login");
  // }

  return <ParentLayoutClient>{children}</ParentLayoutClient>;
}