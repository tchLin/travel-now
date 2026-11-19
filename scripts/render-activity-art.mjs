import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { activityArt } from '../app/activity-art.js';

// Optional asset-authoring step. Requires librsvg's rsvg-convert, not a runtime
// dependency. The checked-in PNGs make portable exports work without SVG parsing.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const renderer = process.env.RSVG_CONVERT || 'rsvg-convert';
for (const item of activityArt) {
  execFileSync(renderer, ['-o', resolve(root, 'app', item.rasterSrc), resolve(root, 'app', item.src)], { stdio: 'pipe' });
}
console.log(`Rendered ${activityArt.length} trusted PNG companions.`);
