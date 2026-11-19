import { mkdtemp, cp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const run = (args, cwd = process.cwd()) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const remote = run(['remote', 'get-url', 'origin']);
const sourceCommit = run(['rev-parse', '--short', 'HEAD']);
const output = resolve('dist');
const dir = await mkdtemp(join(tmpdir(), 'travel-now-pages-'));
try {
  run(['init', '-b', 'gh-pages'], dir);
  run(['remote', 'add', 'origin', remote], dir);
  const existing = run(['ls-remote', '--heads', remote, 'refs/heads/gh-pages'], dir);
  if (existing) {
    run(['fetch', '--depth=1', 'origin', 'gh-pages'], dir);
    run(['checkout', '-B', 'gh-pages', 'FETCH_HEAD'], dir);
    run(['rm', '-r', '--ignore-unmatch', '.'], dir);
  }
  await cp(output, dir, { recursive: true });
  run(['add', '--all'], dir);
  const changed = run(['status', '--porcelain'], dir);
  if (changed) {
    run(['-c', 'user.name=Travel Now deploy', '-c', 'user.email=106881779+tchLin@users.noreply.github.com', 'commit', '-m', `Deploy Travel Now from ${sourceCommit}`], dir);
    run(['push', 'origin', 'HEAD:gh-pages'], dir);
    console.log('Published static files to gh-pages. GitHub Pages will finish deploying shortly.');
  } else console.log('The published files already match this build.');
} finally {
  await rm(dir, { recursive: true, force: true });
}
