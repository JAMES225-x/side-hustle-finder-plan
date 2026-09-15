import "dotenv/config";
import { seedCoreData } from "./seed";
import { pool } from "./index";

async function main() {
  console.log("Seeding Supabase database with core hustles, legal guides, and scam registry...");
  await seedCoreData();
  console.log("Database successfully seeded!");
  await pool.end();
}

main().catch((err) => {
  console.error("Database seed failed:", err);
  process.exit(1);
});
