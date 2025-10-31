// 1. Definições de Cache
const CACHE_NAME = 'meu-pwa-cache-v1.0';

// Lista de URLs a serem pré-armazenados em cache durante a instalação
// Estes são os ficheiros mínimos necessários para a experiência offline
const urlsToCache = [
  '/', // Necessário para a página inicial
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png',
  '/manifest.json' 
];

// =========================================================================
// 2. Evento 'install' (Instalação e Pré-caching)
// =========================================================================
self.addEventListener('install', (event) => {
  // O Service Worker espera até que o cache seja aberto e os ficheiros adicionados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto e pré-armazenado.');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Falha ao pré-armazenar:', error);
      })
  );
  // Força o Service Worker a assumir o controlo imediatamente após a instalação
  self.skipWaiting(); 
});


// =========================================================================
// 3. Evento 'activate' (Limpeza de Cache Antigo)
// =========================================================================
self.addEventListener('activate', (event) => {
  // O Service Worker espera enquanto a limpeza é concluída
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Exclui qualquer cache que não corresponda ao nome da versão atual
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Garante que a página atual é controlada pelo novo Service Worker
  return self.clients.claim(); 
});


// =========================================================================
// 4. Evento 'fetch' (Estratégia de Rede/Cache)
// =========================================================================
self.addEventListener('fetch', (event) => {
  // Intercetamos apenas requisições HTTP/HTTPS (não extensões, etc.)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request) // 1. Procura o recurso no cache
        .then((response) => {
          // Se o recurso estiver no cache (inclusive offline), retorna-o imediatamente
          if (response) {
            return response;
          }
          
          // 2. Se não estiver no cache, faz a requisição à rede (fallback)
          return fetch(event.request)
            .catch(() => {
              // 3. Se a rede falhar (usuário offline ou erro),
              // você pode retornar uma página de erro offline personalizada.
              // Por exemplo:
              // if (event.request.mode === 'navigate') {
              //     return caches.match('/offline.html'); 
              // }
            });
        })
    );
  }
});