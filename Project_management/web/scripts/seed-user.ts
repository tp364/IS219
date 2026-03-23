import { hash } from "bcryptjs";

import { getStore } from "../src/lib/store";

async function main() {
  const email = (process.env.SEED_USER_EMAIL ?? "admin@example.com").toLowerCase();
  const name = process.env.SEED_USER_NAME ?? "Admin";
  const password = process.env.SEED_USER_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(password, 10);

  const store = getStore();
  store.upsertUser({
    email,
    name,
    passwordHash,
  });

  console.log(`Seeded user: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
