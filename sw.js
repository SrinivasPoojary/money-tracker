/* Offline support: the app opens without internet and refreshes itself in the background when online. */
var CACHE='paisa-tracker-v1';
var ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&(res.status===200||res.type==='opaque')){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      if(hit)return hit;
      if(req.mode==='navigate')return caches.match('./index.html');
      return Response.error();
    });
    return hit||net;
  }));
});
