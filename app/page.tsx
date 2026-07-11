import { getSession } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (session?.user.role == "admin") {
    redirect("/dashboard");
  } else if (session?.user.role === "teacher") {
    redirect("/teacher/dashboard");
  } else if (!session) {
   redirect("/launch");
  }
}
