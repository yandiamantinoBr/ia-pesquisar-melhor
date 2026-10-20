import {spawnSync} from 'node:child_process';
import {readExecutionProfile} from './execution-profile.mjs';
const managed = readExecutionProfile() === 'managed-linux';
const result = managed
  ? spawnSync('bash', ['scripts/install-pnpm.sh'], {stdio:'inherit'})
  : spawnSync(process.execPath, [process.env.npm_execpath, 'install', '--frozen-lockfile'], {stdio:'inherit'});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
