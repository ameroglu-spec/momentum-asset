const SUPABASE_URL='https://ihcpuytxrgmercbvblfy.supabase.co';
const SUPABASE_KEY='sb_publishable_ILKwhlgiUJbBKtf4lMVZzA_u6RjjP79';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let user=null,currentPage='dashboard';
let calendarMonth=new Date().toISOString().slice(0,7);
let theme=localStorage.getItem('ma_theme')||'dark';
let state={homes:[],cars:[],entries:[],definitions:[],documents:[],financeAccounts:[],financeTransactions:[],financeTransfers:[],financeBudgets:[],financeFinancingPlans:[],financeFinancingInstallments:[],financeError:null,financeTransactionsError:null,financeTransfersError:null,financeBudgetsError:null,financeFinancingPlansError:null,financeFinancingInstallmentsError:null};
const $=id=>document.getElementById(id);
const fmt=n=>(Number(n)||0).toLocaleString('tr-TR')+' TL';
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const DEFAULTS={home_expense:['DASK','Konut Sigortası','Emlak Vergisi','Gelir Vergisi','Aidat','Bakım','Onarım','Diğer'],car_expense:['MTV','Trafik Sigortası','Kasko','Muayene / Vize','Periyodik Bakım','Lastik','Yakıt','Ceza','Diğer'],income:['Kira','Depozito','Satış Geliri','Diğer Gelir'],status:['Bekleniyor','Ödendi','Alındı','Kısmi Ödendi','Gecikti','İptal'],doc_type:['Tapu','DASK','Kira Sözleşmesi','Ruhsat','Sigorta','Kasko','Fatura','Diğer']};
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3500)}
function openModal(html){$('modalbody').innerHTML=html;$('modal').classList.remove('hidden')}function closeModal(){$('modal').classList.add('hidden')}
$('close').onclick=closeModal;
async function init(){const {data}=await sb.auth.getSession();user=data.session?.user||null;renderAuth();if(user) await load();}
function renderAuth(){$('auth').classList.toggle('hidden',!!user);$('app').classList.toggle('hidden',!user);$('side').style.display=user?'block':'none';if(user) page(currentPage||'dashboard')}
async function load(){const [h,c,e,d,doc,fa,ft,fr,fb,ff,fi]=await Promise.all([sb.from('homes').select('*').order('created_at'),sb.from('cars').select('*').order('created_at'),sb.from('entries').select('*').order('date',{ascending:false}),sb.from('definitions').select('*').order('sort_order').order('name'),sb.from('documents').select('*').order('created_at',{ascending:false}),sb.from('finance_accounts').select('*').eq('user_id',user.id).order('created_at'),sb.from('finance_transactions').select('*').eq('user_id',user.id).order('transaction_date',{ascending:false}),sb.from('finance_transfers').select('*').eq('user_id',user.id).order('transfer_date',{ascending:false}),sb.from('finance_budgets').select('*').eq('user_id',user.id).order('month',{ascending:false}),sb.from('finance_financing_plans').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),sb.from('finance_financing_installments').select('*').eq('user_id',user.id).order('due_date',{ascending:true})]);if(h.error||c.error||e.error||d.error){toast('Supabase SQL eksik olabilir. V5 SQL kodunu çalıştır.');return}state.homes=h.data||[];state.cars=c.data||[];state.entries=e.data||[];state.definitions=d.data||[];state.documents=doc.data||[];state.financeError=fa.error?fa.error.message:null;state.financeAccounts=fa.error?[]:(fa.data||[]);state.financeTransactionsError=ft.error?ft.error.message:null;state.financeTransactions=ft.error?[]:(ft.data||[]);state.financeTransfersError=fr.error?fr.error.message:null;state.financeTransfers=fr.error?[]:(fr.data||[]);state.financeBudgetsError=fb.error?fb.error.message:null;state.financeBudgets=fb.error?[]:(fb.data||[]);state.financeFinancingPlansError=ff.error?ff.error.message:null;state.financeFinancingPlans=ff.error?[]:(ff.data||[]);state.financeFinancingInstallmentsError=fi.error?fi.error.message:null;state.financeFinancingInstallments=fi.error?[]:(fi.data||[]);await ensureDefaults();page(currentPage||'dashboard')}
async function ensureDefaults(){const need=[];Object.entries(DEFAULTS).forEach(([type,names])=>{if(!state.definitions.some(d=>d.type===type))names.forEach((name,i)=>need.push({user_id:user.id,type,name,sort_order:i,active:true}))});if(need.length){await sb.from('definitions').insert(need);const {data}=await sb.from('definitions').select('*').order('sort_order').order('name');state.definitions=data||[]}}
function defs(type,activeOnly=true){return state.definitions.filter(d=>d.type===type&&(!activeOnly||d.active))}
function optionHtml(type,selected=''){let arr=defs(type);if(!arr.length)arr=(DEFAULTS[type]||[]).map(name=>({name}));const val=selected||arr[0]?.name||'Diğer';return arr.map(o=>`<option value="${esc(o.name)}" ${o.name===val?'selected':''}>${esc(o.name)}</option>`).join('')}
function statusClass(s){return ['Ödendi','Alındı'].includes(s)?'ok':(s==='Gecikti'?'bad':'warn')}
function page(p){currentPage=p;document.querySelectorAll('.nav[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==p));$('title').textContent={dashboard:'Bugün',homes:'Varlıklar',cars:'Araçlar',finance:'Finans',notifications:'Bildirimler',calendar:'Takvim',documents:'Belgeler',reports:'Raporlar',definitions:'Tanımlar',backup:'Yedek'}[p]||p;updateNotificationBadge();({dashboard,homes,cars,finance,notifications,calendar,documents,reports,definitions,backup}[p])();$('side').classList.remove('open')}
function sum(arr,type){return arr.filter(e=>e.type===type).reduce((s,e)=>s+Number(e.amount||0),0)}
function assetValue(){return state.homes.reduce((s,h)=>s+Number(h.current_value||0),0)+state.cars.reduce((s,c)=>s+Number(c.current_value||0),0)}
function assetValueBreakdown(){return {home:state.homes.reduce((s,h)=>s+Number(h.current_value||0),0),car:state.cars.reduce((s,c)=>s+Number(c.current_value||0),0)}}

function isClosedStatus(s){return ['Ödendi','Alındı','İptal'].includes(s)}
function getOverdue(){return state.entries.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<new Date(today())).sort((a,b)=>a.date.localeCompare(b.date))}
function buildNotifications(){
  const overdue=getOverdue();
  const upcoming=getUpcoming(30);
  const todayOpen=state.entries.filter(e=>!isClosedStatus(e.status)&&e.date===today()).sort((a,b)=>(a.category||'').localeCompare(b.category||''));
  const recentDocs=state.documents.slice(0,4);
  const notes=[];
  overdue.forEach(e=>notes.push({level:'danger',icon:'⚠️',title:`Geciken ${e.type==='income'?'tahsilat':'ödeme'}`,detail:entryLabel(e),date:e.date,action:'Kontrol Et',fn:`entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')`}));
  upcoming.slice(0,8).forEach(e=>notes.push({level:daysUntil(e.date)<=7?'warning':'info',icon:'📅',title:`Yaklaşan: ${e.category||'Kayıt'}`,detail:`${daysUntil(e.date)===0?'Bugün':daysUntil(e.date)+' gün sonra'} · ${entryLabel(e)}`,date:e.date,action:'Takvim',fn:`page('calendar')`}));
  todayOpen.forEach(e=>notes.push({level:'warning',icon:'📌',title:'Bugün yapılacak',detail:entryLabel(e),date:e.date,action:'Aç',fn:`entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')`}));
  recentDocs.forEach(d=>notes.push({level:'info',icon:'📄',title:'Son eklenen belge',detail:`${d.doc_type||'Belge'} · ${d.file_name||''}`,date:(d.created_at||'').slice(0,10),action:'Belgeler',fn:`page('documents')`}));
  if(!notes.length)notes.push({level:'success',icon:'✅',title:'Her şey yolunda',detail:'Geciken veya yaklaşan kritik kayıt görünmüyor.',date:today(),action:'Bugün',fn:`page('dashboard')`});
  return notes;
}
function updateNotificationBadge(){
  const b=$('navNotifyBadge');
  if(!b)return;
  const count=getOverdue().length+getUpcoming(7).length;
  b.textContent=count;
  b.classList.toggle('hidden',count===0);
}
function notificationItem(n){return `<div class="notification-item ${n.level}"><div class="notification-icon">${n.icon}</div><div class="notification-copy"><b>${esc(n.title)}</b><span>${esc(n.detail)}</span><small>${esc(n.date||'')}</small></div>${n.action?`<button class="small secondary" onclick="${n.fn}">${esc(n.action)}</button>`:''}</div>`}
function dashboard(){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth();
  const month=state.entries.filter(e=>new Date(e.date).getMonth()==m&&new Date(e.date).getFullYear()==y);
  const income=sum(month,'income'),exp=sum(month,'expense');
  const upcoming=getUpcoming(30);
  const overdue=getOverdue();
  const todayOpen=state.entries.filter(e=>!isClosedStatus(e.status)&&e.date===today());
  const recent=[...state.entries].slice(0,5);
  const weekday=now.toLocaleDateString('tr-TR',{weekday:'long'});
  const dateText=now.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
  const hour=now.getHours();
  const greeting=hour<12?'Günaydın':(hour<18?'İyi günler':'İyi akşamlar');
  const ai=homeAiBrief(income,exp,upcoming,overdue,todayOpen);
  const focus=focusScore(income,exp,upcoming,overdue,todayOpen);
  const next3=upcoming.slice(0,3);
  $('content').innerHTML=`
    <div class="home-shell v6-home">
      <section class="home-hero v6-hero">
        <div>
          <span class="eyebrow">Momentum Hub · Asset Module</span>
          <h2>Bugün</h2>
          <p>${esc(greeting)} Ali Bey · ${esc(weekday)} · ${esc(dateText)}</p>
        </div>
        <div class="focus-score ${focus.level}">
          <span>Günlük Odak</span>
          <b>${focus.score}</b>
          <small>${esc(focus.text)}</small>
        </div>
      </section>

      <section class="ai-focus-card v6-ai">
        <div class="ai-focus-head">
          <div class="ai-orb">🤖</div>
          <div>
            <span class="eyebrow">Momentum AI</span>
            <h3>Bugün için öncelik sırası</h3>
            <p class="muted">Kritik kayıtlar, yaklaşan işler ve finans durumuna göre oluşturuldu.</p>
          </div>
          <button class="small secondary" onclick="showAiBrief()">AI Özeti Aç</button>
        </div>
        <div class="ai-action-list v6-ai-list">${ai.map(x=>aiActionItem(x)).join('')}</div>
      </section>


      <section class="home-status-grid v6-stats">
        <button class="home-stat clickable" onclick="page('reports')"><span>Bu Ay Gelir</span><b>${fmt(income)}</b><small>Raporu aç</small></button>
        <button class="home-stat clickable" onclick="page('reports')"><span>Bu Ay Gider</span><b>${fmt(exp)}</b><small>Detayları gör</small></button>
        <button class="home-stat clickable" onclick="page('reports')"><span>Net Durum</span><b class="${income-exp>=0?'pos':'neg'}">${fmt(income-exp)}</b><small>${income-exp>=0?'Pozitif':'Kontrol et'}</small></button>
        <button class="home-stat clickable" onclick="page('notifications')"><span>Aktif Uyarı</span><b>${overdue.length+upcoming.length}</b><small>Bildirimleri aç</small></button>
      </section>

      ${dashboardFinanceSummary()}

      <section class="home-grid-main lower v6-home-grid">
        <div class="home-card priority-card">
          <div class="home-card-head"><span>🎯</span><div><b>Bugünün Öncelikleri</b><small>En fazla 5 aksiyon</small></div></div>
          ${todayPriorityList(overdue,todayOpen,upcoming)}
        </div>
        <div class="home-card">
          <div class="home-card-head"><span>📅</span><div><b>Yaklaşan İşler</b><small>Önümüzdeki 30 gün</small></div></div>
          ${upcoming.length?`<div class="upcoming-list">${upcoming.slice(0,7).map(e=>homeUpcomingRow(e)).join('')}</div>`:'<div class="empty compact">Önümüzdeki 30 gün için açık kayıt yok.</div>'}
          ${next3.length?`<button class="secondary full" onclick="page('calendar')">Takvime Git</button>`:''}
        </div>
      </section>

      <section class="home-grid-main lower v6-home-grid">
        <div class="home-card today-decision">
          <div class="home-card-head"><span>📊</span><div><b>Bugünkü Durum</b><small>Karar özeti</small></div></div>
          <div class="today-summary v6-summary">
            <div><span>Toplam Varlık</span><b>${fmt(assetValue())}</b></div>
            <div><span>Ev / Araç</span><b>${state.homes.length} / ${state.cars.length}</b></div>
            <div><span>Geciken</span><b class="${overdue.length?'neg':''}">${overdue.length}</b></div>
            <div><span>Bugün Açık</span><b>${todayOpen.length}</b></div>
          </div>
        </div>
        <div class="home-card">
          <div class="home-card-head"><span>📰</span><div><b>Son Hareketler</b><small>En son 5 kayıt</small></div></div>
          ${recent.length?recent.map(e=>homeRecentRow(e)).join(''):'<div class="empty compact">Henüz hareket yok.</div>'}
        </div>
      </section>
    </div>`
}
function dashboardFinanceSummary(){
  const s=financeAccountSummary(),tx=financeTransactionSummary();
  if(!s.count)return `<section class="card dashboard-finance"><div class="row"><h2 style="flex:1">Finans Özeti</h2><button onclick="page('finance')">Finans’a Git</button></div><p class="muted">Finans özeti için önce hesap ekleyin.</p></section>`;
  return `<section class="card dashboard-finance"><div class="row"><h2 style="flex:1">Finans Özeti</h2><button onclick="page('finance')">Finans’a Git</button></div><div class="finance-dashboard-grid"><div class="kpi"><span>Toplam Varlık</span><b class="pos">${fmt(s.assets)}</b></div><div class="kpi"><span>Toplam Borç</span><b class="neg">${fmt(s.liabilities)}</b></div><div class="kpi"><span>Net Durum</span><b class="${s.net>=0?'pos':'neg'}">${fmt(s.net)}</b></div><div class="kpi"><span>Bu Ay Gelir</span><b class="pos">${fmt(tx.income)}</b></div><div class="kpi"><span>Bu Ay Gider</span><b class="neg">${fmt(tx.expense)}</b></div><div class="kpi"><span>Net Akış</span><b class="${tx.net>=0?'pos':'neg'}">${fmt(tx.net)}</b></div></div><p class="muted">Bakiyeler Finance modülündeki hesaplanan değerlerden gelir.</p></section>`;
}

function focusScore(income,exp,upcoming,overdue,todayOpen){
  let score=100;
  score-=Math.min(overdue.length*18,54);
  score-=Math.min(todayOpen.length*8,24);
  score-=Math.min(upcoming.filter(e=>daysUntil(e.date)<=7).length*7,21);
  if(exp>income&&income>0)score-=12;
  score=Math.max(0,Math.min(100,score));
  const level=score>=75?'good':(score>=45?'warn':'bad');
  const text=level==='good'?'Kontrol sende':(level==='warn'?'Bugün takip gerekli':'Önceliklendirme şart');
  return {score,level,text};
}
function homeAiBrief(income,exp,upcoming,overdue,todayOpen){
  const tips=[];
  if(overdue.length) tips.push({
    level:'danger',icon:'⚠️',title:`${overdue.length} geciken kayıt var`,
    detail:'Önce geciken tahsilat ve ödemeleri kapat.',action:'Gecikenleri Aç',fn:'showOverdueRecords()'
  });
  if(todayOpen.length) tips.push({
    level:'warning',icon:'📌',title:`Bugün açık ${todayOpen.length} işlem var`,
    detail:'Bugünkü kayıtları kontrol edip durumu güncelle.',action:'Bugünü Aç',fn:'showTodayRecords()'
  });
  if(upcoming.length){
    const first=upcoming[0];
    const d=daysUntil(first.date);
    tips.push({
      level:d<=7?'warning':'info',icon:'📅',title:`Sıradaki iş: ${esc(first.category||'Yaklaşan kayıt')}`,
      detail:`${d===0?'Bugün':d+' gün sonra'} · ${esc(first.date)} · ${fmt(first.amount)}`,action:'Takvime Git',fn:"page('calendar')"
    });
  }
  const net=income-exp;
  tips.push({
    level:net>=0?'success':'warning',icon:net>=0?'✅':'💸',title:net>=0?'Bu ay net durum pozitif':'Bu ay giderler geliri geçti',
    detail:`Net durum: ${fmt(net)}`,action:'Raporu Aç',fn:"page('reports')"
  });
  const carExp=state.entries.filter(e=>e.car_id&&e.type==='expense').reduce((s,e)=>s+Number(e.amount||0),0);
  const homeExp=state.entries.filter(e=>e.home_id&&e.type==='expense').reduce((s,e)=>s+Number(e.amount||0),0);
  if(carExp||homeExp){
    const label=carExp>homeExp?'Araç giderleri daha yüksek':'Ev giderleri daha yüksek';
    tips.push({
      level:'info',icon:'📌',title:label,
      detail:`Araç ${fmt(carExp)} · Ev ${fmt(homeExp)}`,action:'Dağılımı Aç',fn:"page('reports')"
    });
  }else if(!state.homes.length&&!state.cars.length){
    tips.push({
      level:'info',icon:'➕',title:'Başlamak için varlık ekle',
      detail:'İlk ev veya aracını ekleyerek Hub’ı başlat.',action:'Varlık Ekle',fn:'quickAction()'
    });
  }
  return tips.slice(0,5);
}
function aiActionItem(x){
  return `<div class="ai-action-item ${x.level}">
    <div class="ai-action-icon">${x.icon}</div>
    <div class="ai-action-copy"><b>${x.title}</b><span>${x.detail}</span></div>
    ${x.action?`<button class="ai-action-btn" onclick="${x.fn}">${x.action}</button>`:''}
  </div>`;
}
function daysUntil(d){
  const a=new Date(today()+'T00:00:00');
  const b=new Date(d+'T00:00:00');
  return Math.round((b-a)/86400000);
}
function showOverdueRecords(){
  const overdue=state.entries.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<new Date(today()))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!overdue.length){toast('Geciken kayıt yok.');return}
  openModal(`<h2>Geciken Kayıtlar</h2><p class="muted">Önce bu kayıtları kontrol et. Düzenle, belge ekle veya ödeme durumunu güncelle.</p>${entryTable(overdue)}`);
}
function showTodayRecords(){
  const rows=state.entries.filter(e=>!isClosedStatus(e.status)&&e.date===today()).sort((a,b)=>(a.category||'').localeCompare(b.category||''));
  if(!rows.length){toast('Bugün açık kayıt yok.');return}
  openModal(`<h2>Bugünkü Açık Kayıtlar</h2><p class="muted">Bugün tarihli açık ödeme ve tahsilat kayıtları.</p>${entryTable(rows)}`);
}
function showAiBrief(){
  const overdue=getOverdue();
  const upcoming=getUpcoming(30);
  const todayOpen=state.entries.filter(e=>!isClosedStatus(e.status)&&e.date===today());
  const now=new Date();
  const month=state.entries.filter(e=>new Date(e.date).getMonth()===now.getMonth()&&new Date(e.date).getFullYear()===now.getFullYear());
  const income=sum(month,'income'), exp=sum(month,'expense');
  const ai=homeAiBrief(income,exp,upcoming,overdue,todayOpen);
  openModal(`<div class="ai-brief-modal"><span class="eyebrow">Momentum AI</span><h2>Bugünün AI Özeti</h2><p class="muted">Bu özet mevcut kayıtlarına göre otomatik oluşturulur. Gerçek LLM entegrasyonu Faz 2'de bağlanacak.</p><div class="ai-action-list v6-ai-list">${ai.map(aiActionItem).join('')}</div></div>`);
}
function todayPriorityList(overdue,todayOpen,upcoming){
  const items=[];
  overdue.slice(0,2).forEach(e=>items.push({icon:'⚠️',title:e.category||'Geciken kayıt',detail:entryLabel(e),fn:`entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')`,action:'Aç'}));
  todayOpen.slice(0,2).forEach(e=>items.push({icon:'📌',title:e.category||'Bugünkü kayıt',detail:entryLabel(e),fn:`entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')`,action:'Aç'}));
  upcoming.slice(0,2).forEach(e=>items.push({icon:'📅',title:e.category||'Yaklaşan',detail:`${daysUntil(e.date)} gün · ${entryLabel(e)}`,fn:`page('calendar')`,action:'Takvim'}));
  const trimmed=items.slice(0,5);
  if(!trimmed.length)return '<div class="empty compact">Bugün için kritik aksiyon görünmüyor.</div>';
  return `<div class="priority-list">${trimmed.map(i=>`<div class="priority-item"><div><b>${i.icon} ${esc(i.title)}</b><small>${esc(i.detail)}</small></div><button class="small secondary" onclick="${i.fn}">${i.action}</button></div>`).join('')}</div>`;
}
function homeUpcomingRow(e){
  const asset=e.home_id?state.homes.find(h=>h.id===e.home_id)?.name:state.cars.find(c=>c.id===e.car_id)?.name;
  const d=daysUntil(e.date);
  const label=d===0?'Bugün':(d===1?'Yarın':`${d} gün`);
  return `<div class="home-row upcoming-row"><div><b>${esc(e.category||'Kayıt')}</b><small>${esc(asset||'Varlık')} · ${esc(e.status||'Bekleniyor')} · ${fmt(e.amount)}</small></div><time>${label}<br><small>${esc(e.date)}</small></time></div>`
}
function homeRecentRow(e){
  const asset=e.home_id?state.homes.find(h=>h.id===e.home_id)?.name:state.cars.find(c=>c.id===e.car_id)?.name;
  return `<div class="home-row recent"><div><b>${esc(e.category||'Kayıt')}</b><small>${esc(asset||'Varlık')} · ${esc(e.date)}</small></div><strong class="${e.type==='income'?'pos':'neg'}">${e.type==='income'?'+':'-'}${fmt(e.amount)}</strong></div>`
}
function assistantTips(income,exp,yin,yex,upcoming){const tips=[];tips.push(`Bu ay net nakit akışın <b>${fmt(income-exp)}</b>.`);if(upcoming.length)tips.push(`${upcoming.length} adet yaklaşan ödeme/tahsilat var.`);const overdue=state.entries.filter(e=>!['Ödendi','Alındı','İptal'].includes(e.status)&&new Date(e.date)<new Date(today()));if(overdue.length)tips.push(`${overdue.length} kayıt gecikmiş görünüyor.`);tips.push(`Bu yıl toplam net durum <b>${fmt(yin-yex)}</b>.`);return tips.map(t=>`<div class="item">${t}</div>`).join('')}
function topExpenseBars(){const rows=group(state.entries.filter(e=>e.type==='expense'),'category');const max=Math.max(...rows.map(r=>r.total),1);return rows.slice(0,6).map(r=>`<div><div class="row"><b style="flex:1">${esc(r.key)}</b><span>${fmt(r.total)}</span></div><div class="bar"><i style="width:${Math.round(r.total/max*100)}%"></i></div></div>`).join('')||'<p class="muted">Gider kaydı yok.</p>'}
function assetLine(kind,a){const ent=state.entries.filter(e=>kind=='home'?e.home_id==a.id:e.car_id==a.id);const inc=sum(ent,'income'),ex=sum(ent,'expense');return `<div class="item"><h3>${esc(a.name)}</h3><span class="muted">Değer: ${fmt(a.current_value)} | Gelir: ${fmt(inc)} | Gider: ${fmt(ex)} | Net: ${fmt(inc-ex)}</span></div>`}
function homes(){$('content').innerHTML=`<div class="card"><div class="row"><h2 style="flex:1">Gayrimenkuller</h2><button onclick="homeForm()">Ev Ekle</button></div></div><div class="list">${state.homes.map(h=>assetCard('home',h)).join('')||'<div class="card muted">Ev ekleyerek başlayın.</div>'}</div>`}
function cars(){$('content').innerHTML=`<div class="card"><div class="row"><h2 style="flex:1">Araçlar</h2><button onclick="carForm()">Araç Ekle</button></div></div><div class="list">${state.cars.map(c=>assetCard('car',c)).join('')||'<div class="card muted">Araç ekleyerek başlayın.</div>'}</div>`}
function assetCard(kind,a){const ent=state.entries.filter(e=>kind=='home'?e.home_id==a.id:e.car_id==a.id);return `<div class="item"><h3>${esc(a.name)} ${kind==='home'?`<span class="badge">${esc(a.kind)}</span>`:`<span class="badge">${esc(a.plate||'')}</span>`}</h3><p class="muted">${esc(a.address||a.note||'')}</p><p>Güncel Değer: <b>${fmt(a.current_value)}</b> | Gelir: <b>${fmt(sum(ent,'income'))}</b> | Gider: <b>${fmt(sum(ent,'expense'))}</b></p><div class="row">${kind==='home'?`<button onclick="entryForm('home','${a.id}','income')">Gelir Ekle</button>`:''}<button onclick="entryForm('${kind}','${a.id}','expense')">Gider Ekle</button><button class="secondary" onclick="showAssetEntries('${kind}','${a.id}')">Kayıtlar</button><button class="secondary" onclick="showDocs('${kind}','${a.id}')">Belgeler</button><button class="secondary" onclick="${kind}Form('${a.id}')">Düzenle</button><button class="danger" onclick="delAsset('${kind==='home'?'homes':'cars'}','${a.id}')">Sil</button></div></div>`}
function showAssetEntries(kind,id){const asset=(kind==='home'?state.homes:state.cars).find(x=>x.id===id);const all=state.entries.filter(e=>kind==='home'?e.home_id===id:e.car_id===id);openModal(`<h2>${esc(asset?.name||'Kayıtlar')}</h2><div class="split"><div><h3>Gelirler</h3>${entryTable(all.filter(e=>e.type==='income'))}</div><div><h3>Giderler</h3>${entryTable(all.filter(e=>e.type==='expense'))}</div></div>`)}
function entryDocs(entryId){return state.documents.filter(d=>d.entry_id===entryId)}
function entryLabel(e){return `${e.type==='income'?'Gelir':'Gider'} / ${e.category||'Diğer'} / ${fmt(e.amount)} / ${e.date}`}
function entryTable(list){return list.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Tarih</th><th>Kategori</th><th>Tutar</th><th>Durum</th><th>Belge</th><th>Açıklama</th><th>İşlem</th></tr></thead><tbody>${list.map(e=>{const dc=entryDocs(e.id).length;const done=['Ödendi','Alındı','İptal'].includes(e.status);return `<tr><td data-label="Tarih">${esc(e.date)}</td><td data-label="Kategori">${esc(e.category||'Diğer')}</td><td data-label="Tutar">${fmt(e.amount)}</td><td data-label="Durum"><span class="badge ${statusClass(e.status)}">${esc(e.status)}</span></td><td data-label="Belge">${dc?`📎 ${dc}`:'-'}</td><td data-label="Açıklama">${esc(e.note||'')}</td><td data-label="İşlem"><div class="table-actions">${!done?`<button class="small success" onclick="markEntryDone('${e.id}')">${e.type==='income'?'Alındı Yap':'Ödendi Yap'}</button>`:''}<button class="small secondary" onclick="entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')">Düzenle</button><button class="small secondary" onclick="showDocs('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.id}')">Belge</button><button class="small danger" onclick="delEntry('${e.id}')">Sil</button></div></td></tr>`}).join('')}</tbody></table></div>`:'<p class="muted">Kayıt yok.</p>'}

async function markEntryDone(id){
  const e=state.entries.find(x=>x.id===id);
  if(!e)return toast('Kayıt bulunamadı.');
  const newStatus=e.type==='income'?'Alındı':'Ödendi';
  const {error}=await sb.from('entries').update({status:newStatus}).eq('id',id);
  if(error)return toast(error.message);
  toast('Kayıt durumu güncellendi.');
  await load();
  const overdue=state.entries.filter(x=>!['Ödendi','Alındı','İptal'].includes(x.status)&&new Date(x.date)<new Date(today()));
  if(overdue.length)showOverdueRecords();else closeModal();
}

function notifications(){
  const notes=buildNotifications();
  const overdue=getOverdue().length, week=getUpcoming(7).length, month=getUpcoming(30).length;
  $('content').innerHTML=`<div class="card notifications-head"><div><span class="eyebrow">Momentum Hub</span><h2>Bildirim Merkezi</h2><p class="muted">Geciken, yaklaşan ve bugün dikkat edilmesi gereken kayıtlar.</p></div><button onclick="quickAction()">+ Hızlı İşlem</button></div><div class="notification-stats"><div><span>Geciken</span><b class="neg">${overdue}</b></div><div><span>7 Gün</span><b>${week}</b></div><div><span>30 Gün</span><b>${month}</b></div></div><div class="card"><h2>Uyarılar</h2><div class="notification-list">${notes.map(notificationItem).join('')}</div></div>`;
}
function calendar(){
  const selected=calendarMonth||new Date().toISOString().slice(0,7);
  const list=getCalendarMonthItems(selected);
  $('content').innerHTML=`
    <div class="card calendar-head stable-calendar-head">
      <div>
        <span class="eyebrow">Finans Takvimi</span>
        <h2>Aylık Takvim</h2>
        <p class="muted">Finans kayıtlarını seçtiğin aya göre takip et.</p>
      </div>
      <button onclick="quickAction()">+ Hızlı İşlem</button>
    </div>
    <div class="calendar-stable-toolbar card">
      <button class="secondary" onclick="shiftCalendarMonth(-1)">◀</button>
      <input id="calendarMonthPicker" type="month" value="${esc(selected)}" onchange="setCalendarMonth(this.value)">
      <button class="secondary" onclick="shiftCalendarMonth(1)">▶</button>
      <button class="secondary" onclick="setCalendarMonth(new Date().toISOString().slice(0,7))">Bu Ay</button>
    </div>
    ${calendarMonthlySummary(list,selected)}
    <div class="calendar-layout calendar-layout-stable">
      <div class="calendar-month card">${calendarMonthView(list,selected)}</div>
      <div class="calendar-agenda card"><h2>${calendarMonthLabel(selected)} Finans Kayıtları</h2>${calendarTimeline(list,false)}</div>
    </div>`;
}
function setCalendarMonth(value){calendarMonth=value||new Date().toISOString().slice(0,7);calendar()}
function shiftCalendarMonth(offset){const [y,m]=(calendarMonth||new Date().toISOString().slice(0,7)).split('-').map(Number);const d=new Date(y,m-1+offset,1);setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)}
function calendarMonthLabel(key){const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'})}
function getCalendarMonthItems(key){return state.entries.filter(e=>String(e.date||'').slice(0,7)===key).sort((a,b)=>a.date.localeCompare(b.date));}
function calendarMonthlySummary(list,key){
  const income=sum(list,'income'), expense=sum(list,'expense');
  const open=list.filter(e=>!isClosedStatus(e.status)).length;
  const overdue=list.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<new Date(today())).length;
  return `<div class="calendar-summary-grid">
    <div class="kpi"><span>Ay</span><b>${esc(calendarMonthLabel(key))}</b></div>
    <div class="kpi"><span>Gelir</span><b class="pos">${fmt(income)}</b></div>
    <div class="kpi"><span>Gider</span><b class="neg">${fmt(expense)}</b></div>
    <div class="kpi"><span>Net</span><b class="${income-expense>=0?'pos':'neg'}">${fmt(income-expense)}</b></div>
    <div class="kpi"><span>Açık / Geciken</span><b>${open} / <span class="neg">${overdue}</span></b></div>
  </div>`
}
function getCalendarItems(days=365){
  const now=new Date(today());const max=new Date(now);max.setDate(max.getDate()+days);
  return state.entries.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<=max).sort((a,b)=>a.date.localeCompare(b.date));
}
function calendarMonthView(list,key=calendarMonth||new Date().toISOString().slice(0,7)){
  const [y,m0]=key.split('-').map(Number);const m=m0-1;const first=new Date(y,m,1);const last=new Date(y,m+1,0);let html='';
  const start=(first.getDay()+6)%7;for(let i=0;i<start;i++)html+='<div class="cal-cell empty-cell"></div>';
  for(let d=1;d<=last.getDate();d++){
    const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const items=list.filter(e=>e.date===iso);
    const cls=iso===today()?'today-cell':'';
    html+=`<div class="cal-cell ${cls}"><b>${d}</b>${items.slice(0,3).map(e=>`<span class="cal-dot ${calendarLevel(e)}" title="${esc(entryLabel(e))}">${esc(e.category||'Kayıt')}</span>`).join('')}${items.length>3?`<small>+${items.length-3}</small>`:''}</div>`;
  }
  return `<div class="cal-weekdays"><span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span></div><div class="cal-grid">${html}</div>`;
}
function calendarLevel(e){if(new Date(e.date)<new Date(today()))return 'danger';if(e.date===today())return 'warning';return 'info'}
function calendarTimeline(list,compact=false){if(!list.length)return '<div class="empty">Açık veya yaklaşan kayıt yok.</div>';const groups={};list.forEach(e=>{groups[e.date]??=[];groups[e.date].push(e)});return `<div class="timeline">${Object.keys(groups).sort().map(d=>`<div class="day"><h3>${trDate(d)}</h3>${groups[d].map(e=>entryCard(e,!compact)).join('')}</div>`).join('')}</div>`}
function trDate(d){return new Date(d+'T00:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric',weekday:'long'})}
function reports(){
  const homeEntries=state.entries.filter(e=>e.home_id), carEntries=state.entries.filter(e=>e.car_id);
  const homeValue=state.homes.reduce((sum,h)=>sum+Number(h.current_value||0),0);
  const carValue=state.cars.reduce((sum,c)=>sum+Number(c.current_value||0),0);
  const homeIncome=sum(homeEntries,'income'), homeExpense=sum(homeEntries,'expense'), carExpense=sum(carEntries,'expense');
  const allEntries=[...homeEntries,...carEntries];
  const monthly=lastMonthsSummary(allEntries,12);
  $('content').innerHTML=`
    <div class="reports-v6c1">
      <div class="grid report-kpis">
        <div class="kpi">Ev Değeri<b>${fmt(homeValue)}</b><small>${state.homes.length} varlık</small></div>
        <div class="kpi">Araç Değeri<b>${fmt(carValue)}</b><small>${state.cars.length} araç</small></div>
        <div class="kpi">Ev Net<b>${fmt(homeIncome-homeExpense)}</b><small>Gelir ${fmt(homeIncome)} · Gider ${fmt(homeExpense)}</small></div>
        <div class="kpi">Araç Maliyeti<b>${fmt(carExpense)}</b><small>Toplam araç gideri</small></div>
      </div>
      <div class="grid2 reports-analytics-grid">
        <div class="card report-panel"><h2>Son 12 Ay Gelir / Gider</h2>${monthlyBars(monthly)}</div>
        <div class="card report-panel"><h2>Kategori Dağılımı</h2>${categoryBars(allEntries)}</div>
      </div>
      <div class="grid2 reports-table-grid">
        <div class="card report-panel"><h2>Ev Alt Kategori Raporu</h2><div class="tablewrap">${reportTable(homeEntries)}</div></div>
        <div class="card report-panel"><h2>Araç Alt Kategori Raporu</h2><div class="tablewrap">${reportTable(carEntries)}</div></div>
      </div>
      <div class="card report-panel"><h2>Varlık Değerleri</h2><div class="tablewrap">${assetValueTable()}</div></div>
    </div>`;
}
function reportTable(arr){const rows=group(arr,'category');return rows.length?`<table class="table report-table"><thead><tr><th>Kategori</th><th>Gelir</th><th>Gider</th><th>Net</th></tr></thead><tbody>${rows.map(r=>`<tr><td data-label="Kategori">${esc(r.key)}</td><td data-label="Gelir">${fmt(r.income)}</td><td data-label="Gider">${fmt(r.expense)}</td><td data-label="Net" class="${r.income-r.expense<0?'neg':''}">${fmt(r.income-r.expense)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Kayıt yok.</p>'}
function lastMonthsSummary(entries,count=12){
  const now=new Date();
  const months=[];
  for(let i=count-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months.push({key,label:d.toLocaleDateString('tr-TR',{month:'short'}),income:0,expense:0});}
  entries.forEach(e=>{const key=String(e.date||'').slice(0,7);const m=months.find(x=>x.key===key);if(m)m[e.type==='income'?'income':'expense']+=Number(e.amount||0);});
  return months;
}
function monthlyBars(months){
  const max=Math.max(1,...months.map(m=>Math.max(m.income,m.expense)));
  return `<div class="monthly-bars">${months.map(m=>`<div class="month-row"><span>${m.label}</span><div class="month-lines"><i class="inc" style="width:${Math.round((m.income/max)*100)}%"></i><i class="exp" style="width:${Math.round((m.expense/max)*100)}%"></i></div><b>${fmt(m.income-m.expense)}</b></div>`).join('')}</div><div class="chart-legend"><span><i class="inc-dot"></i>Gelir</span><span><i class="exp-dot"></i>Gider</span></div>`;
}
function categoryBars(entries){
  const rows=group(entries,'category').sort((a,b)=>(b.income+b.expense)-(a.income+a.expense)).slice(0,8);
  const max=Math.max(1,...rows.map(r=>r.income+r.expense));
  return rows.length?`<div class="category-bars">${rows.map(r=>{const total=r.income+r.expense;return `<div class="cat-row"><div><b>${esc(r.key)}</b><small>${fmt(total)}</small></div><span><i style="width:${Math.max(4,Math.round((total/max)*100))}%"></i></span></div>`}).join('')}</div>`:'<p class="muted">Kategori verisi yok.</p>';
}
function assetValueTable(){const rows=[...state.homes.map(x=>({t:'Ev',...x})),...state.cars.map(x=>({t:'Araç',...x}))];return rows.length?`<table class="table"><thead><tr><th>Tip</th><th>Ad</th><th>Alış Fiyatı</th><th>Güncel Değer</th><th>Fark</th></tr></thead><tbody>${rows.map(r=>`<tr><td data-label="Tip">${r.t}</td><td data-label="Ad">${esc(r.name)}</td><td data-label="Alış">${fmt(r.purchase_price)}</td><td data-label="Güncel">${fmt(r.current_value)}</td><td data-label="Fark">${fmt(Number(r.current_value||0)-Number(r.purchase_price||0))}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">Varlık yok.</p>'}
function group(arr,key){const m={};arr.forEach(e=>{const k=e[key]||'Diğer';m[k]??={key:k,income:0,expense:0,total:0};m[k][e.type]+=Number(e.amount||0);m[k].total+=Number(e.amount||0)});return Object.values(m).sort((a,b)=>b.total-a.total)}
function financeAccountTypes(){return [
  ['cash','Nakit'],['bank','Banka'],['credit_card','Kredi Kartı'],['foreign_currency','Döviz'],['gold','Altın'],['crypto','Kripto'],['investment','Yatırım'],['other','Diğer']
]}
function financeAccountTypeLabel(t){return Object.fromEntries(financeAccountTypes())[t]||'Diğer'}
function financeAccountIcon(t){return {cash:'💵',bank:'🏦',credit_card:'💳',foreign_currency:'🌍',gold:'💰',crypto:'₿',investment:'📈',other:'📌'}[t]||'📌'}
function financeFmt(n,c='TRY'){return `${(Number(n)||0).toLocaleString('tr-TR')} ${esc(c||'TRY')}`}
function maskFinanceText(v){const s=(v||'').toString().replace(/\s+/g,'');return s.length>8?`${s.slice(0,4)}••••${s.slice(-4)}`:s}
function financeTransactionTypes(){return [['income','Gelir'],['expense','Gider']]}
function financeTransactionTypeLabel(t){return Object.fromEntries(financeTransactionTypes())[t]||'Hareket'}
function financeTransactionCategories(t){return t==='income'?['Maaş','Kira Geliri','Ek Gelir','Satış','Yatırım Geliri','Diğer Gelir']:['Market','Fatura','Kira','Aidat','Ulaşım','Araç','Ev','Sağlık','Eğitim','Kredi/Kart Ödemesi','Diğer Gider']}
function financeAccountName(id){return state.financeAccounts.find(a=>a.id===id)?.name||'Hesap yok'}
function financeAccountById(id){return state.financeAccounts.find(a=>a.id===id)}
function financeTransactionFilters(){return {account:($('finance_filter_account')?.value||''),type:($('finance_filter_type')?.value||'')}}
function financeFilteredTransactions(){const f=financeTransactionFilters();return state.financeTransactions.filter(t=>(!f.account||t.account_id===f.account)&&(!f.type||t.transaction_type===f.type))}
function financeTransactionEffect(account,t){if((t.status||'completed')!=='completed')return 0;const amount=Number(t.amount||0);const isAsset=account?.is_asset!==false;if(t.transaction_type==='income')return isAsset?amount:-amount;if(t.transaction_type==='expense')return isAsset?-amount:amount;return 0}
function financeTransferEffect(account,tr){const amount=Number(tr.amount||0),fee=Number(tr.fee_amount||0);const isAsset=account?.is_asset!==false;if(tr.from_account_id===account.id)return isAsset?-(amount+fee):(amount+fee);if(tr.to_account_id===account.id)return isAsset?amount:-amount;return 0}
function financeAccountBalance(accountId){const account=financeAccountById(accountId);if(!account)return 0;const start=Number(account.initial_balance||0);const tx=state.financeTransactions.filter(t=>t.account_id===accountId).reduce((s,t)=>s+financeTransactionEffect(account,t),0);const transfers=state.financeTransfers.reduce((s,t)=>s+financeTransferEffect(account,t),0);return start+tx+transfers}
function financeAccountDelta(account){return financeAccountBalance(account.id)-Number(account.current_balance||0)}
async function syncFinanceAccountBalance(id){const account=financeAccountById(id);if(!account)return toast('Hesap bulunamadı.');const current_balance=financeAccountBalance(id);const {error}=await sb.from('finance_accounts').update({current_balance}).eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Manuel bakiye hesaplanan bakiyeyle eşitlendi.');await load();page('finance')}
function financeAccountSummary(){const active=state.financeAccounts.filter(a=>a.is_active!==false);const tryAccounts=active.filter(a=>(a.currency||'TRY').toUpperCase()==='TRY');const assets=tryAccounts.filter(a=>a.is_asset!==false).reduce((s,a)=>s+financeAccountBalance(a.id),0);const liabilities=tryAccounts.filter(a=>a.is_asset===false).reduce((s,a)=>s+Math.abs(financeAccountBalance(a.id)),0);const otherCurrencies=[...new Set(active.map(a=>(a.currency||'TRY').toUpperCase()).filter(c=>c!=='TRY'))];return {active,assets,liabilities,net:assets-liabilities,count:active.length,otherCurrencies}}
function financeTransactionSummary(){const month=today().slice(0,7);const completed=state.financeTransactions.filter(t=>(t.status||'completed')==='completed'&&(t.currency||'TRY').toUpperCase()==='TRY'&&(t.transaction_date||'').slice(0,7)===month);const income=completed.filter(t=>t.transaction_type==='income').reduce((s,t)=>s+Number(t.amount||0),0);const expense=completed.filter(t=>t.transaction_type==='expense').reduce((s,t)=>s+Number(t.amount||0),0);const otherCurrencies=[...new Set(state.financeTransactions.map(t=>(t.currency||'TRY').toUpperCase()).filter(c=>c!=='TRY'))];return {income,expense,net:income-expense,otherCurrencies}}
function currentBudgetMonth(){return today().slice(0,7)}
function financeBudgetsForMonth(month=currentBudgetMonth()){return state.financeBudgets.filter(b=>(b.is_active!==false)&&(b.month||'')===month)}
function financeBudgetActual(category,month=currentBudgetMonth(),currency='TRY'){return state.financeTransactions.filter(t=>(t.status||'completed')==='completed'&&t.transaction_type==='expense'&&(t.transaction_date||'').slice(0,7)===month&&t.title===category&&(t.currency||'TRY').toUpperCase()===(currency||'TRY').toUpperCase()).reduce((s,t)=>s+Number(t.amount||0),0)}
function financeBudgetProgress(b){const actual=financeBudgetActual(b.category,b.month||currentBudgetMonth(),b.currency||'TRY');const amount=Number(b.amount||0);const remaining=amount-actual;const ratio=amount>0?actual/amount:0;return {actual,amount,remaining,ratio,percent:Math.round(ratio*100)}}
function financeBudgetSummary(month=currentBudgetMonth()){const budgets=financeBudgetsForMonth(month);const total=budgets.reduce((s,b)=>s+Number(b.amount||0),0);const actual=budgets.reduce((s,b)=>s+financeBudgetActual(b.category,month,b.currency||'TRY'),0);return {budgets,total,actual,remaining:total-actual}}
function financeFinancingTypeOptions(selected='participation_finance'){return [['bank_loan','Banka Kredisi'],['participation_finance','Katılım Finansmanı'],['other','Diğer Finansman']].map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('')}
function financeFinancingTypeLabel(t){return Object.fromEntries([['bank_loan','Banka Kredisi'],['participation_finance','Katılım Finansmanı'],['other','Diğer Finansman']])[t]||'Finansman'}
function financeFinancingStatusOptions(selected='active'){return [['active','Aktif'],['completed','Tamamlandı'],['paused','Duraklatıldı']].map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('')}
function financeFinancingStatusLabel(s){return Object.fromEntries([['active','Aktif'],['completed','Tamamlandı'],['paused','Duraklatıldı']])[s]||'Aktif'}
function financeFinancingSummary(plan){const principal=Number(plan.principal_amount||0),commission=Number(plan.commission_amount||0),totalMonths=Math.max(1,Number(plan.total_months||1)),paidMonths=Math.min(totalMonths,Math.max(0,Number(plan.paid_months||0))),monthlyPayment=Number(plan.monthly_payment||0)||principal/totalMonths,remainingMonths=totalMonths-paidMonths,paidAmount=monthlyPayment*paidMonths,remainingAmount=monthlyPayment*remainingMonths,totalCost=principal+commission,progressPercent=totalMonths?(paidMonths/totalMonths)*100:0;return {principal,commission,totalMonths,paidMonths,monthlyPayment,remainingMonths,paidAmount,remainingAmount,totalCost,progressPercent}}
function financeFinancingPlansSummary(){const active=state.financeFinancingPlans.filter(p=>(p.status||'active')==='active');return active.reduce((s,p)=>{const x=financeFinancingSummary(p);s.count++;s.remaining+=x.remainingAmount;s.paid+=x.paidAmount;s.commission+=x.commission;return s},{count:0,remaining:0,paid:0,commission:0})}
function financeFinancingPlansList(){return `<div class="finance-budget-list">${state.financeFinancingPlans.map(financeFinancingPlanCard).join('')||'<div class="empty">Henüz finansman/kredi kaydı yok.</div>'}</div>`}
function financeFinancingPlanCard(p){const x=financeFinancingSummary(p),level=x.progressPercent>=100?'ok':(p.status==='paused'?'warn':'bad');return `<article class="finance-budget-card ${level}"><div class="row"><div style="flex:1"><h3>${esc(p.provider_name)}</h3><p class="muted">${esc(financeFinancingTypeLabel(p.financing_type))}${p.purpose?' · '+esc(p.purpose):''}</p></div><span class="badge ${p.status==='completed'?'ok':(p.status==='paused'?'warn':'bad')}">${esc(financeFinancingStatusLabel(p.status))}</span></div><div class="finance-budget-bar"><span style="width:${Math.min(Math.round(x.progressPercent),100)}%"></span></div><div class="finance-account-meta"><span>Finansman: ${financeFmt(x.principal,'TRY')}</span><span>Komisyon: ${financeFmt(x.commission,'TRY')}</span><span>Aylık: ${financeFmt(x.monthlyPayment,'TRY')}</span><span>Ödenen: ${x.paidMonths}/${x.totalMonths} ay</span><span>Kalan: ${x.remainingMonths} ay</span><span>İlerleme: %${x.progressPercent.toFixed(1)}</span></div><div class="finance-account-meta"><span>Ödenen toplam: ${financeFmt(x.paidAmount,'TRY')}</span><span>Kalan ödeme: ${financeFmt(x.remainingAmount,'TRY')}</span><span>Komisyon dahil maliyet: ${financeFmt(x.totalCost,'TRY')}</span>${p.next_payment_date?`<span>Sonraki ödeme: ${esc(p.next_payment_date)}</span>`:''}</div><p class="muted">${esc(p.notes||'')}</p>${(()=>{const is=financeInstallmentSummary(p.id);return `<div class="finance-account-meta"><span>Taksit Planı: ${is.count} kayıt</span><span>Ödenen: ${is.paidCount}</span><span>Bekleyen: ${is.pendingCount}</span><span>Geciken: ${is.overdueCount}</span><span>Kısmi: ${is.partialCount}</span></div>`})()}<details><summary>Taksit Planı</summary>${financeFinancingInstallmentsList(p.id)}</details><div class="asset-actions-v6"><button class="small secondary" onclick="financeFinancingPlanForm('${p.id}')">Düzenle</button><button class="small secondary" onclick="financeFinancingInstallmentForm('${p.id}')">Taksit Ekle</button><button class="small secondary" onclick="generateFinanceFinancingInstallments('${p.id}')">Plan Oluştur</button><button class="small danger" onclick="deleteFinanceFinancingPlan('${p.id}')">Sil</button></div></article>`}
function financeFinancingPlanForm(id=''){const p=state.financeFinancingPlans.find(x=>x.id===id)||{financing_type:'participation_finance',principal_amount:0,commission_amount:0,total_months:30,monthly_payment:0,paid_months:0,status:'active'};openModal(`<h2>${id?'Finansman/Kredi Düzenle':'Finansman/Kredi Ekle'}</h2><div class="split"><div><label>Kurum</label><input id="ff_provider_name" placeholder="Katılımevim, Fuzulevim, banka..." value="${esc(p.provider_name)}"></div><div><label>Tip</label><select id="ff_financing_type">${financeFinancingTypeOptions(p.financing_type)}</select></div></div><input id="ff_purpose" placeholder="Amaç / açıklama: Konut, araç, ihtiyaç..." value="${esc(p.purpose)}"><div class="split"><div><label>Alınan Finansman</label><input id="ff_principal_amount" type="number" min="0" step="0.01" value="${p.principal_amount||''}"></div><div><label>Komisyon / Organizasyon Ücreti</label><input id="ff_commission_amount" type="number" min="0" step="0.01" value="${p.commission_amount||0}"></div></div><div class="split"><div><label>Toplam Vade (ay)</label><input id="ff_total_months" type="number" min="1" step="1" value="${p.total_months||1}"></div><div><label>Aylık Ödeme</label><input id="ff_monthly_payment" type="number" min="0" step="0.01" value="${p.monthly_payment||''}"></div></div><div class="split"><div><label>Ödenen Ay</label><input id="ff_paid_months" type="number" min="0" step="1" value="${p.paid_months||0}"></div><div><label>Durum</label><select id="ff_status">${financeFinancingStatusOptions(p.status)}</select></div></div><div class="split"><div><label>Başlangıç Tarihi</label><input id="ff_start_date" type="date" value="${p.start_date||''}"></div><div><label>Sonraki Ödeme</label><input id="ff_next_payment_date" type="date" value="${p.next_payment_date||''}"></div></div><textarea id="ff_notes" placeholder="Not">${esc(p.notes)}</textarea><button onclick="saveFinanceFinancingPlan('${id}')">Kaydet</button>`)}
async function saveFinanceFinancingPlan(id=''){const row={user_id:user.id,provider_name:$('ff_provider_name').value.trim(),financing_type:$('ff_financing_type').value,purpose:$('ff_purpose').value.trim()||null,principal_amount:Number($('ff_principal_amount').value)||0,commission_amount:Number($('ff_commission_amount').value)||0,total_months:Number($('ff_total_months').value)||1,monthly_payment:Number($('ff_monthly_payment').value)||0,paid_months:Number($('ff_paid_months').value)||0,start_date:$('ff_start_date').value||null,next_payment_date:$('ff_next_payment_date').value||null,status:$('ff_status').value,notes:$('ff_notes').value.trim()||null};if(!row.provider_name)return toast('Kurum adı gerekli.');if(row.principal_amount<=0)return toast('Alınan finansman 0’dan büyük olmalı.');if(row.commission_amount<0||row.monthly_payment<0)return toast('Tutarlar negatif olamaz.');if(row.total_months<=0)return toast('Toplam vade 0’dan büyük olmalı.');if(row.paid_months<0||row.paid_months>row.total_months)return toast('Ödenen ay 0 ile toplam vade arasında olmalı.');if(row.monthly_payment===0)row.monthly_payment=row.principal_amount/row.total_months;const q=id?sb.from('finance_financing_plans').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_financing_plans').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();toast('Finansman/kredi kaydedildi.');await load();page('finance')}
async function deleteFinanceFinancingPlan(id){if(!confirm('Bu finansman/kredi kaydı silinsin mi?'))return;const {error}=await sb.from('finance_financing_plans').delete().eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Finansman/kredi silindi.');await load();page('finance')}
function financeInstallmentStatusOptions(selected='pending'){return [['pending','Bekliyor'],['paid','Ödendi'],['partial','Kısmi Ödendi'],['overdue','Gecikti'],['cancelled','İptal']].map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('')}
function financeInstallmentStatusLabel(s){return Object.fromEntries([['pending','Bekliyor'],['paid','Ödendi'],['partial','Kısmi Ödendi'],['overdue','Gecikti'],['cancelled','İptal']])[s]||'Bekliyor'}
function financeFinancingInstallmentsForPlan(planId){return state.financeFinancingInstallments.filter(i=>i.financing_plan_id===planId).sort((a,b)=>Number(a.installment_no||0)-Number(b.installment_no||0))}
function financeInstallmentEffectiveStatus(i){if(i.status==='paid'||i.status==='partial'||i.status==='cancelled')return i.status;return (i.due_date&&i.due_date<today())?'overdue':(i.status||'pending')}
function financeInstallmentSummary(planId){const rows=financeFinancingInstallmentsForPlan(planId);return rows.reduce((s,i)=>{const st=financeInstallmentEffectiveStatus(i);s.count++;s.total+=Number(i.amount||0);s.paid+=Number(i.paid_amount||0);if(st==='paid')s.paidCount++;if(st==='partial')s.partialCount++;if(st==='overdue')s.overdueCount++;if(st==='pending')s.pendingCount++;return s},{count:0,total:0,paid:0,paidCount:0,partialCount:0,overdueCount:0,pendingCount:0})}
function financeFinancingInstallmentsList(planId){const rows=financeFinancingInstallmentsForPlan(planId);return `<div class="finance-installment-list">${rows.map(financeFinancingInstallmentRow).join('')||'<div class="empty">Henüz taksit planı yok.</div>'}</div>`}
function financeFinancingInstallmentRow(i){const st=financeInstallmentEffectiveStatus(i);return `<div class="pill ${st==='paid'?'ok':(st==='overdue'?'bad':(st==='partial'?'warn':'inactive'))}"><span>#${Number(i.installment_no||0)} · ${esc(i.due_date||'Tarih yok')} · ${esc(financeInstallmentStatusLabel(st))} · ${financeFmt(i.paid_amount||0,'TRY')} / ${financeFmt(i.amount||0,'TRY')}</span><span><button class="small secondary" onclick="financeFinancingInstallmentForm('${i.financing_plan_id}','${i.id}')">Düzenle</button> <button class="small danger" onclick="deleteFinanceFinancingInstallment('${i.id}')">Sil</button></span></div>`}
function financeFinancingInstallmentForm(planId,id=''){const plan=state.financeFinancingPlans.find(p=>p.id===planId);if(!plan)return toast('Finansman kaydı bulunamadı.');const nextNo=financeFinancingInstallmentsForPlan(planId).length+1;const i=state.financeFinancingInstallments.find(x=>x.id===id)||{financing_plan_id:planId,installment_no:nextNo,due_date:plan.next_payment_date||today(),amount:plan.monthly_payment||0,paid_amount:0,status:'pending'};openModal(`<h2>${id?'Taksit Düzenle':'Taksit Ekle'}</h2><p class="muted">${esc(plan.provider_name)} · Taksit Planı</p><div class="split"><div><label>Taksit No</label><input id="fi_installment_no" type="number" min="1" step="1" value="${i.installment_no||nextNo}"></div><div><label>Vade Tarihi</label><input id="fi_due_date" type="date" value="${i.due_date||today()}"></div></div><div class="split"><div><label>Taksit Tutarı</label><input id="fi_amount" type="number" min="0" step="0.01" value="${i.amount||''}"></div><div><label>Ödenen Tutar</label><input id="fi_paid_amount" type="number" min="0" step="0.01" value="${i.paid_amount||0}"></div></div><div class="split"><div><label>Ödeme Tarihi</label><input id="fi_paid_date" type="date" value="${i.paid_date||''}"></div><div><label>Durum</label><select id="fi_status">${financeInstallmentStatusOptions(i.status)}</select></div></div><textarea id="fi_notes" placeholder="Not">${esc(i.notes)}</textarea><button onclick="saveFinanceFinancingInstallment('${planId}','${id}')">Kaydet</button>`)}
async function saveFinanceFinancingInstallment(planId,id=''){const row={user_id:user.id,financing_plan_id:planId,installment_no:Number($('fi_installment_no').value)||1,due_date:$('fi_due_date').value,amount:Number($('fi_amount').value)||0,paid_amount:Number($('fi_paid_amount').value)||0,paid_date:$('fi_paid_date').value||null,status:$('fi_status').value,notes:$('fi_notes').value.trim()||null};if(!row.financing_plan_id)return toast('Finansman seçimi gerekli.');if(row.installment_no<=0)return toast('Taksit no 0’dan büyük olmalı.');if(!row.due_date)return toast('Vade tarihi gerekli.');if(row.amount<0||row.paid_amount<0)return toast('Tutarlar negatif olamaz.');if(row.paid_amount>row.amount&&row.status!=='paid')return toast('Ödenen tutar taksit tutarından büyükse durum Ödendi olmalı.');const q=id?sb.from('finance_financing_installments').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_financing_installments').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();toast('Taksit kaydedildi.');await load();page('finance')}
async function deleteFinanceFinancingInstallment(id){if(!confirm('Bu taksit silinsin mi?'))return;const {error}=await sb.from('finance_financing_installments').delete().eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Taksit silindi.');await load();page('finance')}
function addMonths(dateStr,n){const d=new Date(dateStr+'T00:00:00');d.setMonth(d.getMonth()+n);return d.toISOString().slice(0,10)}
async function generateFinanceFinancingInstallments(planId){const plan=state.financeFinancingPlans.find(p=>p.id===planId);if(!plan)return toast('Finansman kaydı bulunamadı.');if(financeFinancingInstallmentsForPlan(planId).length&&!confirm('Mevcut taksitler var. Eksik taksitler eklensin mi?'))return;const start=plan.next_payment_date||plan.start_date||today();const existing=new Set(financeFinancingInstallmentsForPlan(planId).map(i=>Number(i.installment_no)));const rows=[];for(let n=1;n<=Number(plan.total_months||0);n++){if(existing.has(n))continue;rows.push({user_id:user.id,financing_plan_id:planId,installment_no:n,due_date:addMonths(start,n-1),amount:Number(plan.monthly_payment||0)||Number(plan.principal_amount||0)/Math.max(1,Number(plan.total_months||1)),paid_amount:n<=Number(plan.paid_months||0)?(Number(plan.monthly_payment||0)||Number(plan.principal_amount||0)/Math.max(1,Number(plan.total_months||1))):0,paid_date:null,status:n<=Number(plan.paid_months||0)?'paid':'pending',notes:null})}if(!rows.length)return toast('Eklenecek yeni taksit yok.');const {error}=await sb.from('finance_financing_installments').insert(rows);if(error)return toast(error.message);toast(`${rows.length} taksit oluşturuldu.`);await load();page('finance')}

function financeBudgetsList(){const month=currentBudgetMonth();const rows=financeBudgetsForMonth(month);return `<div class="finance-budget-list">${rows.map(financeBudgetCard).join('')||'<div class="empty">Bu ay için bütçe yok.</div>'}</div>`}
function financeBudgetCard(b){const p=financeBudgetProgress(b),level=p.percent>=100?'bad':(p.percent>=70?'warn':'ok');return `<article class="finance-budget-card ${level}"><div class="row"><div style="flex:1"><h3>${esc(b.category)}</h3><p class="muted">${esc(b.month||currentBudgetMonth())} · ${esc(b.currency||'TRY')}</p></div><b class="${level==='bad'?'neg':'pos'}">%${p.percent}</b></div><div class="finance-budget-bar"><span style="width:${Math.min(p.percent,100)}%"></span></div><div class="finance-account-meta"><span>Limit: ${financeFmt(p.amount,b.currency||'TRY')}</span><span>Harcanan: ${financeFmt(p.actual,b.currency||'TRY')}</span><span>Kalan: ${financeFmt(p.remaining,b.currency||'TRY')}</span></div><p class="muted">${esc(b.notes||'')}</p><div class="asset-actions-v6"><button class="small secondary" onclick="financeBudgetForm('${b.id}')">Düzenle</button><button class="small danger" onclick="deleteFinanceBudget('${b.id}')">Sil</button></div></article>`}
function financeBudgetForm(id=''){const b=state.financeBudgets.find(x=>x.id===id)||{month:currentBudgetMonth(),budget_type:'expense',currency:'TRY',is_active:true};const cats=financeTransactionCategories('expense').map(c=>`<option value="${esc(c)}" ${c===b.category?'selected':''}>${esc(c)}</option>`).join('');openModal(`<h2>${id?'Bütçe Düzenle':'Bütçe Ekle'}</h2><div class="split"><div><label>Ay</label><input id="fb_month" type="month" value="${esc(b.month||currentBudgetMonth())}"></div><div><label>Kategori</label><select id="fb_category">${cats}</select></div></div><div class="split"><div><label>Tutar</label><input id="fb_amount" type="number" min="0" step="0.01" value="${b.amount||''}"></div><div><label>Para Birimi</label><input id="fb_currency" value="${esc(b.currency||'TRY')}"></div></div><label>Durum</label><select id="fb_is_active"><option value="true" ${b.is_active!==false?'selected':''}>Aktif</option><option value="false" ${b.is_active===false?'selected':''}>Pasif</option></select><textarea id="fb_notes" placeholder="Not">${esc(b.notes)}</textarea><button onclick="saveFinanceBudget('${id}')">Kaydet</button>`)}
async function saveFinanceBudget(id=''){const row={user_id:user.id,category:$('fb_category').value,budget_type:'expense',amount:Number($('fb_amount').value)||0,currency:($('fb_currency').value||'TRY').trim().toUpperCase(),month:$('fb_month').value,notes:$('fb_notes').value.trim()||null,is_active:$('fb_is_active').value==='true'};if(!row.month)return toast('Ay seçimi gerekli.');if(!row.category)return toast('Kategori gerekli.');if(row.amount<0)return toast('Bütçe tutarı negatif olamaz.');if(!/^[A-Z0-9]{3,5}$/.test(row.currency))return toast('Para birimi 3-5 karakter olmalı.');const q=id?sb.from('finance_budgets').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_budgets').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();toast('Bütçe kaydedildi.');await load();page('finance')}
async function deleteFinanceBudget(id){if(!confirm('Bu bütçe silinsin mi?'))return;const {error}=await sb.from('finance_budgets').delete().eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Bütçe silindi.');await load();page('finance')}
function finance(){
  const s=financeAccountSummary(),tx=financeTransactionSummary(),fn=financeFinancingPlansSummary();const inactive=state.financeAccounts.filter(a=>a.is_active===false).length;
  $('content').innerHTML=`<div class="finance-shell"><section class="finance-hero card"><div><span class="eyebrow">Momentum Finance</span><h2>Finansal Durum</h2><p class="muted">Hesap, gelir/gider, transfer ve hesaplanan bakiye yönetimi.</p><p class="muted finance-note">Bakiyeler, başlangıç bakiyesi + gerçekleşen hareketler + transferler üzerinden hesaplanır.</p></div><div class="row"><button onclick="financeAccountForm()">+ Hesap Ekle</button><button onclick="financeTransactionForm()">+ Hareket Ekle</button><button onclick="financeTransferForm()">+ Transfer Ekle</button><button onclick="financeFinancingPlanForm()">+ Finansman Ekle</button></div></section><section class="finance-tabs"><button onclick="document.getElementById('finance_accounts_panel').scrollIntoView({behavior:'smooth'})">Hesaplar</button><button class="secondary" onclick="document.getElementById('finance_transactions_panel').scrollIntoView({behavior:'smooth'})">Hareketler</button><button class="secondary" onclick="document.getElementById('finance_transfers_panel').scrollIntoView({behavior:'smooth'})">Transferler</button><button class="secondary" onclick="document.getElementById('finance_budgets_panel').scrollIntoView({behavior:'smooth'})">Bütçeler</button><button class="secondary" onclick="document.getElementById('finance_financing_panel').scrollIntoView({behavior:'smooth'})">Finansmanlar</button></section><section class="finance-kpis"><div class="kpi"><span>Aktif Hesap</span><b>${s.count}</b><small>${inactive?inactive+' pasif hesap':''}</small></div><div class="kpi"><span>Hesaplanan Varlık</span><b class="pos">${fmt(s.assets)}</b><small>Başlangıç + hareket + transfer</small></div><div class="kpi"><span>Hesaplanan Borç</span><b class="neg">${fmt(s.liabilities)}</b><small>Sadece TRY borçlar</small></div><div class="kpi"><span>Net Hesap Durumu</span><b class="${s.net>=0?'pos':'neg'}">${fmt(s.net)}</b><small>${s.otherCurrencies.length?'Döviz ayrı: '+s.otherCurrencies.join(', '):'Varlık - Borç'}</small></div></section><section class="finance-kpis"><div class="kpi"><span>Bu Ay Gelir</span><b class="pos">${fmt(tx.income)}</b><small>Tamamlanan TRY gelirler</small></div><div class="kpi"><span>Bu Ay Gider</span><b class="neg">${fmt(tx.expense)}</b><small>Tamamlanan TRY giderler</small></div><div class="kpi"><span>Net Akış</span><b class="${tx.net>=0?'pos':'neg'}">${fmt(tx.net)}</b><small>Gelir - gider</small></div><div class="kpi"><span>Transfer</span><b>${state.financeTransfers.length}</b><small>Hesaplar arası</small></div></section><section class="finance-kpis"><div class="kpi"><span>Aktif Finansman</span><b>${fn.count}</b><small>Kredi / katılım finansmanı</small></div><div class="kpi"><span>Ödenen Finansman</span><b class="pos">${fmt(fn.paid)}</b><small>Ödenen taksit toplamı</small></div><div class="kpi"><span>Kalan Finansman</span><b class="neg">${fmt(fn.remaining)}</b><small>Kalan taksit toplamı</small></div><div class="kpi"><span>Komisyon</span><b>${fmt(fn.commission)}</b><small>Organizasyon / dosya masrafı</small></div></section>${state.financeError?`<section class="card danger"><b>Finance verisi yüklenemedi:</b> ${esc(state.financeError)}</section>`:''}${state.financeTransactionsError?`<section class="card danger"><b>Finance hareketleri yüklenemedi:</b> ${esc(state.financeTransactionsError)}</section>`:''}${state.financeTransfersError?`<section class="card danger"><b>Finance transferleri yüklenemedi:</b> ${esc(state.financeTransfersError)}</section>`:''}${state.financeBudgetsError?`<section class="card danger"><b>Finance bütçeleri yüklenemedi:</b> ${esc(state.financeBudgetsError)}</section>`:''}${state.financeFinancingPlansError?`<section class="card danger"><b>Finance finansmanları yüklenemedi:</b> ${esc(state.financeFinancingPlansError)}</section>`:''}${state.financeFinancingInstallmentsError?`<section class="card danger"><b>Finance taksit planı yüklenemedi:</b> ${esc(state.financeFinancingInstallmentsError)}</section>`:''}<section id="finance_accounts_panel"><div class="row"><h2 style="flex:1">Hesaplar</h2><button onclick="financeAccountForm()">+ Hesap Ekle</button></div><div class="finance-grid">${s.active.map(financeAccountCard).join('')||'<div class="card empty">Henüz finans hesabı yok.</div>'}</div></section>${inactive?`<section class="card"><h2>Pasif Hesaplar</h2><div class="finance-passive-list">${state.financeAccounts.filter(a=>a.is_active===false).map(financeAccountMini).join('')}</div></section>`:''}<section id="finance_transactions_panel" class="card"><div class="row"><div style="flex:1"><h2>Hareketler</h2><p class="muted">Sadece gerçekleşen hareketler hesaplanan bakiyeye etki eder.</p></div><button onclick="financeTransactionForm()">+ Hareket Ekle</button></div>${financeTransactionsList()}</section><section id="finance_transfers_panel" class="card"><div class="row"><div style="flex:1"><h2>Transferler</h2><p class="muted">Kaynak hesaptan düşer, hedef hesaba eklenir. Borç hesaplarında etki ters çalışır.</p></div><button onclick="financeTransferForm()">+ Transfer Ekle</button></div>${financeTransfersList()}</section><section id="finance_budgets_panel" class="card"><div class="row"><div style="flex:1"><h2>Bütçeler</h2><p class="muted">Aylık kategori limitleri ve gerçekleşen gider takibi.</p></div><button onclick="financeBudgetForm()">+ Bütçe Ekle</button></div>${financeBudgetsList()}</section><section id="finance_financing_panel" class="card"><div class="row"><div style="flex:1"><h2>Finansmanlar / Krediler</h2><p class="muted">Banka kredisi ve Katılımevim/Fuzulevim benzeri katılım finansmanı takibi.</p></div><button onclick="financeFinancingPlanForm()">+ Finansman Ekle</button></div>${financeFinancingPlansList()}</section></div>`;
}
function financeAccountCard(a){const type=financeAccountTypeLabel(a.account_type),balance=financeAccountBalance(a.id),delta=financeAccountDelta(a),hasDelta=Math.abs(delta)>0.009;return `<article class="finance-account-card ${a.is_asset===false?'liability':'asset'}"><div class="finance-account-top"><div><span class="finance-account-icon">${financeAccountIcon(a.account_type)}</span><h3>${esc(a.name)}</h3><p>${esc(type)} · ${esc(a.currency||'TRY')}</p></div><span class="badge ${a.is_asset===false?'bad':'ok'}">${a.is_asset===false?'Borç':'Varlık'}</span></div><div class="finance-account-balance"><span>Hesaplanan Bakiye</span><b class="${a.is_asset===false?'neg':'pos'}">${financeFmt(balance,a.currency||'TRY')}</b><small>Başlangıç + hareketler + transferler</small></div><div class="finance-reconcile"><span>Manuel: ${financeFmt(a.current_balance,a.currency||'TRY')}</span><span class="${delta>=0?'pos':'neg'}">Fark: ${financeFmt(delta,a.currency||'TRY')}</span></div>${hasDelta?`<button class="small secondary" onclick="syncFinanceAccountBalance('${a.id}')">Manuel bakiyeyi eşitle</button>`:''}<p class="muted">${esc(a.description||'')}</p><div class="asset-actions-v6"><button onclick="financeAccountForm('${a.id}')">Düzenle</button><button class="secondary" onclick="archiveFinanceAccount('${a.id}',false)">Pasife Al</button></div></article>`}
function financeAccountMini(a){return `<div class="pill inactive"><span>${financeAccountIcon(a.account_type)} ${esc(a.name)} · ${financeFmt(financeAccountBalance(a.id),a.currency||'TRY')}</span><button class="small secondary" onclick="archiveFinanceAccount('${a.id}',true)">Aktif Et</button></div>`}
function financeAccountTypeOptions(selected='bank'){return financeAccountTypes().map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('')}
function financeAccountForm(id=''){
  const a=state.financeAccounts.find(x=>x.id===id)||{account_type:'bank',currency:'TRY',is_asset:true,is_active:true};
  openModal(`<h2>${id?'Hesap Düzenle':'Finans Hesabı Ekle'}</h2><label>Hesap Adı</label><input id="fa_name" placeholder="Örn: İş Bankası, Nakit, Kredi Kartı" value="${esc(a.name)}"><div class="split"><div><label>Hesap Tipi</label><select id="fa_account_type">${financeAccountTypeOptions(a.account_type)}</select></div><div><label>Para Birimi</label><input id="fa_currency" value="${esc(a.currency||'TRY')}"></div></div><div class="split"><div><label>Başlangıç Bakiye</label><input id="fa_initial_balance" type="number" value="${a.initial_balance??0}"></div><div><label>Manuel Güncel Bakiye</label><input id="fa_current_balance" type="number" value="${a.current_balance??0}"></div></div><label>Hesap Niteliği</label><select id="fa_is_asset"><option value="true" ${a.is_asset!==false?'selected':''}>Varlık / Nakit</option><option value="false" ${a.is_asset===false?'selected':''}>Borç / Kredi Kartı</option></select><div class="split"><input id="fa_institution" placeholder="Kurum / Banka" value="${esc(a.institution)}"><input id="fa_card_last4" maxlength="4" placeholder="Kart son 4 hane" value="${esc(a.card_last4)}"></div><input id="fa_iban" placeholder="IBAN / hesap notu" value="${esc(a.iban)}"><input id="fa_credit_limit" type="number" placeholder="Kredi kartı limiti" value="${a.credit_limit||''}"><textarea id="fa_description" placeholder="Açıklama">${esc(a.description)}</textarea><button onclick="saveFinanceAccount('${id}')">Kaydet</button>`);
}
async function saveFinanceAccount(id=''){
  const row={user_id:user.id,name:$('fa_name').value.trim(),account_type:$('fa_account_type').value,currency:($('fa_currency').value||'TRY').trim().toUpperCase(),initial_balance:Number($('fa_initial_balance').value)||0,current_balance:Number($('fa_current_balance').value)||0,is_asset:$('fa_is_asset').value==='true',institution:$('fa_institution').value.trim()||null,iban:$('fa_iban').value.trim()||null,card_last4:$('fa_card_last4').value.trim()||null,credit_limit:$('fa_credit_limit').value===''?null:Number($('fa_credit_limit').value),description:$('fa_description').value.trim()||null,is_active:true};
  if(!row.name)return toast('Hesap adı gerekli.');
  if(!/^[A-Z0-9]{3,5}$/.test(row.currency))return toast('Para birimi 3-5 karakter olmalı. Örn: TRY, USD, EUR, XAU');
  if(row.card_last4&&!/^\d{4}$/.test(row.card_last4))return toast('Kart son 4 hane sadece 4 rakam olmalı.');
  if(row.is_asset===false)row.current_balance=Math.abs(row.current_balance);
  if(row.credit_limit!==null&&row.credit_limit<0)return toast('Kredi limiti negatif olamaz.');
  const q=id?sb.from('finance_accounts').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_accounts').insert(row);
  const {error}=await q;if(error)return toast(error.message);closeModal();toast('Finans hesabı kaydedildi.');await load();page('finance');
}
async function archiveFinanceAccount(id,isActive){const {error}=await sb.from('finance_accounts').update({is_active:isActive}).eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast(isActive?'Hesap aktif edildi.':'Hesap pasife alındı.');await load();page('finance')}
function financeTransactionsList(){const f=financeTransactionFilters();const rows=financeFilteredTransactions();const accountOptions='<option value="">Tüm Hesaplar</option>'+state.financeAccounts.filter(a=>a.is_active!==false).map(a=>`<option value="${a.id}" ${f.account===a.id?'selected':''}>${esc(a.name)}</option>`).join('');const typeOptions='<option value="">Tüm Tipler</option>'+financeTransactionTypes().map(([v,l])=>`<option value="${v}" ${f.type===v?'selected':''}>${l}</option>`).join('');return `<div class="finance-transaction-filters"><select id="finance_filter_account" onchange="page('finance')">${accountOptions}</select><select id="finance_filter_type" onchange="page('finance')">${typeOptions}</select></div><div class="finance-transaction-list">${rows.map(financeTransactionCard).join('')||'<div class="empty">Henüz gelir/gider hareketi yok.</div>'}</div>`}
function financeTransactionCard(t){const isIncome=t.transaction_type==='income';return `<article class="finance-transaction-card ${isIncome?'income':'expense'}"><div><time>${esc(t.transaction_date||'')}</time><b>${isIncome?'↗':'↘'} ${esc(t.title||financeTransactionTypeLabel(t.transaction_type))}</b><small>${esc(financeTransactionTypeLabel(t.transaction_type))} · ${esc(t.payment_method||'Yöntem yok')}</small></div><div><span>${esc(financeAccountName(t.account_id))}</span><small>${esc(t.notes||'')}</small></div><strong class="${isIncome?'pos':'neg'}">${isIncome?'+':'-'}${financeFmt(t.amount,t.currency||'TRY')}</strong><div class="table-actions"><button class="small secondary" onclick="financeTransactionForm('${t.id}')">Düzenle</button><button class="small danger" onclick="deleteFinanceTransaction('${t.id}')">Sil</button></div></article>`}
function financeTransactionTypeOptions(selected='expense'){return financeTransactionTypes().map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${label}</option>`).join('')}
function financeTransactionCategoryOptions(type,selected=''){return financeTransactionCategories(type||'expense').map(c=>`<option value="${esc(c)}" ${c===selected?'selected':''}>${esc(c)}</option>`).join('')}
function financeTransactionForm(id=''){if(!state.financeAccounts.some(a=>a.is_active!==false))return toast('Önce en az bir aktif finans hesabı ekle.');const t=state.financeTransactions.find(x=>x.id===id)||{transaction_type:'expense',currency:'TRY',transaction_date:today(),status:'completed'};const accountOptions=state.financeAccounts.filter(a=>a.is_active!==false).map(a=>`<option value="${a.id}" ${a.id===t.account_id?'selected':''}>${esc(a.name)} · ${esc(a.currency||'TRY')}</option>`).join('');openModal(`<h2>${id?'Hareket Düzenle':'Finans Hareketi Ekle'}</h2><label>Hesap</label><select id="ft_account_id">${accountOptions}</select><div class="split"><div><label>Tip</label><select id="ft_transaction_type" onchange="document.getElementById('ft_title').innerHTML=financeTransactionCategoryOptions(this.value)">${financeTransactionTypeOptions(t.transaction_type)}</select></div><div><label>Kategori / Başlık</label><select id="ft_title">${financeTransactionCategoryOptions(t.transaction_type,t.title)}</select></div></div><div class="split"><div><label>Tutar</label><input id="ft_amount" type="number" min="0" step="0.01" value="${t.amount||''}"></div><div><label>Para Birimi</label><input id="ft_currency" value="${esc(t.currency||'TRY')}"></div></div><div class="split"><div><label>Tarih</label><input id="ft_transaction_date" type="date" value="${t.transaction_date||today()}"></div><div><label>Durum</label><select id="ft_status"><option value="completed" ${t.status==='completed'?'selected':''}>Gerçekleşti</option><option value="planned" ${t.status==='planned'?'selected':''}>Planlandı</option><option value="pending" ${t.status==='pending'?'selected':''}>Bekliyor</option><option value="cancelled" ${t.status==='cancelled'?'selected':''}>İptal</option></select></div></div><input id="ft_payment_method" placeholder="Ödeme yöntemi / kısa açıklama" value="${esc(t.payment_method)}"><textarea id="ft_notes" placeholder="Not">${esc(t.notes)}</textarea><button onclick="saveFinanceTransaction('${id}')">Kaydet</button>`)}
async function saveFinanceTransaction(id=''){const row={user_id:user.id,account_id:$('ft_account_id').value,transaction_type:$('ft_transaction_type').value,title:$('ft_title').value,amount:Number($('ft_amount').value)||0,currency:($('ft_currency').value||'TRY').trim().toUpperCase(),transaction_date:$('ft_transaction_date').value,status:$('ft_status').value,payment_method:$('ft_payment_method').value.trim()||null,notes:$('ft_notes').value.trim()||null};if(!row.account_id)return toast('Hesap seçimi gerekli.');if(!['income','expense'].includes(row.transaction_type))return toast('Bu sprintte sadece gelir/gider destekleniyor.');if(!row.title)return toast('Kategori gerekli.');if(row.amount<=0)return toast('Tutar 0’dan büyük olmalı.');if(!/^[A-Z0-9]{3,5}$/.test(row.currency))return toast('Para birimi 3-5 karakter olmalı. Örn: TRY, USD, EUR');if(!row.transaction_date)return toast('Tarih gerekli.');const acc=financeAccountById(row.account_id);if(acc&&row.currency!==(acc.currency||'TRY').toUpperCase())return toast('Hareket para birimi, seçilen hesabın para birimiyle aynı olmalı.');const q=id?sb.from('finance_transactions').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_transactions').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();toast('Finans hareketi kaydedildi.');await load();page('finance')}
async function deleteFinanceTransaction(id){if(!confirm('Bu finans hareketi silinsin mi?'))return;const {error}=await sb.from('finance_transactions').delete().eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Finans hareketi silindi.');await load();page('finance')}
function financeTransferForm(id=''){const active=state.financeAccounts.filter(a=>a.is_active!==false);if(active.length<2)return toast('Transfer için en az iki aktif hesap gerekli.');const defaultFromAccountId=active[0]?.id,defaultToAccountId=active[1]?.id;const t=state.financeTransfers.find(x=>x.id===id)||{from_account_id:defaultFromAccountId,to_account_id:defaultToAccountId,currency:active[0]?.currency||'TRY',transfer_date:today(),fee_amount:0};const opts=active.map(a=>`<option value="${a.id}">${esc(a.name)} · ${esc(a.currency||'TRY')}</option>`).join('');openModal(`<h2>${id?'Transfer Düzenle':'Transfer Ekle'}</h2><div class="split"><div><label>Kaynak Hesap</label><select id="fr_from_account_id">${opts}</select></div><div><label>Hedef Hesap</label><select id="fr_to_account_id">${opts}</select></div></div><div class="split"><div><label>Tutar</label><input id="fr_amount" type="number" min="0" step="0.01" value="${t.amount||''}"></div><div><label>Para Birimi</label><input id="fr_currency" value="${esc(t.currency||'TRY')}"></div></div><div class="split"><div><label>Transfer Tarihi</label><input id="fr_transfer_date" type="date" value="${t.transfer_date||today()}"></div><div><label>Komisyon / Ücret</label><input id="fr_fee_amount" type="number" min="0" step="0.01" value="${t.fee_amount||0}"></div></div><textarea id="fr_notes" placeholder="Not">${esc(t.notes)}</textarea><button onclick="saveFinanceTransfer('${id}')">Kaydet</button>`);if(t.from_account_id)$('fr_from_account_id').value=t.from_account_id;if(t.to_account_id)$('fr_to_account_id').value=t.to_account_id}
async function saveFinanceTransfer(id=''){const row={user_id:user.id,from_account_id:$('fr_from_account_id').value,to_account_id:$('fr_to_account_id').value,amount:Number($('fr_amount').value)||0,currency:($('fr_currency').value||'TRY').trim().toUpperCase(),transfer_date:$('fr_transfer_date').value,fee_amount:Number($('fr_fee_amount').value)||0,notes:$('fr_notes').value.trim()||null};if(!row.from_account_id||!row.to_account_id)return toast('Kaynak ve hedef hesap gerekli.');if(row.from_account_id===row.to_account_id)return toast('Kaynak ve hedef hesap aynı olamaz.');if(row.amount<=0)return toast('Transfer tutarı 0’dan büyük olmalı.');if(row.fee_amount<0)return toast('Komisyon negatif olamaz.');if(!/^[A-Z0-9]{3,5}$/.test(row.currency))return toast('Para birimi 3-5 karakter olmalı.');if(!row.transfer_date)return toast('Transfer tarihi gerekli.');const from=financeAccountById(row.from_account_id),to=financeAccountById(row.to_account_id);if(from&&to&&(from.currency||'TRY').toUpperCase()!==(to.currency||'TRY').toUpperCase())return toast('Bu sprintte farklı para birimleri arasında transfer desteklenmiyor.');if(from&&row.currency!==(from.currency||'TRY').toUpperCase())return toast('Transfer para birimi, kaynak hesabın para birimiyle aynı olmalı.');const q=id?sb.from('finance_transfers').update(row).eq('id',id).eq('user_id',user.id):sb.from('finance_transfers').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();toast('Transfer kaydedildi.');await load();page('finance')}
async function deleteFinanceTransfer(id){if(!confirm('Bu transfer silinsin mi?'))return;const {error}=await sb.from('finance_transfers').delete().eq('id',id).eq('user_id',user.id);if(error)return toast(error.message);toast('Transfer silindi.');await load();page('finance')}
function financeTransfersList(){return `<div class="finance-transaction-list">${state.financeTransfers.map(financeTransferCard).join('')||'<div class="empty">Henüz transfer yok.</div>'}</div>`}
function financeTransferCard(t){return `<article class="finance-transaction-card transfer"><div><time>${esc(t.transfer_date||'')}</time><b>↔ ${esc(financeAccountName(t.from_account_id))} → ${esc(financeAccountName(t.to_account_id))}</b><small>${esc(t.notes||'')}</small></div><div><span>Komisyon: ${financeFmt(t.fee_amount||0,t.currency||'TRY')}</span></div><strong>${financeFmt(t.amount,t.currency||'TRY')}</strong><div class="table-actions"><button class="small secondary" onclick="financeTransferForm('${t.id}')">Düzenle</button><button class="small danger" onclick="deleteFinanceTransfer('${t.id}')">Sil</button></div></article>`}
function definitions(){const labels={home_expense:'Ev Gider Kategorileri',car_expense:'Araç Gider Kategorileri',income:'Gelir Tipleri',status:'Ödeme Durumları',doc_type:'Belge Tipleri'};$('content').innerHTML=`<div class="defgrid">${Object.keys(labels).map(type=>`<div class="card"><div class="row"><h2 style="flex:1">${labels[type]}</h2><button onclick="defForm('${type}')">Ekle</button></div>${defs(type,false).map(d=>`<div class="pill ${d.active?'':'inactive'}"><span>${esc(d.name)} ${d.active?'':'(pasif)'}</span><span><button class="small secondary" onclick="defForm('${type}','${d.id}')">Düzenle</button> <button class="small secondary" onclick="toggleDef('${d.id}',${!d.active})">${d.active?'Pasife Al':'Aktif Et'}</button> <button class="small danger" onclick="deleteDef('${d.id}')">Sil</button></span></div>`).join('')}</div>`).join('')}</div>`}
function documents(){const docs=state.documents;$('content').innerHTML=`<div class="card"><div class="row"><h2 style="flex:1">Belge Merkezi</h2><button class="secondary" onclick="quickDoc()">Belge Yükle</button></div><p class="muted">Tüm ev ve araç belgeleri tek ekranda.</p>${docs.map(d=>docRow(d)).join('')||'<div class="empty">Henüz belge yok.</div>'}</div>`}
function docRow(d){const asset=d.home_id?state.homes.find(h=>h.id===d.home_id):state.cars.find(c=>c.id===d.car_id);const e=state.entries.find(x=>x.id===d.entry_id);return `<div class="doc"><div><b>${esc(d.doc_type||'Belge')}</b><br><span>${esc(asset?.name||'Varlık yok')}</span><br><span class="muted">${esc(d.file_name)}${e?' — '+esc(entryLabel(e)):' — Genel belge'}</span></div><div><button class="small secondary" onclick="openDoc('${d.file_path}')">Aç</button> <button class="small danger" onclick="deleteDoc('${d.id}','${d.file_path}')">Sil</button></div></div>`}
function backup(){$('content').innerHTML=`<div class="card"><h2>Yedek</h2><p class="muted">Tüm verilerini JSON olarak indir.</p><button onclick="exportData()">Yedek İndir</button></div>`}
function homeForm(id){const h=state.homes.find(x=>x.id===id)||{};openModal(`<h2>${id?'Ev Düzenle':'Ev Ekle'}</h2><input id="f_name" placeholder="Ev adı" value="${esc(h.name)}"><select id="f_kind"><option ${h.kind==='Kiradaki Ev'?'selected':''}>Kiradaki Ev</option><option ${h.kind==='Oturulan Ev'?'selected':''}>Oturulan Ev</option></select><textarea id="f_address" placeholder="Adres / not">${esc(h.address)}</textarea><div class="split"><div><input id="f_purchase_price" type="number" placeholder="Alış fiyatı" value="${h.purchase_price||''}"></div><div><input id="f_current_value" type="number" placeholder="Güncel değer" value="${h.current_value||''}"></div></div><input id="f_purchase_date" type="date" value="${h.purchase_date||''}"><h3>Kiracı Bilgileri</h3><input id="f_tenant_name" placeholder="Kiracı adı" value="${esc(h.tenant_name)}"><input id="f_tenant_phone" placeholder="Kiracı telefon" value="${esc(h.tenant_phone)}"><div class="split"><input id="f_rent_amount" type="number" placeholder="Kira tutarı" value="${h.rent_amount||''}"><input id="f_rent_increase_month" placeholder="Kira artış ayı" value="${esc(h.rent_increase_month)}"></div><button onclick="saveHome('${id||''}')">Kaydet</button>`)}
async function saveHome(id){const row={user_id:user.id,name:$('f_name').value,kind:$('f_kind').value,address:$('f_address').value,purchase_price:$('f_purchase_price').value||0,current_value:$('f_current_value').value||0,purchase_date:$('f_purchase_date').value||null,tenant_name:$('f_tenant_name').value,tenant_phone:$('f_tenant_phone').value,rent_amount:$('f_rent_amount').value||0,rent_increase_month:$('f_rent_increase_month').value};const q=id?sb.from('homes').update(row).eq('id',id):sb.from('homes').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();await load()}
function carForm(id){const c=state.cars.find(x=>x.id===id)||{};openModal(`<h2>${id?'Araç Düzenle':'Araç Ekle'}</h2><input id="f_name" placeholder="Araç adı" value="${esc(c.name)}"><input id="f_plate" placeholder="Plaka" value="${esc(c.plate)}"><textarea id="f_note" placeholder="Not">${esc(c.note)}</textarea><div class="split"><input id="f_purchase_price" type="number" placeholder="Alış fiyatı" value="${c.purchase_price||''}"><input id="f_current_value" type="number" placeholder="Güncel değer" value="${c.current_value||''}"></div><div class="split"><input id="f_purchase_date" type="date" value="${c.purchase_date||''}"><input id="f_km" type="number" placeholder="Güncel km" value="${c.km||''}"></div><button onclick="saveCar('${id||''}')">Kaydet</button>`)}
async function saveCar(id){const row={user_id:user.id,name:$('f_name').value,plate:$('f_plate').value,note:$('f_note').value,purchase_price:$('f_purchase_price').value||0,current_value:$('f_current_value').value||0,purchase_date:$('f_purchase_date').value||null,km:$('f_km').value||0};const q=id?sb.from('cars').update(row).eq('id',id):sb.from('cars').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();await load()}
function entryForm(kind,assetId,type,id){const e=state.entries.find(x=>x.id===id)||{};const catType=type==='income'?'income':(kind==='home'?'home_expense':'car_expense');openModal(`<h2>${id?'Kayıt Düzenle':'Kayıt Ekle'}</h2><label>Kategori</label><select id="f_category">${optionHtml(catType,e.category)}</select><label>Tutar</label><input id="f_amount" type="number" value="${e.amount||''}"><label>Tarih</label><input id="f_date" type="date" value="${e.date||today()}"><label>Tekrar</label><select id="f_repeat"><option>Tek seferlik</option><option>Aylık</option><option>6 aylık</option><option>Yıllık</option></select><label>Durum</label><select id="f_status">${optionHtml('status',e.status)}</select><textarea id="f_note" placeholder="Açıklama">${esc(e.note)}</textarea><button onclick="saveEntry('${kind}','${assetId}','${type}','${id||''}')">Kaydet</button>`);$('f_repeat').value=e.repeat_type||'Tek seferlik'}
async function saveEntry(kind,assetId,type,id){const row={user_id:user.id,type,category:$('f_category').value||'Diğer',amount:$('f_amount').value||0,date:$('f_date').value,repeat_type:$('f_repeat').value,status:$('f_status').value,note:$('f_note').value,home_id:kind==='home'?assetId:null,car_id:kind==='car'?assetId:null};const q=id?sb.from('entries').update(row).eq('id',id):sb.from('entries').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();await load()}
function defForm(type,id){const d=state.definitions.find(x=>x.id===id)||{};openModal(`<h2>Tanım ${id?'Düzenle':'Ekle'}</h2><input id="f_name" placeholder="Ad" value="${esc(d.name)}"><input id="f_sort" type="number" placeholder="Sıra" value="${d.sort_order??0}"><button onclick="saveDef('${type}','${id||''}')">Kaydet</button>`)}
async function saveDef(type,id){const row={user_id:user.id,type,name:$('f_name').value,sort_order:Number($('f_sort').value)||0,active:true};const q=id?sb.from('definitions').update(row).eq('id',id):sb.from('definitions').insert(row);const {error}=await q;if(error)return toast(error.message);closeModal();await load()}
async function toggleDef(id,active){await sb.from('definitions').update({active}).eq('id',id);await load()}
async function deleteDef(id){const d=state.definitions.find(x=>x.id===id);const used=state.entries.some(e=>e.category===d?.name||e.status===d?.name)||state.documents.some(x=>x.doc_type===d?.name);if(used){toast('Bu tanım geçmiş kayıtlarda kullanılıyor. Pasife alındı.');await toggleDef(id,false);return}if(confirm('Tanım tamamen silinsin mi?')){await sb.from('definitions').delete().eq('id',id);await load()}}
function showDocs(kind,id,entryId=''){
  const asset=(kind==='home'?state.homes:state.cars).find(x=>x.id===id);
  const entries=state.entries.filter(e=>kind==='home'?e.home_id===id:e.car_id===id);
  const currentEntry=state.entries.find(e=>e.id===entryId);
  const docs=state.documents.filter(d=>(kind==='home'?d.home_id===id:d.car_id===id) && (!entryId || d.entry_id===entryId));
  const entryOptions=`<option value="">Genel belge / kayıt bağlantısı yok</option>`+entries.map(e=>`<option value="${e.id}" ${e.id===entryId?'selected':''}>${esc(entryLabel(e))}</option>`).join('');
  openModal(`<h2>Belgeler</h2><p class="muted">${esc(asset?.name||'Varlık')} ${currentEntry?`→ ${esc(entryLabel(currentEntry))}`:''}</p><div class="card"><label>Belge Tipi</label><select id="doc_type">${optionHtml('doc_type')}</select><label>İlgili Kayıt</label><select id="doc_entry_id">${entryOptions}</select><input id="doc_file" type="file"><button onclick="uploadDoc('${kind}','${id}')">Yükle</button><p class="muted">Belgeyi genel olarak ev/araca bağlayabilir veya belirli bir gelir/gider kaydıyla ilişkilendirebilirsin.</p></div>${docs.map(d=>{const e=state.entries.find(x=>x.id===d.entry_id);return `<div class="doc"><div><b>${esc(d.doc_type)}</b><br><span class="muted">${esc(d.file_name)}</span><br><span class="muted">${e?'Bağlı kayıt: '+esc(entryLabel(e)):'Genel belge'}</span></div><div><button class="small secondary" onclick="openDoc('${d.file_path}')">Aç</button> <button class="small danger" onclick="deleteDoc('${d.id}','${d.file_path}')">Sil</button></div></div>`}).join('')||'<p class="muted">Belge yok.</p>'}`)
}
function safeFileName(name){
  const parts=name.split('.');
  const ext=parts.length>1?'.'+parts.pop().toLowerCase().replace(/[^a-z0-9]/g,''):'';
  const base=parts.join('.')||'belge';
  return base
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/ı/g,'i').replace(/İ/g,'I')
    .replace(/ğ/g,'g').replace(/Ğ/g,'G')
    .replace(/ü/g,'u').replace(/Ü/g,'U')
    .replace(/ş/g,'s').replace(/Ş/g,'S')
    .replace(/ö/g,'o').replace(/Ö/g,'O')
    .replace(/ç/g,'c').replace(/Ç/g,'C')
    .replace(/[^a-zA-Z0-9-_]/g,'-')
    .replace(/-+/g,'-')
    .replace(/^-|-$/g,'')
    .slice(0,80)+ext;
}
async function uploadDoc(kind,id){
  const f=$('doc_file').files[0];
  if(!f)return toast('Dosya seç.');
  const clean=safeFileName(f.name);
  const path=`${user.id}/${kind}/${id}/${Date.now()}-${clean}`;
  const up=await sb.storage.from('asset-documents').upload(path,f,{upsert:false,contentType:f.type||'application/octet-stream'});
  if(up.error)return toast(up.error.message);
  const entryId=$('doc_entry_id')?.value||null;
  const row={user_id:user.id,home_id:kind==='home'?id:null,car_id:kind==='car'?id:null,entry_id:entryId,doc_type:$('doc_type').value,file_name:f.name,file_path:path};
  const {error}=await sb.from('documents').insert(row);
  if(error){await sb.storage.from('asset-documents').remove([path]);return toast(error.message)}
  await load();showDocs(kind,id,entryId||'')
}
async function openDoc(path){const {data,error}=await sb.storage.from('asset-documents').createSignedUrl(path,120);if(error)return toast(error.message);window.open(data.signedUrl,'_blank')}
async function deleteDoc(id,path){if(!confirm('Belge silinsin mi?'))return;await sb.storage.from('asset-documents').remove([path]);await sb.from('documents').delete().eq('id',id);await load();closeModal()}
function entryCard(e,withActions=false){const asset=e.home_id?state.homes.find(h=>h.id===e.home_id)?.name:state.cars.find(c=>c.id===e.car_id)?.name;const dc=entryDocs(e.id).length;return `<div class="item"><div class="row"><b style="flex:1">${esc(asset||'Kayıt')} / ${esc(e.category||'Diğer')} ${dc?`📎 ${dc}`:''}</b><span class="badge ${statusClass(e.status)}">${esc(e.status)}</span></div><div>${fmt(e.amount)} - ${esc(e.date)} - ${esc(e.repeat_type||'')}</div><p class="muted">${esc(e.note||'')}</p>${withActions?`<div class="row"><button class="small secondary" onclick="entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')">Düzenle</button><button class="small secondary" onclick="showDocs('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.id}')">Belge</button><button class="small danger" onclick="delEntry('${e.id}')">Sil</button></div>`:''}</div>`}
async function delEntry(id){if(confirm('Kayıt silinsin mi?')){await sb.from('entries').delete().eq('id',id);await load();closeModal()}}
async function delAsset(table,id){if(confirm('Bu varlık silinsin mi? İlgili gelir/gider kayıtları silinmez.')){await sb.from(table).delete().eq('id',id);await load()}}
function getUpcoming(days=30){const now=new Date(today());const max=new Date(now);max.setDate(max.getDate()+days);return state.entries.filter(e=>!['Ödendi','Alındı','İptal'].includes(e.status)&&new Date(e.date)>=now&&new Date(e.date)<=max).sort((a,b)=>a.date.localeCompare(b.date))}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='momentum-asset-v5-yedek.json';a.click()}
function quickAction(){openModal(`<div class="quick-modal-head v521-modal-head"><div><span class="eyebrow">Momentum Hub</span><h2>Quick Capture</h2><p class="muted">En sık kullanılan işlemleri tek ekrandan başlat.</p></div></div><div class="quickgrid quickgrid-v521"><button class="quicktile primary" onclick="quickEntry('income')"><i>💰</i><b>Gelir Ekle</b><span>Kira / diğer gelir</span></button><button class="quicktile primary" onclick="quickEntry('expense')"><i>💸</i><b>Gider Ekle</b><span>Ev veya araç gideri</span></button><button class="quicktile" onclick="quickDoc()"><i>📎</i><b>Belge Yükle</b><span>Belgeyi kayıtla bağla</span></button><button class="quicktile" onclick="showOverdueRecords()"><i>⚠️</i><b>Gecikenleri Gör</b><span>Durumları hızlı güncelle</span></button><button class="quicktile" onclick="homeForm()"><i>🏠</i><b>Yeni Ev</b><span>Gayrimenkul ekle</span></button><button class="quicktile" onclick="carForm()"><i>🚗</i><b>Yeni Araç</b><span>Araç ekle</span></button><button class="quicktile" onclick="page('notifications');closeModal()"><i>🔔</i><b>Bildirimler</b><span>Önemli uyarılar</span></button><button class="quicktile" onclick="page('calendar');closeModal()"><i>📅</i><b>Takvim</b><span>Yaklaşan işleri gör</span></button><button class="quicktile" onclick="page('reports');closeModal()"><i>📊</i><b>Raporlar</b><span>Finans özetini aç</span></button></div>`)}
function quickEntry(type){const opts=[...state.homes.map(h=>`<option value="home:${h.id}">Ev: ${esc(h.name)}</option>`),...state.cars.map(c=>`<option value="car:${c.id}">Araç: ${esc(c.name)}</option>`)].join('');if(!opts)return toast('Önce ev veya araç ekle.');openModal(`<h2>${type==='income'?'Gelir':'Gider'} için varlık seç</h2><select id="quick_asset">${opts}</select><button onclick="const v=$('quick_asset').value.split(':'); entryForm(v[0],v[1],'${type}')">Devam</button>`)}
function quickDoc(){const opts=[...state.homes.map(h=>`<option value="home:${h.id}">Ev: ${esc(h.name)}</option>`),...state.cars.map(c=>`<option value="car:${c.id}">Araç: ${esc(c.name)}</option>`)].join('');if(!opts)return toast('Önce ev veya araç ekle.');openModal(`<h2>Belge için varlık seç</h2><select id="quick_asset">${opts}</select><button onclick="const v=$('quick_asset').value.split(':'); showDocs(v[0],v[1])">Devam</button>`)}
function doSearch(q){q=(q||'').toLowerCase().trim();if(!q)return page(currentPage);const rows=[];state.homes.forEach(h=>{if(JSON.stringify(h).toLowerCase().includes(q))rows.push(`<div class="item"><b>🏠 ${esc(h.name)}</b><p class="muted">${esc(h.address||'')}</p><button class="small secondary" onclick="page('homes')">Gayrimenkullere git</button></div>`)});state.cars.forEach(c=>{if(JSON.stringify(c).toLowerCase().includes(q))rows.push(`<div class="item"><b>🚗 ${esc(c.name)}</b><p class="muted">${esc(c.plate||'')}</p><button class="small secondary" onclick="page('cars')">Araçlara git</button></div>`)});state.entries.forEach(e=>{if(JSON.stringify(e).toLowerCase().includes(q))rows.push(entryCard(e,true))});state.documents.forEach(d=>{if(JSON.stringify(d).toLowerCase().includes(q))rows.push(docRow(d))});$('title').textContent='Arama';$('content').innerHTML=`<div class="card"><h2>Arama Sonuçları</h2><p class="muted">${esc(q)} için ${rows.length} sonuç</p><div class="searchResult">${rows.join('')||'<div class="empty">Sonuç bulunamadı.</div>'}</div></div>`}
function applyTheme(){document.body.classList.toggle('light',theme==='light')}
function toggleTheme(){theme=theme==='light'?'dark':'light';localStorage.setItem('ma_theme',theme);applyTheme()}
$('login').onclick=async()=>{const r=await sb.auth.signInWithPassword({email:$('email').value,password:$('pass').value});if(r.error)toast(r.error.message);else{user=r.data.user;await load();renderAuth()}};
$('signup').onclick=async()=>{const r=await sb.auth.signUp({email:$('email').value,password:$('pass').value});if(r.error)toast(r.error.message);else toast('Kayıt oluşturuldu. Mail onayı gerekiyorsa gelen kutunu kontrol et.')};
$('logout').onclick=async()=>{await sb.auth.signOut();user=null;renderAuth()};
document.querySelectorAll('.nav[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));$('menu').onclick=()=>$('side').classList.toggle('open');
$('quick').onclick=quickAction;$('fab').onclick=quickAction;$('themeBtn').onclick=toggleTheme;applyTheme();
let searchTimer=null;$('globalSearch').addEventListener('input',e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>doSearch(e.target.value),250)});
init();


/* V6.0 Sprint B - Assets, Documents and Search */
function assetStats(kind,a){
  const ent=state.entries.filter(e=>kind==='home'?e.home_id===a.id:e.car_id===a.id);
  const inc=sum(ent,'income'), ex=sum(ent,'expense');
  const open=ent.filter(e=>!isClosedStatus(e.status)).length;
  const docs=(kind==='home'?state.documents.filter(d=>d.home_id===a.id):state.documents.filter(d=>d.car_id===a.id)).length;
  const overdue=ent.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<new Date(today())).length;
  return {ent,inc,ex,open,docs,overdue,net:inc-ex};
}
function assetPageHeader(kind){
  const title=kind==='home'?'Gayrimenkuller':'Araçlar';
  const addFn=kind==='home'?'homeForm()':'carForm()';
  const count=kind==='home'?state.homes.length:state.cars.length;
  const total=(kind==='home'?state.homes:state.cars).reduce((s,a)=>s+Number(a.current_value||0),0);
  return `<div class="asset-v6-head card"><div><span class="eyebrow">Momentum Asset</span><h2>${title}</h2><p class="muted">${count} kayıt · Toplam değer ${fmt(total)}</p></div><div class="asset-head-actions"><button class="secondary" onclick="quickAction()">Quick Capture</button><button onclick="${addFn}">${kind==='home'?'Ev Ekle':'Araç Ekle'}</button></div></div>`;
}
function homes(){
  $('content').innerHTML=`${assetPageHeader('home')}<div class="asset-toolbar"><input id="assetFilter" placeholder="Ev ara: ad, adres, kiracı..." oninput="filterAssetCards(this.value)"><button class="secondary" onclick="quickEntry('income')">Gelir Ekle</button><button class="secondary" onclick="quickEntry('expense')">Gider Ekle</button></div><div id="assetCards" class="asset-grid-v6">${state.homes.map(h=>assetCard('home',h)).join('')||'<div class="card muted">Ev ekleyerek başlayın.</div>'}</div>`;
}
function cars(){
  $('content').innerHTML=`${assetPageHeader('car')}<div class="asset-toolbar"><input id="assetFilter" placeholder="Araç ara: ad, plaka, not..." oninput="filterAssetCards(this.value)"><button class="secondary" onclick="quickEntry('expense')">Gider Ekle</button><button class="secondary" onclick="quickDoc()">Belge Yükle</button></div><div id="assetCards" class="asset-grid-v6">${state.cars.map(c=>assetCard('car',c)).join('')||'<div class="card muted">Araç ekleyerek başlayın.</div>'}</div>`;
}
function filterAssetCards(q){
  q=(q||'').toLowerCase();
  document.querySelectorAll('.asset-card-v6').forEach(c=>c.style.display=c.dataset.search.includes(q)?'':'none');
}
function assetCard(kind,a){
  const st=assetStats(kind,a);
  const subtitle=kind==='home' ? `${esc(a.kind||'Ev')} · ${esc(a.tenant_name||'Kiracı yok')}` : `${esc(a.plate||'Plaka yok')} · ${a.km?Number(a.km).toLocaleString('tr-TR')+' km':'Km yok'}`;
  const search=JSON.stringify(a).toLowerCase();
  return `<article class="asset-card-v6" data-search="${esc(search)}">
    <div class="asset-card-top"><div><span class="asset-icon">${kind==='home'?'🏠':'🚗'}</span><h3>${esc(a.name)}</h3><p>${subtitle}</p></div><span class="badge ${st.overdue?'bad':'ok'}">${st.overdue?st.overdue+' geciken':'Aktif'}</span></div>
    <div class="asset-metrics-v6"><div><span>Değer</span><b>${fmt(a.current_value)}</b></div><div><span>Gelir</span><b class="pos">${fmt(st.inc)}</b></div><div><span>Gider</span><b class="neg">${fmt(st.ex)}</b></div><div><span>Belge</span><b>${st.docs}</b></div></div>
    <div class="asset-actions-v6">
      <button onclick="showAssetDetail('${kind}','${a.id}','overview')">Detay</button>
      ${kind==='home'?`<button class="secondary" onclick="entryForm('home','${a.id}','income')">Gelir</button>`:''}
      <button class="secondary" onclick="entryForm('${kind}','${a.id}','expense')">Gider</button>
      <button class="secondary" onclick="showDocs('${kind}','${a.id}')">Belge</button>
      <button class="secondary" onclick="${kind}Form('${a.id}')">Düzenle</button>
    </div>
  </article>`;
}
function showAssetEntries(kind,id){showAssetDetail(kind,id,'entries')}
function assetTabs(kind,id,tab){
  return `<div class="tabs-v6"><button class="${tab==='overview'?'active':''}" onclick="showAssetDetail('${kind}','${id}','overview')">Özet</button><button class="${tab==='entries'?'active':''}" onclick="showAssetDetail('${kind}','${id}','entries')">Gelir / Gider</button><button class="${tab==='docs'?'active':''}" onclick="showAssetDetail('${kind}','${id}','docs')">Belgeler</button><button class="${tab==='timeline'?'active':''}" onclick="showAssetDetail('${kind}','${id}','timeline')">Zaman Çizelgesi</button></div>`
}
function showAssetDetail(kind,id,tab='overview'){
  const list=kind==='home'?state.homes:state.cars;
  const a=list.find(x=>x.id===id); if(!a)return toast('Varlık bulunamadı.');
  currentPage=kind==='home'?'homes':'cars';
  document.querySelectorAll('.nav[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));
  $('title').textContent=kind==='home'?'Ev Detayı':'Araç Detayı';
  const st=assetStats(kind,a);
  const docs=kind==='home'?state.documents.filter(d=>d.home_id===id):state.documents.filter(d=>d.car_id===id);
  let body='';
  if(tab==='overview') body=assetOverview(kind,a,st,docs);
  if(tab==='entries') body=`<div class="detail-grid"><div class="card"><div class="row"><h2 style="flex:1">Gelirler</h2>${kind==='home'?`<button onclick="entryForm('home','${id}','income')">Gelir Ekle</button>`:''}</div>${entryTable(st.ent.filter(e=>e.type==='income'))}</div><div class="card"><div class="row"><h2 style="flex:1">Giderler</h2><button onclick="entryForm('${kind}','${id}','expense')">Gider Ekle</button></div>${entryTable(st.ent.filter(e=>e.type==='expense'))}</div></div>`;
  if(tab==='docs') body=`<div class="card"><div class="row"><h2 style="flex:1">Belgeler</h2><button onclick="showDocs('${kind}','${id}')">Belge Yükle</button></div>${docs.map(d=>docRow(d)).join('')||'<div class="empty">Bu varlığa bağlı belge yok.</div>'}</div>`;
  if(tab==='timeline') body=assetTimeline(st.ent,docs);
  $('content').innerHTML=`<div class="asset-detail-head card"><button class="secondary" onclick="page('${kind==='home'?'homes':'cars'}')">← Geri</button><div><span class="eyebrow">${kind==='home'?'Gayrimenkul':'Araç'} Detayı</span><h2>${esc(a.name)}</h2><p class="muted">${kind==='home'?esc(a.address||a.kind||''):esc((a.plate||'')+' '+(a.note||''))}</p></div><button class="secondary" onclick="${kind}Form('${id}')">Düzenle</button></div>${assetTabs(kind,id,tab)}${body}`;
}
function assetOverview(kind,a,st,docs){
  return `<div class="detail-grid"><div class="card"><h2>Finans Özeti</h2><div class="asset-metrics-v6 wide"><div><span>Güncel Değer</span><b>${fmt(a.current_value)}</b></div><div><span>Net</span><b class="${st.net>=0?'pos':'neg'}">${fmt(st.net)}</b></div><div><span>Açık Kayıt</span><b>${st.open}</b></div><div><span>Belge</span><b>${docs.length}</b></div></div></div><div class="card"><h2>${kind==='home'?'Kiracı / Ev Bilgisi':'Araç Bilgisi'}</h2>${kind==='home'?`<p><b>Tip:</b> ${esc(a.kind||'-')}</p><p><b>Kiracı:</b> ${esc(a.tenant_name||'-')}</p><p><b>Telefon:</b> ${esc(a.tenant_phone||'-')}</p><p><b>Kira:</b> ${fmt(a.rent_amount)}</p>`:`<p><b>Plaka:</b> ${esc(a.plate||'-')}</p><p><b>Km:</b> ${a.km?Number(a.km).toLocaleString('tr-TR'):'-'}</p><p><b>Alış:</b> ${fmt(a.purchase_price)}</p><p><b>Güncel:</b> ${fmt(a.current_value)}</p>`}</div></div><div class="card"><h2>Son Kayıtlar</h2>${st.ent.slice(0,8).map(e=>entryCard(e,true)).join('')||'<div class="empty">Henüz gelir/gider yok.</div>'}</div>`;
}
function assetTimeline(entries,docs){
  const events=[...entries.map(e=>({date:e.date,html:`${e.type==='income'?'💰':'💸'} <b>${esc(e.category||'Kayıt')}</b><span>${fmt(e.amount)} · ${esc(e.status||'')}</span>`})),...docs.map(d=>({date:(d.created_at||today()).slice(0,10),html:`📄 <b>${esc(d.doc_type||'Belge')}</b><span>${esc(d.file_name||'')}</span>`}))].sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="card"><h2>Zaman Çizelgesi</h2><div class="timeline-v6">${events.map(ev=>`<div><time>${esc(ev.date)}</time><p>${ev.html}</p></div>`).join('')||'<div class="empty">Zaman çizelgesi boş.</div>'}</div></div>`;
}
function entryTable(list){
  return list.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Tarih</th><th>Kategori</th><th>Tutar</th><th>Durum</th><th>Belge</th><th>Açıklama</th><th>İşlem</th></tr></thead><tbody>${list.map(e=>{const dc=entryDocs(e.id).length;const done=isClosedStatus(e.status);return `<tr><td data-label="Tarih">${esc(e.date)}</td><td data-label="Kategori">${esc(e.category||'Diğer')}</td><td data-label="Tutar">${fmt(e.amount)}</td><td data-label="Durum"><span class="badge ${statusClass(e.status)}">${esc(e.status)}</span></td><td data-label="Belge">${dc?`📎 ${dc}`:'-'}</td><td data-label="Açıklama">${esc(e.note||'')}</td><td data-label="İşlem"><div class="table-actions">${!done?`<button class="small success" onclick="markEntryDone('${e.id}')">${e.type==='income'?'Alındı Yap':'Ödendi Yap'}</button>`:''}<button class="small secondary" onclick="entryForm('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.type}','${e.id}')">Düzenle</button><button class="small secondary" onclick="duplicateEntry('${e.id}')">Kopyala</button><button class="small secondary" onclick="showDocs('${e.home_id?'home':'car'}','${e.home_id||e.car_id}','${e.id}')">Belge</button><button class="small danger" onclick="delEntry('${e.id}')">Sil</button></div></td></tr>`}).join('')}</tbody></table></div>`:'<p class="muted">Kayıt yok.</p>';
}
async function duplicateEntry(id){
  const e=state.entries.find(x=>x.id===id); if(!e)return toast('Kayıt bulunamadı.');
  const row={user_id:user.id,home_id:e.home_id,car_id:e.car_id,type:e.type,category:e.category,amount:e.amount,date:today(),repeat_type:e.repeat_type,status:'Bekleniyor',note:(e.note?e.note+' · ':'')+'Kopya kayıt'};
  const {error}=await sb.from('entries').insert(row); if(error)return toast(error.message); toast('Kayıt kopyalandı.'); await load();
}
function documents(){
  const docs=state.documents;
  const pdf=docs.filter(d=>(d.file_name||'').toLowerCase().endsWith('.pdf')).length;
  $('content').innerHTML=`<div class="docs-v6-head card"><div><span class="eyebrow">Momentum Documents</span><h2>Belge Merkezi</h2><p class="muted">${docs.length} belge · ${pdf} PDF · Kayıt ilişkileri görünür.</p></div><button onclick="quickDoc()">Belge Yükle</button></div><div class="doc-grid-v6">${docs.map(d=>docRow(d)).join('')||'<div class="card empty">Henüz belge yok.</div>'}</div>`;
}
function docRow(d){
  const asset=d.home_id?state.homes.find(h=>h.id===d.home_id):state.cars.find(c=>c.id===d.car_id);
  const e=state.entries.find(x=>x.id===d.entry_id);
  const kind=d.home_id?'home':'car'; const id=d.home_id||d.car_id;
  return `<article class="doc-card-v6"><div><span class="doc-type">${esc(d.doc_type||'Belge')}</span><h3>${esc(d.file_name||'Dosya')}</h3><p>${esc(asset?.name||'Varlık yok')}</p><small>${e?esc(entryLabel(e)):'Genel belge'} · ${esc((d.created_at||'').slice(0,10))}</small></div><div class="doc-actions-v6"><button class="small secondary" onclick="showDocDetail('${d.id}')">Detay</button><button class="small secondary" onclick="openDoc('${d.file_path}')">Aç</button>${id?`<button class="small secondary" onclick="showAssetDetail('${kind}','${id}','docs')">Varlığa Git</button>`:''}<button class="small danger" onclick="deleteDoc('${d.id}','${d.file_path}')">Sil</button></div></article>`;
}
function showDocDetail(id){
  const d=state.documents.find(x=>x.id===id); if(!d)return toast('Belge bulunamadı.');
  const asset=d.home_id?state.homes.find(h=>h.id===d.home_id):state.cars.find(c=>c.id===d.car_id);
  const e=state.entries.find(x=>x.id===d.entry_id);
  openModal(`<div class="doc-detail-v6"><span class="eyebrow">Belge Detayı</span><h2>${esc(d.doc_type||'Belge')}</h2><p class="muted">${esc(d.file_name||'')}</p><div class="asset-metrics-v6 wide"><div><span>Varlık</span><b>${esc(asset?.name||'-')}</b></div><div><span>İlişkili Kayıt</span><b>${e?esc(e.category||'Kayıt'):'Genel'}</b></div><div><span>Tarih</span><b>${esc((d.created_at||'').slice(0,10))}</b></div></div><div class="row"><button onclick="openDoc('${d.file_path}')">Belgeyi Aç</button>${asset?`<button class="secondary" onclick="closeModal();showAssetDetail('${d.home_id?'home':'car'}','${d.home_id||d.car_id}','docs')">Varlığa Git</button>`:''}</div></div>`);
}
function doSearch(q){
  q=(q||'').toLowerCase().trim(); if(!q)return page(currentPage);
  const homes=state.homes.filter(h=>JSON.stringify(h).toLowerCase().includes(q));
  const cars=state.cars.filter(c=>JSON.stringify(c).toLowerCase().includes(q));
  const entries=state.entries.filter(e=>JSON.stringify(e).toLowerCase().includes(q));
  const docs=state.documents.filter(d=>JSON.stringify(d).toLowerCase().includes(q));
  $('title').textContent='Arama';
  $('content').innerHTML=`<div class="search-v6-head card"><div><span class="eyebrow">Global Search</span><h2>Arama Sonuçları</h2><p class="muted">“${esc(q)}” için ${homes.length+cars.length+entries.length+docs.length} sonuç bulundu.</p></div></div><div class="detail-grid"><div class="card"><h2>Varlıklar</h2>${homes.map(h=>`<div class="item"><b>🏠 ${esc(h.name)}</b><p class="muted">${esc(h.address||'')}</p><button class="small secondary" onclick="showAssetDetail('home','${h.id}','overview')">Detay</button></div>`).join('')}${cars.map(c=>`<div class="item"><b>🚗 ${esc(c.name)}</b><p class="muted">${esc(c.plate||'')}</p><button class="small secondary" onclick="showAssetDetail('car','${c.id}','overview')">Detay</button></div>`).join('')||''}</div><div class="card"><h2>Gelir / Gider</h2>${entries.map(e=>entryCard(e,true)).join('')||'<div class="empty">Kayıt yok.</div>'}</div></div><div class="card"><h2>Belgeler</h2>${docs.map(d=>docRow(d)).join('')||'<div class="empty">Belge yok.</div>'}</div>`;
}


/* V6 Sprint C2 - Global Search 2.0 */
var mhSearchFilter='all';
function normalizeSearchText(v){
  return (v??'').toString().toLocaleLowerCase('tr-TR')
    .replaceAll('ı','i').replaceAll('İ','i').replaceAll('ğ','g').replaceAll('ü','u')
    .replaceAll('ş','s').replaceAll('ö','o').replaceAll('ç','c');
}
function searchAssetNameForEntry(e){
  return e.home_id ? (state.homes.find(h=>h.id===e.home_id)?.name||'') : (state.cars.find(c=>c.id===e.car_id)?.name||'');
}
function searchBuildItems(){
  const items=[];
  state.homes.forEach(h=>items.push({group:'homes',type:'home',id:h.id,icon:'🏠',title:h.name||'Ev',meta:h.address||h.kind||'Gayrimenkul',amount:h.current_value,date:h.created_at?.slice(0,10),status:h.tenant_name||'',text:JSON.stringify(h)}));
  state.cars.forEach(c=>items.push({group:'cars',type:'car',id:c.id,icon:'🚗',title:c.name||'Araç',meta:[c.plate,c.note].filter(Boolean).join(' · ')||'Araç',amount:c.current_value,date:c.created_at?.slice(0,10),status:c.km?Number(c.km).toLocaleString('tr-TR')+' km':'',text:JSON.stringify(c)}));
  state.entries.forEach(e=>{
    const asset=searchAssetNameForEntry(e);
    items.push({group:e.type==='income'?'income':'expense',type:'entry',id:e.id,icon:e.type==='income'?'💰':'💸',title:e.category||'Kayıt',meta:asset||'Varlık yok',amount:e.amount,date:e.date,status:e.status||'',entry:e,text:[JSON.stringify(e),asset,entryLabel(e)].join(' ')});
  });
  state.documents.forEach(d=>{
    const asset=d.home_id?state.homes.find(h=>h.id===d.home_id)?.name:state.cars.find(c=>c.id===d.car_id)?.name;
    const e=state.entries.find(x=>x.id===d.entry_id);
    items.push({group:'documents',type:'document',id:d.id,icon:'📄',title:d.doc_type||'Belge',meta:[d.file_name,asset].filter(Boolean).join(' · '),amount:'',date:(d.created_at||'').slice(0,10),status:e?e.category||'İlişkili kayıt':'Genel belge',doc:d,text:[JSON.stringify(d),asset||'',e?entryLabel(e):''].join(' ')});
  });
  return items;
}
function searchMatch(item,q){
  if(!q)return false;
  const hay=normalizeSearchText([item.title,item.meta,item.status,item.date,item.amount,item.text].join(' '));
  return hay.includes(normalizeSearchText(q));
}
function searchSaveRecent(q){
  q=(q||'').trim(); if(q.length<2)return;
  const key='mh_recent_searches';
  const arr=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>normalizeSearchText(x)!==normalizeSearchText(q));
  arr.unshift(q); localStorage.setItem(key,JSON.stringify(arr.slice(0,10)));
}
function searchRecent(){return JSON.parse(localStorage.getItem('mh_recent_searches')||'[]')}
function searchFavs(){return JSON.parse(localStorage.getItem('mh_fav_searches')||'[]')}
function searchToggleFav(q){
  q=(q||'').trim(); if(!q)return;
  const arr=searchFavs();
  const n=normalizeSearchText(q);
  const exists=arr.some(x=>normalizeSearchText(x)===n);
  const next=exists?arr.filter(x=>normalizeSearchText(x)!==n):[q,...arr].slice(0,10);
  localStorage.setItem('mh_fav_searches',JSON.stringify(next));
  doSearch(q);
}
function runSavedSearch(q){$('globalSearch').value=q;doSearch(q)}
function setSearchFilter(f){mhSearchFilter=f;doSearch(($('globalSearch')?.value||'').trim(),true)}
function openSearchResult(type,id){
  if(type==='home')return showAssetDetail('home',id,'overview');
  if(type==='car')return showAssetDetail('car',id,'overview');
  if(type==='entry'){
    const e=state.entries.find(x=>x.id===id); if(!e)return toast('Kayıt bulunamadı.');
    return entryForm(e.home_id?'home':'car',e.home_id||e.car_id,e.type,e.id);
  }
  if(type==='document')return showDocDetail(id);
}
function searchResultCard(item){
  return `<article class="search-card-v62 ${item.group}">
    <div class="search-card-icon">${item.icon}</div>
    <div class="search-card-copy"><b>${esc(item.title)}</b><span>${esc(item.meta||'')}</span><small>${esc(item.date||'')} ${item.status?'· '+esc(item.status):''} ${item.amount?('· '+fmt(item.amount)):''}</small></div>
    <button class="small secondary" onclick="openSearchResult('${item.type}','${item.id}')">Aç</button>
  </article>`;
}
function searchGroupTitle(g){return {homes:'Evler',cars:'Araçlar',income:'Gelirler',expense:'Giderler',documents:'Belgeler'}[g]||g}
function searchGroupIcon(g){return {homes:'🏠',cars:'🚗',income:'💰',expense:'💸',documents:'📄'}[g]||'🔎'}
function renderSearchEmpty(q){
  const recent=searchRecent(); const favs=searchFavs();
  return `<div class="search-v62-shell">
    <section class="search-v62-hero card"><span class="eyebrow">Global Search 2.0</span><h2>Ne aramak istiyorsun?</h2><p class="muted">Ev, araç, kira, MTV, belge, açıklama, kategori veya plaka yaz.</p></section>
    ${favs.length?`<section class="card search-saved"><h2>Favori Aramalar</h2><div>${favs.map(x=>`<button class="secondary small" onclick="runSavedSearch('${esc(x)}')">⭐ ${esc(x)}</button>`).join('')}</div></section>`:''}
    ${recent.length?`<section class="card search-saved"><h2>Son Aramalar</h2><div>${recent.map(x=>`<button class="secondary small" onclick="runSavedSearch('${esc(x)}')">${esc(x)}</button>`).join('')}</div></section>`:''}
  </div>`;
}
function doSearch(q,skipSave=false){
  q=(q||'').trim();
  if(!q){$('title').textContent='Arama';$('content').innerHTML=renderSearchEmpty(q);return}
  if(!skipSave)searchSaveRecent(q);
  $('title').textContent='Arama';
  const all=searchBuildItems().filter(i=>searchMatch(i,q));
  const filtered=mhSearchFilter==='all'?all:all.filter(i=>i.group===mhSearchFilter);
  const groups=['homes','cars','income','expense','documents'];
  const fav=searchFavs().some(x=>normalizeSearchText(x)===normalizeSearchText(q));
  const counts={all:all.length}; groups.forEach(g=>counts[g]=all.filter(i=>i.group===g).length);
  const filterHtml=['all',...groups].map(f=>`<button class="search-filter ${mhSearchFilter===f?'active':''}" onclick="setSearchFilter('${f}')">${f==='all'?'Hepsi':searchGroupTitle(f)} <b>${counts[f]||0}</b></button>`).join('');
  const grouped=groups.map(g=>{
    const arr=filtered.filter(i=>i.group===g).slice(0,20);
    if(!arr.length)return '';
    return `<section class="search-group-v62"><h3>${searchGroupIcon(g)} ${searchGroupTitle(g)}</h3><div class="search-list-v62">${arr.map(searchResultCard).join('')}</div></section>`;
  }).join('');
  $('content').innerHTML=`<div class="search-v62-shell">
    <section class="search-v62-hero card">
      <div><span class="eyebrow">Global Search 2.0</span><h2>“${esc(q)}”</h2><p class="muted">${filtered.length} sonuç gösteriliyor · Toplam ${all.length} eşleşme</p></div>
      <button class="secondary" onclick="searchToggleFav('${esc(q)}')">${fav?'★ Favoriden Çıkar':'☆ Favoriye Al'}</button>
    </section>
    <div class="search-filterbar">${filterHtml}</div>
    ${filtered.length?grouped:'<div class="card empty">Sonuç bulunamadı.</div>'}
    <section class="card search-saved"><h2>Son Aramalar</h2><div>${searchRecent().map(x=>`<button class="secondary small" onclick="runSavedSearch('${esc(x)}')">${esc(x)}</button>`).join('')||'<p class="muted">Henüz son arama yok.</p>'}</div></section>
  </div>`;
}

/* V6 Sprint C3 - Documents 3.0 */
var mhDocFilter='all';
var mhDocQuery='';
function docMetaStore(){try{return JSON.parse(localStorage.getItem('mh_doc_meta')||'{}')}catch(e){return {}}}
function saveDocMetaStore(v){localStorage.setItem('mh_doc_meta',JSON.stringify(v||{}))}
function docMeta(id){return docMetaStore()[id]||{tags:[],favorite:false}}
function setDocMeta(id,patch){const s=docMetaStore();s[id]=Object.assign({tags:[],favorite:false},s[id]||{},patch||{});saveDocMetaStore(s)}
function docFileKind(d){const n=(d.file_name||'').toLowerCase();if(n.endsWith('.pdf'))return 'pdf';if(/\.(png|jpg|jpeg|webp|gif)$/i.test(n))return 'image';return 'file'}
function docAsset(d){return d.home_id?state.homes.find(h=>h.id===d.home_id):state.cars.find(c=>c.id===d.car_id)}
function docEntry(d){return state.entries.find(x=>x.id===d.entry_id)}
function documents(){
  const all=state.documents||[];
  const q=normalizeSearchText(mhDocQuery||'');
  const counts={all:all.length,pdf:all.filter(d=>docFileKind(d)==='pdf').length,image:all.filter(d=>docFileKind(d)==='image').length,fav:all.filter(d=>docMeta(d.id).favorite).length,linked:all.filter(d=>d.entry_id||d.home_id||d.car_id).length};
  let docs=all.filter(d=>{
    const m=docMeta(d.id); const kind=docFileKind(d); const asset=docAsset(d); const e=docEntry(d);
    const filterOk=mhDocFilter==='all'||(mhDocFilter==='fav'?m.favorite:(mhDocFilter==='linked'?(d.entry_id||d.home_id||d.car_id):kind===mhDocFilter));
    const text=normalizeSearchText([d.doc_type,d.file_name,asset?.name,asset?.plate,e?entryLabel(e):'',...(m.tags||[])].join(' '));
    return filterOk && (!q || text.includes(q));
  });
  $('content').innerHTML=`
    <section class="docs-c3-shell">
      <div class="docs-c3-hero card">
        <div><span class="eyebrow">Documents 3.0</span><h2>Belge Merkezi</h2><p class="muted">Belge önizleme, etiket, favori ve ilişkili kayıt görünümü.</p></div>
        <button onclick="quickDoc()">Belge Yükle</button>
      </div>
      <div class="docs-c3-kpis grid4">
        <div class="kpi"><span>Toplam</span><b>${counts.all}</b></div>
        <div class="kpi"><span>PDF</span><b>${counts.pdf}</b></div>
        <div class="kpi"><span>Resim</span><b>${counts.image}</b></div>
        <div class="kpi"><span>Favori</span><b>${counts.fav}</b></div>
      </div>
      <div class="card docs-c3-toolbar">
        <input value="${esc(mhDocQuery)}" oninput="mhDocQuery=this.value;documents()" placeholder="Belge ara: DASK, sigorta, fatura, plaka...">
        <div class="doc-filter-row">
          ${docFilterButton('all','Hepsi',counts.all)}${docFilterButton('pdf','PDF',counts.pdf)}${docFilterButton('image','Resim',counts.image)}${docFilterButton('linked','İlişkili',counts.linked)}${docFilterButton('fav','Favori',counts.fav)}
        </div>
      </div>
      <div class="doc-grid-c3">${docs.map(d=>docRow(d)).join('')||'<div class="card empty">Belge bulunamadı.</div>'}</div>
    </section>`;
}
function docFilterButton(key,label,count){return `<button class="search-filter ${mhDocFilter===key?'active':''}" onclick="mhDocFilter='${key}';documents()">${label} <b>${count}</b></button>`}
function docRow(d){
  const asset=docAsset(d); const e=docEntry(d); const kind=d.home_id?'home':'car'; const id=d.home_id||d.car_id; const m=docMeta(d.id); const fileKind=docFileKind(d);
  const icon=fileKind==='pdf'?'📕':fileKind==='image'?'🖼️':'📄';
  return `<article class="doc-card-c3 ${m.favorite?'favorite':''}">
    <div class="doc-preview-icon">${icon}</div>
    <div class="doc-card-main"><div class="doc-card-topline"><span class="doc-type">${esc(d.doc_type||'Belge')}</span><button class="icon-btn ${m.favorite?'starred':''}" onclick="toggleDocFavorite('${d.id}')">★</button></div><h3>${esc(d.file_name||'Dosya')}</h3><p>${esc(asset?.name||'Varlık yok')}</p><small>${e?esc(entryLabel(e)):'Genel belge'} · ${esc((d.created_at||'').slice(0,10))}</small>${renderDocTags(d.id)}</div>
    <div class="doc-actions-v6"><button class="small secondary" onclick="showDocDetail('${d.id}')">Detay</button><button class="small secondary" onclick="showDocPreview('${d.id}')">Önizle</button><button class="small secondary" onclick="openDoc('${d.file_path}')">Aç</button>${id?`<button class="small secondary" onclick="showAssetDetail('${kind}','${id}','docs')">Varlığa Git</button>`:''}<button class="small danger" onclick="deleteDoc('${d.id}','${d.file_path}')">Sil</button></div>
  </article>`;
}
function renderDocTags(id){const tags=docMeta(id).tags||[];return tags.length?`<div class="doc-tags">${tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:'<div class="doc-tags muted-mini">Etiket yok</div>'}
function toggleDocFavorite(id){const m=docMeta(id);setDocMeta(id,{favorite:!m.favorite});documents();toast(!m.favorite?'Favorilere eklendi.':'Favorilerden çıkarıldı.')}
function addDocTag(id){const input=$('docTagInput');const tag=(input?.value||'').trim();if(!tag)return;const m=docMeta(id);const tags=[...new Set([...(m.tags||[]),tag])];setDocMeta(id,{tags});showDocDetail(id)}
function removeDocTag(id,tag){const m=docMeta(id);setDocMeta(id,{tags:(m.tags||[]).filter(t=>t!==tag)});showDocDetail(id)}
async function docSignedUrl(d){const {data,error}=await sb.storage.from('asset-documents').createSignedUrl(d.file_path,120);if(error){toast(error.message);return null}return data.signedUrl}
async function showDocPreview(id){
  const d=state.documents.find(x=>x.id===id); if(!d)return toast('Belge bulunamadı.');
  const url=await docSignedUrl(d); if(!url)return;
  const kind=docFileKind(d);
  const preview=kind==='image'?`<img class="doc-preview-media" src="${url}" alt="${esc(d.file_name||'Belge')}">`:kind==='pdf'?`<iframe class="doc-preview-frame" src="${url}"></iframe>`:`<div class="empty">Bu dosya tipi için önizleme yok.<br><button onclick="openDoc('${d.file_path}')">Belgeyi Aç</button></div>`;
  openModal(`<div class="doc-preview-modal"><div class="row"><div style="flex:1"><span class="eyebrow">Önizleme</span><h2>${esc(d.file_name||'Belge')}</h2></div><button class="secondary" onclick="openDoc('${d.file_path}')">Yeni Sekmede Aç</button></div>${preview}</div>`);
}
function showDocDetail(id){
  const d=state.documents.find(x=>x.id===id); if(!d)return toast('Belge bulunamadı.');
  const asset=docAsset(d); const e=docEntry(d); const m=docMeta(id); const tags=m.tags||[]; const kind=d.home_id?'home':'car';
  openModal(`<div class="doc-detail-v6 doc-detail-c3"><span class="eyebrow">Belge Detayı</span><h2>${esc(d.doc_type||'Belge')}</h2><p class="muted">${esc(d.file_name||'')}</p>
    <div class="asset-metrics-v6 wide"><div><span>Varlık</span><b>${esc(asset?.name||'-')}</b></div><div><span>İlişkili Kayıt</span><b>${e?esc(entryLabel(e)):'Genel'}</b></div><div><span>Yüklenme</span><b>${esc((d.created_at||'').slice(0,10))}</b></div></div>
    <div class="card inner-card"><h3>Etiketler</h3><div class="doc-tags detail-tags">${tags.map(t=>`<span>${esc(t)} <button onclick="removeDocTag('${id}','${esc(t)}')">×</button></span>`).join('')||'<small class="muted">Henüz etiket yok.</small>'}</div><div class="row"><input id="docTagInput" placeholder="Etiket ekle: Sigorta, Vergi, Kira..." onkeydown="if(event.key==='Enter')addDocTag('${id}')"><button onclick="addDocTag('${id}')">Ekle</button></div></div>
    <div class="card inner-card"><h3>İlişkili Kayıt</h3>${e?entryCard(e,true):'<p class="muted">Bu belge belirli bir gelir/gider kaydına bağlı değil.</p>'}</div>
    <div class="row"><button onclick="showDocPreview('${id}')">Önizle</button><button class="secondary" onclick="openDoc('${d.file_path}')">Belgeyi Aç</button>${asset?`<button class="secondary" onclick="closeModal();showAssetDetail('${kind}','${d.home_id||d.car_id}','docs')">Varlığa Git</button>`:''}</div>
  </div>`);
}
