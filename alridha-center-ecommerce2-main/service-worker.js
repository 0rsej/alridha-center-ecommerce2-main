const CACHE_NAME = 'alridha-cache-v2'; // قمنا بتحديث الإصدار
const ASSETS_TO_CACHE = [
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
  './category_names.json',
  // ملفات الـ JSON للأقسام لضمان العمل أوفلاين
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
  './json/drinks.json'
];

// تنصيب الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// تفعيل وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// استراتيجية الجلب: الشبكة أولاً للمحتوى المتجدد، والكاش للملفات الثابتة
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // لملفات JSON والصور والصفحات: حاول الشبكة أولاً للحصول على أحدث الأسعار، إذا فشل اذهب للكاش
  if (requestUrl.pathname.endsWith('.json') || requestUrl.pathname.endsWith('.html') || requestUrl.href.includes('script.js')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // للملفات الثابتة الأخرى (CSS, مكتبات خارجية): الكاش أولاً للسرعة
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});