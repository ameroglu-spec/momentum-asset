const CACHE='momentum-hub-v7-sprint-2e-finance-reports';
const APP_SHELL=['/','/index.html','/style.css','/app.js','/manifest.webmanifest'];
function shouldCache(req){
  const url=new URL(req.url);
  if(url.origin!==location.origin)return false;
  if(req.method!=='GET')return false;
  return APP_SHELL.includes(url.pathname);
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(!shouldCache(e.request))return;
  e.respondWith(fetch(e.request).then(r=>{const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});return r}).catch(()=>caches.match(e.request)));
});
