import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const textFiles = ['app.js','index.html','manifest.webmanifest','sw.js','README.md','VERSION.md','BACKLOG.md','ROADMAP.md','CHANGELOG.md','RELEASE_NOTES.md','docs/FINANCE_PHASE_2_PLAN.md','docs/SECURITY_CHECKLIST.md'];
const read = p => readFileSync(p, 'utf8');
const app = read('app.js');
const index = read('index.html');
const manifest = read('manifest.webmanifest');
const sw = read('sw.js');
const version = read('VERSION.md');

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['.git','node_modules'].includes(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) listFiles(path, out);
    else out.push(path);
  }
  return out;
}

const sourceFiles = listFiles('.').filter(p => !p.endsWith('.zip') && !p.includes('/.git/'));
const sourceText = sourceFiles.filter(p => /\.(js|mjs|html|md|sql|webmanifest|css)$/i.test(p)).map(p => readFileSync(p, 'utf8')).join('\n');

const forbiddenSecretPattern = new RegExp(['sb_' + 'secret_', 'SUPABASE_' + 'SERVICE_' + 'ROLE', 'service' + '_role' + '_key', 'service-role key\\s*='].join('|'), 'i');

const checks = [
  ['V7 title metadata', index.includes('Momentum Hub - V7.0 Finance Stable')],
  ['V7 manifest name', manifest.includes('Momentum Hub V7 Finance')],
  ['V7 release candidate status', version.includes('V7.0 Finance Stable Release Candidate')],
  ['V7 stable cache key', sw.includes("const CACHE='momentum-hub-v7-finance-stable'")],
  ['Supabase excluded from service worker cache', sw.includes("url.hostname.includes('supabase.co')")],
  ['App shell cache allowlist exists', sw.includes('APP_SHELL') && sw.includes('/manifest.webmanifest')],
  ['Backup filename uses V7', app.includes('momentum-hub-v7-yedek.json')],
  ['Security checklist exists', existsSync('docs/SECURITY_CHECKLIST.md')],
  ['Finance module verifier exists', existsSync('scripts/verify-finance-module.mjs')],
  ['Finance accounts verifier exists', existsSync('scripts/verify-finance-accounts.mjs')],
  ['No Supabase secret/service-role key pattern in source text', !forbiddenSecretPattern.test(sourceText)],
  ['No legacy V5 backup filename', !app.includes('momentum-asset-v5-yedek.json')],
  ['Finance shell no desktop max-width cap', read('style.css').includes('.finance-shell{max-width:none')],
  ['Finance mobile polish marker exists', read('style.css').includes('V7 Sprint 2G mobile polish')],
  ['Documents mobile polish marker exists', read('style.css').includes('.docs-c3-shell') && read('style.css').includes('overflow-wrap:anywhere')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('V7 Stable verification failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`V7 Stable verification passed (${checks.length} checks).`);
