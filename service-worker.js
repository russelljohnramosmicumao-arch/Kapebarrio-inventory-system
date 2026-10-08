const CACHE_NAME='kape-barrio-inventory-v32-siomai';
const APP_FILES=['./','./index.html','./style.css','./data.js','./app.js','./manifest.json','./sync.css','./sync-config.js','./sync-core.js','./sync-login.html','./inventory-cloud.js','./inventory-update.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kape-barrio-inventory-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(error=>{if(event.request.mode==='navigate')return caches.match('./index.html');throw error;})));});
