import { readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const index = readFileSync('index.html', 'utf8');
const sw = readFileSync('sw.js', 'utf8');

const checks = [
  ['index has Finance navigation button', index.includes('data-page="finance"') && index.includes('Finans')],
  ['state includes financeAccounts', app.includes('financeAccounts:[]')],
  ['state includes financeTransactions', app.includes('financeTransactions:[]')],
  ['load() selects finance_accounts', app.includes("sb.from('finance_accounts').select('*').eq('user_id',user.id)")],
  ['load() selects finance_transactions', app.includes("sb.from('finance_transactions').select('*').eq('user_id',user.id)")],
  ['page map includes finance route', app.includes("finance:'Finans'") && app.includes('{dashboard,homes,cars,finance')],
  ['finance page function exists', app.includes('function finance(){')],
  ['finance account form exists', app.includes('function financeAccountForm(')],
  ['finance transaction form exists', app.includes('function financeTransactionForm(')],
  ['finance transaction save exists', app.includes('async function saveFinanceTransaction(')],
  ['finance transaction delete exists', app.includes('async function deleteFinanceTransaction(')],
  ['finance transaction summary exists', app.includes('function financeTransactionSummary(')],
  ['finance transaction list exists', app.includes('function financeTransactionsList(')],
  ['finance transaction filters exist', app.includes('financeTransactionFilters')],
  ['finance transaction writes are user scoped', app.includes("sb.from('finance_transactions').update(row).eq('id',id).eq('user_id',user.id)") && app.includes("sb.from('finance_transactions').delete().eq('id',id).eq('user_id',user.id)")],
  ['service worker cache bumped to 2A.2', sw.includes('momentum-hub-v7-sprint-2a2-finance-transactions')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Finance Module verification failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Finance Module verification passed (${checks.length} checks).`);
