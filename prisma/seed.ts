import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/**
 * Baseline data: akun-akun user saja. Tidak ada produk contoh,
 * tidak ada transaksi contoh. Produk diisi lewat halaman admin.
 */
async function main() {
  const password = await bcrypt.hash("rahasia123", 12);

  const users = [
    { name: "Admin Warung", email: "admin@warung.test", role: "admin" },
    { name: "Kasir Warung", email: "kasir@warung.test", role: "kasir" },
    { name: "User Warung", email: "user@warung.test", role: "user" },
  ];

  for (const u of users) {
    await db.users.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password },
      create: { ...u, password },
    });
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  console.log("Selesai. Produk sengaja tidak dibuat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
