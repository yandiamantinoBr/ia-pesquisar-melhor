import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only initializes the project's local Miniflare database, never a hosted D1 binding.
const project = resolve(fileURLToPath(new URL('..', import.meta.url)));
const directory = join(project, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
const files = readdirSync(directory).filter(name => /^[a-f0-9]{64}\.sqlite$/.test(name));
if (files.length !== 1) throw new Error(`Expected one local D1 database; found ${files.length}. Start the dev server and request the API first.`);
const database = new DatabaseSync(join(directory, files[0]));
const migration = readFileSync(join(project, 'drizzle/0000_typical_killmonger.sql'), 'utf8')
  .replaceAll('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ')
  .replaceAll('CREATE UNIQUE INDEX ', 'CREATE UNIQUE INDEX IF NOT EXISTS ')
  .replaceAll('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ');
database.exec(migration);
const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('sessions','responses') ORDER BY name").all();
database.close();
console.log(JSON.stringify({ initialized: 'local-only', tables: tables.map(table => table.name) }));
