import { existsSync, readFileSync } from 'node:fs';

const app = readFileSync('app.js', 'utf8');
const index = readFileSync('index.html', 'utf8');
const sw = readFileSync('sw.js', 'utf8');

const checks = [
  ['index has Finance navigation button', index.includes('data-page="finance"') && index.includes('Finans')],
  ['state includes financeAccounts', app.includes('financeAccounts:[]')],
  ['state includes financeTransactions', app.includes('financeTransactions:[]')],
  ['state includes financeTransfers', app.includes('financeTransfers:[]')],
  ['load() selects finance_accounts', app.includes("sb.from('finance_accounts').select('*').eq('user_id',user.id)")],
  ['load() selects finance_transactions', app.includes("sb.from('finance_transactions').select('*').eq('user_id',user.id)")],
  ['load() selects finance_transfers', app.includes("sb.from('finance_transfers').select('*').eq('user_id',user.id)")],
  ['page map includes finance route', app.includes("finance:'Finans'") && app.includes('{dashboard,homes,cars,finance')],
  ['finance page function exists', app.includes('function finance(){')],
  ['finance account form exists', app.includes('function financeAccountForm(')],
  ['finance transaction form exists', app.includes('function financeTransactionForm(')],
  ['finance transaction save exists', app.includes('async function saveFinanceTransaction(')],
  ['finance transaction delete exists', app.includes('async function deleteFinanceTransaction(')],
  ['finance transaction summary exists', app.includes('function financeTransactionSummary(')],
  ['finance transaction list exists', app.includes('function financeTransactionsList(')],
  ['finance transfer form exists', app.includes('function financeTransferForm(')],
  ['finance transfer save exists', app.includes('async function saveFinanceTransfer(')],
  ['finance transfer delete exists', app.includes('async function deleteFinanceTransfer(')],
  ['finance transfer list exists', app.includes('function financeTransfersList(')],
  ['finance balance engine exists', app.includes('function financeAccountBalance(') && app.includes('function financeTransactionEffect(') && app.includes('function financeTransferEffect(')],
  ['finance transaction writes are user scoped', app.includes("sb.from('finance_transactions').update(row).eq('id',id).eq('user_id',user.id)") && app.includes("sb.from('finance_transactions').delete().eq('id',id).eq('user_id',user.id)")],
  ['finance transfer writes are user scoped', app.includes("sb.from('finance_transfers').update(row).eq('id',id).eq('user_id',user.id)") && app.includes("sb.from('finance_transfers').delete().eq('id',id).eq('user_id',user.id)")],
  ['transfer guard SQL exists', existsSync('sql/finance_transfer_account_guard.sql')],

  ['syncFinanceAccountBalance helper exists', app.includes('function syncFinanceAccountBalance(')],
  ['manual balance sync button exists', app.includes('Manuel bakiyeyi eşitle')],
  ['finance reconciliation note exists', app.includes('Bakiyeler, başlangıç bakiyesi')],
  ['transfer form defaults target to second account', app.includes('defaultToAccountId')],

  ['dashboardFinanceSummary helper exists', app.includes('function dashboardFinanceSummary(')],
  ['dashboard finance title exists', app.includes('Finans Özeti')],
  ['dashboard finance uses account summary', app.includes('const s=financeAccountSummary()') || app.includes('const s = financeAccountSummary()')],
  ['dashboard finance uses transaction summary', app.includes('tx=financeTransactionSummary()') || app.includes('const tx = financeTransactionSummary()')],
  ['dashboard finance navigation exists', app.includes("page('finance')")],

  ['finance budgets state exists', app.includes('financeBudgets:[]')],
  ['load() selects finance_budgets', app.includes("sb.from('finance_budgets').select('*').eq('user_id',user.id)")],
  ['financeBudgetForm exists', app.includes('function financeBudgetForm(')],
  ['saveFinanceBudget exists', app.includes('async function saveFinanceBudget(')],
  ['deleteFinanceBudget exists', app.includes('async function deleteFinanceBudget(')],
  ['financeBudgetActual exists', app.includes('function financeBudgetActual(')],
  ['financeBudgetProgress exists', app.includes('function financeBudgetProgress(')],
  ['finance budgets SQL exists', existsSync('sql/finance_budgets.sql')],

  ['finance financing plans state exists', app.includes('financeFinancingPlans:[]')],
  ['load() selects finance_financing_plans', app.includes("sb.from('finance_financing_plans').select('*').eq('user_id',user.id)")],
  ['financeFinancingSummary exists', app.includes('function financeFinancingSummary(')],
  ['financeFinancingPlansList exists', app.includes('function financeFinancingPlansList(')],
  ['financeFinancingPlanForm exists', app.includes('function financeFinancingPlanForm(')],
  ['saveFinanceFinancingPlan exists', app.includes('async function saveFinanceFinancingPlan(')],
  ['deleteFinanceFinancingPlan exists', app.includes('async function deleteFinanceFinancingPlan(')],
  ['finance financing SQL exists', existsSync('sql/finance_financing_plans.sql')],
  ['finance financing UI title exists', app.includes('Finansmanlar / Krediler')],
  ['finance financing writes are user scoped', app.includes("sb.from('finance_financing_plans').update(row).eq('id',id).eq('user_id',user.id)") && app.includes("sb.from('finance_financing_plans').delete().eq('id',id).eq('user_id',user.id)")],

  ['finance financing installments state exists', app.includes('financeFinancingInstallments:[]')],
  ['load() selects finance_financing_installments', app.includes("sb.from('finance_financing_installments').select('*').eq('user_id',user.id)")],
  ['financeFinancingInstallmentsForPlan exists', app.includes('function financeFinancingInstallmentsForPlan(')],
  ['financeInstallmentSummary exists', app.includes('function financeInstallmentSummary(')],
  ['financeFinancingInstallmentsList exists', app.includes('function financeFinancingInstallmentsList(')],
  ['financeFinancingInstallmentForm exists', app.includes('function financeFinancingInstallmentForm(')],
  ['saveFinanceFinancingInstallment exists', app.includes('async function saveFinanceFinancingInstallment(')],
  ['deleteFinanceFinancingInstallment exists', app.includes('async function deleteFinanceFinancingInstallment(')],
  ['finance financing installments SQL exists', existsSync('sql/finance_financing_installments.sql')],
  ['finance installments UI title exists', app.includes('Taksit Planı')],
  ['finance installment writes are user scoped', app.includes("sb.from('finance_financing_installments').update(row).eq('id',id).eq('user_id',user.id)") && app.includes("sb.from('finance_financing_installments').delete().eq('id',id).eq('user_id',user.id)")],
  ['service worker cache bumped to 2C.1', sw.includes('momentum-hub-v7-sprint-2c1-financing-installments')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Finance Module verification failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Finance Module verification passed (${checks.length} checks).`);
