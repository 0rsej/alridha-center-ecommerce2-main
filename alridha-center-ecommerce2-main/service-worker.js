/* * service-worker.js - الإصدار الاحترافي للعمل بدون إنترنت
 * هذا الملف يضمن حفظ التصميم، الأيقونات، الصور، والبيانات لتعمل أوفلاين
 */

const CACHE_NAME = 'alridha-pwa-v4'; // قمنا بتحديث الإصدار لفرض التحديث
const STATIC_ASSETS = [
  './',
  './index.html',
  './categories.html',
  './category-products.html',
  './product-details.html',
  './cart.html',
  './orders.html',
  './wishlist.html',
  './main.css',
  './script.js',
  './logo.png',
  './manifest.json',
  './category_names.json',
  
  // ملفات البيانات (JSON)
  './json/spices.json',
  './json/sweets.json',
  './json/nuts.json',
  './json/canned_goods.json',
  './json/personal_care.json',
  './json/occasions_cakes.json',
  './json/cake_ingredients.json',
  './json/groceries.json',
  './json/accessories.json',
  './json/construction_materials.json',
  './json/home_tools.json',
  './json/toys_kids.json',
  './json/balance_services.json',
  './json/school_supplies.json',
  './json/body_care_perfumes.json',
  './json/cleaning_supplies.json',
  './json/drinks.json',

  // أيقونات التطبيق (تأكد من وجودها)
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. مرحلة التثبيت: تحميل الملفات الأساسية
self.addEventListener('install', (event) => {
  self.skipWaiting(); // تفعيل الخدمة فوراً دون انتظار إغلاق التبويبات
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ جاري تخزين ملفات التطبيق الأساسية...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. مرحلة التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // السيطرة على الصفحات المفتوحة فوراً
});

// 3. استراتيجية الجلب الذكية (Fetch Strategy)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // أ) التعامل مع المصادر الخارجية (CDNs) - الأيقونات والمكتبات
  // هذا الجزء هو الأهم لمنع انهيار التصميم
  if (
    requestUrl.origin.includes('cdnjs.cloudflare.com') || 
    requestUrl.origin.includes('unpkg.com') || 
    requestUrl.origin.includes('fonts.googleapis.com') || 
    requestUrl.origin.includes('fonts.gstatic.com') ||
    requestUrl.origin.includes('instant.page')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // إذا كان الملف موجوداً في الكاش، استخدمه
        if (cachedResponse) return cachedResponse;

        // إذا لم يكن موجوداً، احلبه من النت وخزنه للمرة القادمة
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
            // في حال فشل الجلب (أوفلاين)، لا تفعل شيئاً (للأسف لا يوجد بديل للمكتبات الخارجية إلا تحميلها محلياً)
        });
      })
    );
    return;
  }

  // ب) التعامل مع ملفات JSON والصفحات HTML (شبكة أولاً، ثم كاش)
  // لضمان الحصول على أحدث الأسعار دائماً عند وجود إنترنت
  if (requestUrl.pathname.endsWith('.json') || requestUrl.pathname.endsWith('.html') || requestUrl.href === self.location.origin + '/') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // إذا فشل النت، اذهب للكاش
          return caches.match(event.request).then((cachedResponse) => {
             if (cachedResponse) return cachedResponse;
             // إذا الصفحة غير موجودة في الكاش، وجهه للصفحة الرئيسية كبديل
             if (event.request.mode === 'navigate') return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // ج) التعامل مع الصور (كاش أولاً، ثم شبكة، ثم صورة بديلة)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // إذا فشل تحميل الصورة (أوفلاين وليست في الكاش)، اعرض الشعار بدلاً من صورة مكسورة
          return caches.match('./logo.png');
        });
      })
    );
    return;
  }

  // د) باقي الملفات (CSS, JS المحلي) - كاش أولاً للسرعة
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});