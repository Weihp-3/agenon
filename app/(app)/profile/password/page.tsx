import { requireUser } from "@/lib/auth";
import { PasswordChangeForm } from "@/components/password-change-form";

export default async function ChangePasswordPage() {
  await requireUser();
  return <PasswordChangeForm />;
}