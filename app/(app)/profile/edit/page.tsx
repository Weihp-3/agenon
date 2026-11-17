import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ProfileEditForm } from "@/components/profile-edit-form";

export default async function EditProfilePage() {
  const sessionUser = await requireUser();

  const user = await db.users.findUnique({
    where: { id: BigInt(sessionUser.id) },
    select: { name: true, email: true },
  });

  if (!user) notFound();

  return <ProfileEditForm initialName={user.name} initialEmail={user.email} />;
}