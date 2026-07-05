import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const index = readFileSync('index.html', 'utf8');

const checks = [
  ['index has Finance navigation button', index.includes('data-page="finance"') && index.includes('Finans')],
  ['state includes financeAccounts', app.includes('financeAccounts:[]')],
  ['load() selects finance_accounts', app.includes("sb.from('finance_accounts').select('*')")],
  ['page map includes finance route', app.includes("finance:'Finans'") && app.includes('{dashboard,homes,cars,finance')],
  ['finance page function exists', app.includes('function finance(){')],
  ['finance account form exists', app.includes('function financeAccountForm(')],
  ['finance account save exists', app.includes('async function saveFinanceAccount(')],
  ['finance account archive/passive exists', app.includes('async function archiveFinanceAccount(')],
  ['finance KPI helper exists', app.includes('function financeAccountSummary()')],
  ['finance currency formatter exists', app.includes('function financeFmt(')],
  ['finance account updates are user scoped', app.includes(".eq('id',id).eq('user_id',user.id)")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Finance Accounts verification failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Finance Accounts verification passed (${checks.length} checks).`);
