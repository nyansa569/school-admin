import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  console.log("AUTH LAYOUT SESSION: ", session);

  if (session) {
    if (session?.user.role === "admin") {
      redirect("/dashboard");
    } else if (session?.user.role === "teacher") {
      redirect("/teacher/dashboard");
    } else if (session?.user.role === "Kitchen Staff") {
      redirect("/kitchen-view-alt-2");
    } else if (session?.user.role ===  "Packaging Manager") {
      redirect("/pg/account");
    } else {
      // router.push("/dashboard");
    }
  }
  return <>{children}</>;
}
