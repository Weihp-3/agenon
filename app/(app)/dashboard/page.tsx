import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardRedirect() {
  const user = await requireUser();

  if (user.role === "admin") redirect("/admin/dashboard");
  if (user.role === "kasir") redirect("/kasir/dashboard");
  redirect("/user/dashboard");
}