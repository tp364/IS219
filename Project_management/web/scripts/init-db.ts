import { createDatabase, resolveDbPath } from "../src/lib/db";

const db = createDatabase();
db.close();

console.log(`Database initialized at ${resolveDbPath()}.`);
