const CACHE_NAME='kape-barrio-inventory-v39-stock-visibility-20261104-navfix2-sync-recovery-v2-update-guard-v3-offline-nav-v1';
const APP_FILES=["./page-tools.js","./page-tools.css",'./','./index.html','./style.css','./data.js','./app.js?v=availability-fix-20261104','./manifest.json','./sync.css','./sync-config.js','./sync-core.js','./sync-login.html','./inventory-cloud.js?v=visibility-fix-20261104','./inventory-update.js','./supply-orders.js','./supply-orders.css','./supply-tabs.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kape-barrio-inventory-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const navigation=event.request.mode==='navigate';
  if(navigation){
   try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok)await cache.put(event.request,response.clone());return response;}
   catch(error){
    const exact=await cache.match(event.request);if(exact)return exact;
    const clean=new URL(u);clean.search='';clean.hash='';
    const saved=await cache.match(clean.href);if(saved)return saved;
    const alias=new URL(clean.href);if(alias.pathname.endsWith('/'))alias.pathname+='index.html';else if(!/\.[a-z0-9]+$/i.test(alias.pathname))alias.pathname+='.html';
    const fallback=await cache.match(alias.href);if(fallback)return fallback;
    return new Response('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><h2>Offline</h2><p>Open this page online once before using it offline.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
   }
  }
  const saved=await cache.match(event.request);if(saved)return saved;
  const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;
 })());
});
