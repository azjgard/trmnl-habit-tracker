import fs from "fs/promises";
import path from "path";
import { Client } from "pg";

import dotenv from "dotenv";
dotenv.config();

type Migrations = { rows: { key: string }[] };

const Migrations = {
  init: async (client: Client) =>
    await client.query(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      timestamp timestamp default current_timestamp
    )`),
  load: async (client: Client) =>
    (await client.query(`SELECT * FROM __migrations`)) as Migrations,
  record: async (client: Client, key: string) =>
    await client.query("INSERT INTO __migrations (key) VALUES ($1)", [key]),
};

async function main() {
  const client = new Client(process.env.POSTGRES_URL);

  try {
    await client.connect();
    await client.query("BEGIN");
    await Migrations.init(client);

    const migrations = await Migrations.load(client);
    const migrationSet = new Set(migrations.rows.map((row) => row.key));

    const fileNames = await fs.readdir(path.resolve(__dirname));
    const fileNamesSQL = fileNames
      .filter((file) => file.endsWith(".sql") && file !== "__init.sql")
      .sort();

    let appliedMigrationCount = 0;

    for (const fileName of fileNamesSQL) {
      if (migrationSet.has(fileName)) continue;

      const filePath = path.resolve(__dirname, fileName);
      const fileContents = await fs.readFile(filePath, "utf-8");

      await client.query(fileContents);
      await Migrations.record(client, fileName);

      appliedMigrationCount++;
    }

    await client.query("COMMIT");

    console.info(
      appliedMigrationCount > 0
        ? `Applied ${appliedMigrationCount} migrations`
        : "No new migrations to apply"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error applying migrations:", error);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
