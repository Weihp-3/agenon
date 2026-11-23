import bcrypt from "bcryptjs";
import { db } from "../lib/db";

/**
 * Baseline data: akun-akun user saja. Tidak ada produk contoh,
 * tidak ada transaksi contoh. Produk diisi lewat halaman admin.
 */
async function main() {
  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword) {
    throw new Error("SEED_PASSWORD wajib diisi sebelum menjalankan seed.");
  }
  const password = await bcrypt.hash(seedPassword, 12);

  const users = [
    { name: "Admin Warung", email: "admin@warung.test", role: "admin" },
    { name: "Kasir Warung", email: "kasir@warung.test", role: "kasir" },
    { name: "User Warung", email: "user@warung.test", role: "user" },
  ];

  for (const u of users) {
    const existing = await db.orm.public.users.where({ email: u.email }).first();
    if (existing) {
      await db.orm.public.users.where({ id: existing.id }).update({
        name: u.name,
        role: u.role,
        password,
      });
    } else {
      await db.orm.public.users.create({ ...u, password });
    }
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
    await db.close();
  });
