const SUPABASE_URL='https://ihcpuytxrgmercbvblfy.supabase.co';
const SUPABASE_KEY='sb_publishable_ILKwhlgiUJbBKtf4lMVZzA_u6RjjP79';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let user=null,currentPage='dashboard';
let theme=localStorage.getItem('ma_theme')||'dark';
let state={homes:[],cars:[],entries:[],definitions:[],documents:[]};
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
async function load(){const [h,c,e,d,doc]=await Promise.all([sb.from('homes').select('*').order('created_at'),sb.from('cars').select('*').order('created_at'),sb.from('entries').select('*').order('date',{ascending:false}),sb.from('definitions').select('*').order('sort_order').order('name'),sb.from('documents').select('*').order('created_at',{ascending:false})]);if(h.error||c.error||e.error||d.error){toast('Supabase SQL eksik olabilir. V5 SQL kodunu çalıştır.');return}state.homes=h.data||[];state.cars=c.data||[];state.entries=e.data||[];state.definitions=d.data||[];state.documents=doc.data||[];await ensureDefaults();page(currentPage||'dashboard')}
async function ensureDefaults(){const need=[];Object.entries(DEFAULTS).forEach(([type,names])=>{if(!state.definitions.some(d=>d.type===type))names.forEach((name,i)=>need.push({user_id:user.id,type,name,sort_order:i,active:true}))});if(need.length){await sb.from('definitions').insert(need);const {data}=await sb.from('definitions').select('*').order('sort_order').order('name');state.definitions=data||[]}}
function defs(type,activeOnly=true){return state.definitions.filter(d=>d.type===type&&(!activeOnly||d.active))}
function optionHtml(type,selected=''){let arr=defs(type);if(!arr.length)arr=(DEFAULTS[type]||[]).map(name=>({name}));const val=selected||arr[0]?.name||'Diğer';return arr.map(o=>`<option value="${esc(o.name)}" ${o.name===val?'selected':''}>${esc(o.name)}</option>`).join('')}
function statusClass(s){return ['Ödendi','Alındı'].includes(s)?'ok':(s==='Gecikti'?'bad':'warn')}
function page(p){currentPage=p;document.querySelectorAll('.nav[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==p));$('title').textContent={dashboard:'Bugün',homes:'Varlıklar',cars:'Araçlar',notifications:'Bildirimler',calendar:'Takvim',documents:'Belgeler',reports:'Raporlar',definitions:'Tanımlar',backup:'Yedek'}[p]||p;updateNotificationBadge();({dashboard,homes,cars,notifications,calendar,documents,reports,definitions,backup}[p])();$('side').classList.remove('open')}
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
  const all=getCalendarItems(365);
  $('content').innerHTML=`<div class="card calendar-head"><div><span class="eyebrow">Finans Takvimi</span><h2>Takvim 2.0</h2><p class="muted">Geciken, bugün ve yaklaşan kayıtları renkli görünümle takip et.</p></div><button onclick="quickAction()">+ Hızlı İşlem</button></div>${calendarTabs()}<div class="calendar-layout"><div class="calendar-month">${calendarMonthView(all)}</div><div class="calendar-agenda card"><h2>Sıradaki İşler</h2>${calendarTimeline(all.slice(0,20),false)}</div></div>`;
}
function calendarTabs(){return `<div class="calendar-tabs"><button class="active" onclick="filterCalendar('month')">Ay</button><button onclick="filterCalendar('week')">Hafta</button><button onclick="filterCalendar('day')">Gün</button></div>`}
function filterCalendar(mode){toast(`${mode==='month'?'Ay':mode==='week'?'Hafta':'Gün'} görünümü aktif. Detaylı filtre V5.2.3'te geliştirilecek.`)}
function getCalendarItems(days=365){
  const now=new Date(today());const max=new Date(now);max.setDate(max.getDate()+days);
  return state.entries.filter(e=>!isClosedStatus(e.status)&&new Date(e.date)<=max).sort((a,b)=>a.date.localeCompare(b.date));
}
function calendarMonthView(list){
  const now=new Date();const y=now.getFullYear(),m=now.getMonth();const first=new Date(y,m,1);const last=new Date(y,m+1,0);let html='';
  const start=(first.getDay()+6)%7;for(let i=0;i<start;i++)html+='<div class="cal-cell empty-cell"></div>';
  for(let d=1;d<=last.getDate();d++){
    const iso=new Date(y,m,d).toISOString().slice(0,10);
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
