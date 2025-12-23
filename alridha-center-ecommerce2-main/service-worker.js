/*
 * service-worker.js - الإصدار المتكامل (الأداء + الأمان)
 * يجمع بين سرعة التصفح (Caching) وعرض صفحة أوفلاين عند انقطاع النت.
 */

const CACHE_NAME = 'alridha-pro-v6'; // تحديث الإصدار
const OFFLINE_URL = './offline.html';

// الملفات الضرورية جداً (الشعار وصفحة الأوفلاين)
const STATIC_ASSETS = [
    OFFLINE_URL,
    './logo.png',
    './main.css',  // نحفظ التصميم الأساسي أيضاً
    './script.js'
];

// 1. التثبيت: ضمان وجود صفحة الأوفلاين
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // نحاول تحميل الملفات الضرورية، وإذا فشل أحدها لا نوقف الموقع
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('⚠️ تحذير: بعض الملفات الأساسية لم تتحمل، لكن سنكمل.', err);
            });
        })
    );
});

// 2. التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. المحرك الذكي (Fetch Engine)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // الحالة أ: التنقل بين الصفحات (HTML Navigation)
    // الاستراتيجية: الشبكة أولاً -> ثم الكاش -> ثم صفحة الأوفلاين
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // إذا نجح النت، نخزن الصفحة نسخة احتياطية
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // إذا فشل النت، نبحث في الكاش
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        // إذا لم نجد الصفحة في الكاش أيضاً، نعرض صفحة الأوفلاين المخصصة
                        return caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }

    // الحالة ب: الملفات الثابتة (صور، CSS، JS، خطوط)
    // الاستراتيجية: الكاش أولاً (للسرعة والسلاسة القصوى) -> ثم الشبكة
    if (
        request.destination === 'image' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        url.href.includes('cdnjs') || 
        url.href.includes('unpkg')
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                // وجدناها في الكاش؟ ممتاز، اعرضها فوراً
                if (cachedResponse) return cachedResponse;

                // لم نجدها؟ اجلبها من النت وخزنها للمستقبل
                return fetch(request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    // فشل النت للصورة؟ لا مشكلة، لا تعرض شيئاً (أو اعرض الشعار كبديل)
                    if (request.destination === 'image') {
                        return caches.match('./logo.png');
                    }
                    return null;
                });
            })
        );
        return;
    }

    // الحالة ج: البيانات (API / JSON)
    // الاستراتيجية: الشبكة أولاً (لضمان تحديث الأسعار)
    if (url.pathname.endsWith('.json')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
    }
});