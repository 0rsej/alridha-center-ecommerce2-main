// في ملف script.js (استبدل الملف بالكامل بهذا الكود)

document.addEventListener('DOMContentLoaded', () => {

    let products = []; // سيتم تخزين جميع المنتجات هنا بعد دمجها من ملفات JSON المختلفة
    let cart = [];
    let scannerCart = []; // سلة الماسح
    let currentCartView = 'app'; // لعرض السلة الحالية
// ==========================================
// دالة مساعدة: التحقق من صحة رقم الهاتف العراقي
// ==========================================
function validatePhone(phone) {
    // يقبل الأرقام التي تبدأ بـ 07 وتتكون من 11 رقم
    const regex = /^07[0-9]{9}$/;
    return regex.test(phone);
}
    // عناصر التبويبات والواجهة الجديدة
    const tabAppCart = document.getElementById('tab-app-cart');
    const tabScannerCart = document.getElementById('tab-scanner-cart');
    const cartViewTitle = document.getElementById('cart-view-title');
    
    // عناصر واجهة عرض المنتج الكبيرة (Overlay)
    const productOverlay = document.getElementById('product-found-overlay');
    const foundImg = document.getElementById('found-img');
    const foundName = document.getElementById('found-name');
    const foundPrice = document.getElementById('found-price');

    // دوال الحفظ والتحميل لسلة الماسح
    function saveScannerCart() { localStorage.setItem('spiceShopScannerCart', JSON.stringify(scannerCart)); }
    function loadScannerCart() { const saved = localStorage.getItem('spiceShopScannerCart'); if (saved) scannerCart = JSON.parse(saved); }
    let orders = [];
    let wishlist = [];
    let categoryNames = {};
    let currentCategory = null;
    let currentGlobalProductId = null; // نستخدم globalId الآن
    let currentWishlistFilterCategory = 'all';
    let currentSelectedVariant = null;

    // قائمة بملفات JSON لكل قسم (يجب تحديثها إذا أضفت/حذفت أقسام جديدة)
    const CATEGORY_JSON_FILES = [
        'spices.json',
        'sweets.json',
        'nuts.json',
        'canned_goods.json',
        'personal_care.json',
        'occasions_cakes.json',
        'cake_ingredients.json',
        'groceries.json',
        'accessories.json',
        'construction_materials.json',
        'home_tools.json',
        'toys_kids.json',
        'balance_services.json',
        'school_supplies.json',
        'body_care_perfumes.json',
        'cleaning_supplies.json',
        'drinks.json'
    ];

    const currentPage = window.location.pathname.split('/').pop();
    const isCartPage = currentPage === 'cart.html';
    const isCategoryProductsPage = currentPage === 'category-products.html';
    const isProductDetailsPage = currentPage === 'product-details.html';
    const isIndexPage = currentPage === 'index.html' || currentPage === '';
    const isOrdersPage = currentPage === 'orders.html';
    const isWishlistPage = currentPage === 'wishlist.html';

    // عناصر الـ DOM - تم تعريفها هنا لتكون متاحة بشكل عام
    const productsListEl = document.getElementById('products-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    const categoryTitleEl = document.getElementById('category-title');

    const productDetailAreaEl = document.getElementById('product-detail-area');
    const productPageTitleEl = document.getElementById('product-page-title');
    const productDetailNameEl = document.getElementById('product-detail-name');
    const relatedProductsListEl = document.getElementById('related-products-list');
    const featuredProductsListEl = document.getElementById('featured-products-list');

    const cartEl = document.querySelector('.cart');
    const cartTableBody = document.querySelector('#cart-table tbody');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutSection = document.querySelector('.checkout');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location'); // **جديد: تعريف عنصر حقل الموقع**
    const notesInput = document.getElementById('notes');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    const ordersListEl = document.getElementById('orders-list');
    const notificationEl = document.getElementById('notification');

    const mainNavbar = document.getElementById('mainNavbar');
    const navCartCountEl = document.getElementById('navCartCount');
    const navWishlistCountEl = document.getElementById('navWishlistCount');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    // هذا هو العنصر الذي كان يسبب المشكلة، تعريفُه هنا صحيح ولكن يجب التحقق منه عند الاستخدام
    const wishlistProductsListEl = document.getElementById('wishlist-products-list');
    const clearWishlistBtn = document.getElementById('clear-wishlist-btn');

    const toggleCategoriesBtn = document.getElementById('toggle-categories-btn');
    const categoryDropdownMenu = document.getElementById('category-dropdown-menu');
    const showAllWishlistBtn = document.getElementById('show-all-wishlist-btn');

    // وظائف تخزين وتحميل السلة والطلبات والمفضلة
    function saveCart() { localStorage.setItem('spiceShopCart', JSON.stringify(cart)); }
    function loadCart() { const savedCart = localStorage.getItem('spiceShopCart'); if (savedCart) { cart = JSON.parse(savedCart); } }

    function saveOrders() { localStorage.setItem('spiceShopOrders', JSON.stringify(orders)); }
    function loadOrders() { const savedOrders = localStorage.getItem('spiceShopOrders'); if (savedOrders) { orders = JSON.parse(savedOrders); } }
    
    function saveWishlist() { localStorage.setItem('spiceShopWishlist', JSON.stringify(wishlist)); }
    function loadWishlist() { const savedWishlist = localStorage.getItem('spiceShopWishlist'); if (savedWishlist) { wishlist = JSON.parse(savedWishlist); } }


    function showNotification(message, type = 'success') {
        if (!notificationEl) return;
        notificationEl.textContent = message;
        notificationEl.className = `notification ${type}`;
        notificationEl.classList.add('show');
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    }

function updateNavbarCartCount() {
    // 1. تحديث سلة التطبيق العادية
    const totalCartItems = cart.length; 
    if (navCartCountEl) {
        navCartCountEl.textContent = totalCartItems;
        navCartCountEl.style.display = totalCartItems > 0 ? 'flex' : 'none';
    }
    
    // 2. تحديث سلة الماسح (الجديد في الشريط العلوي)
    const totalScannerItems = scannerCart.length; // تأكد أن scannerCart معرفة عالمياً
    const navScannerCountEl = document.getElementById('navScannerCount');
    if (navScannerCountEl) {
        navScannerCountEl.textContent = totalScannerItems;
        navScannerCountEl.style.display = totalScannerItems > 0 ? 'flex' : 'none';
    }

    // 3. تحديث المفضلة
    const totalWishlistItems = wishlist.length;
    if (navWishlistCountEl) {
        navWishlistCountEl.textContent = totalWishlistItems;
        navWishlistCountEl.style.display = totalWishlistItems > 0 ? 'inline-block' : 'none';
    }

    // تحديث عدادات الحاسوب (Desktop)
    const desktopCartCountEl = document.getElementById('desktopCartCount');
    const desktopWishlistCountEl = document.getElementById('desktopWishlistCount');
    if (desktopCartCountEl) {
        desktopCartCountEl.textContent = totalCartItems;
        desktopCartCountEl.style.display = totalCartItems > 0 ? 'inline-block' : 'none';
    }
    if (desktopWishlistCountEl) {
        desktopWishlistCountEl.textContent = totalWishlistItems;
        desktopWishlistCountEl.style.display = totalWishlistItems > 0 ? 'inline-block' : 'none';
    }
}
    // وظيفة عرض المنتجات في القوائم (صفحة الأقسام)
    function displayProducts(productsToShow) {
        if (!productsListEl) return;

        productsListEl.innerHTML = '';
        
        let filteredProducts = productsToShow;

        if (filteredProducts.length === 0) {
            productsListEl.innerHTML = '<p style="text-align: center; color: var(--light-text);">عفواً، لم يتم العثور على منتجات في هذا القسم أو تطابق بحثك.</p>';
            return;
        }

        filteredProducts.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product';
            // البحث في المفضلة باستخدام globalId
            const isFav = wishlist.some(item => item.globalId === p.globalId);
            const isSoldByPriceCurrent = ['spices', 'nuts'].includes(p.category);
            
            // تحديد ما إذا كان المنتج يحتوي على متغيرات
            const hasVariants = p.variants && p.variants.length > 0;

            div.innerHTML = `
                <a href="product-details.html?globalId=${p.globalId}" class="product-link" aria-label="عرض تفاصيل المنتج ${p.name}">
                    <div class="product-info">
                        <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy">
                        <div class="product-text-content">
                            <strong>(${p.id}) ${p.name}</strong>
                            <span class="product-price-inline">السعر: ${p.price} د.ع / ${isSoldByPriceCurrent ? 'كيلو' : 'قطعة'}</span>
                        </div>
                    </div>
                </a>
                <div class="product-actions">
                    ${hasVariants ? 
                        `<button class="view-details-btn" data-global-id="${p.globalId}" aria-label="اختر أنواع ${p.name}">
                            <i class="fas fa-info-circle"></i> اختر النوع
                        </button>`
                        :
                        `<button class="add-btn" data-global-id="${p.globalId}" aria-label="أضف ${p.name} إلى السلة">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>`
                    }
                    <button class="add-to-wishlist-btn ${isFav ? 'active' : ''}" data-global-id="${p.globalId}" aria-label="${isFav ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            `;
            productsListEl.appendChild(div);
        });

        productsListEl.querySelectorAll('.add-to-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                toggleWishlist(globalProductId, e.currentTarget);
            });
        });
        
        // معالج لزر "أضف للسلة" للمنتجات التي لا تحتوي على متغيرات
        productsListEl.querySelectorAll('button.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                const product = products.find(p => p.globalId === globalProductId);
                const isSoldByPriceCurrent = ['spices', 'nuts'].includes(product.category);
                addToCart(globalProductId, isSoldByPriceCurrent ? 1000 : 1, isSoldByPriceCurrent);
            });
        });

        // معالج لزر "اختر النوع" للمنتجات التي تحتوي على متغيرات
        productsListEl.querySelectorAll('button.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                // توجيه المستخدم لصفحة تفاصيل المنتج
                window.location.href = `product-details.html?globalId=${globalProductId}`;
            });
        });
    }

    // وظيفة لعرض تفاصيل منتج واحد في صفحة product-details.html
    function displayProductDetails(globalProductId) {
        const product = products.find(p => p.globalId === globalProductId);
        if (!product) {
            console.error('Product not found for globalId:', globalProductId);
            if (productDetailAreaEl) {
                productDetailAreaEl.innerHTML = '<p style="text-align: center; color: var(--danger-color);">عفواً، هذا المنتج غير موجود.</p>';
            }
            if (productPageTitleEl) productPageTitleEl.textContent = 'المنتج غير موجود - سنتر الرضا';
            if (productDetailNameEl) productDetailNameEl.textContent = 'المنتج غير موجود';
            return;
        }

        if (productPageTitleEl) productPageTitleEl.textContent = `${product.name} - سنتر الرضا`;
        if (productDetailNameEl) productDetailNameEl.textContent = product.name;

        let additionalDetails = "";
        if (product.category === 'spices') {
            additionalDetails = "هذا البهار عالي الجودة ومناسب لجميع الأطباق العراقية والعربية. يُحفظ في مكان بارد وجاف للحفاظ على نكهته وعبيره.";
        } else if (product.category === 'groceries') {
            additionalDetails = "منتج أساسي لكل منزل، مضمون الجودة وطازج. مثالي لوجباتكم اليومية.";
        } else {
            additionalDetails = "منتج عالي الجودة وموثوق. نضمن لكم أفضل تجربة مع هذا المنتج من سنتر الرضا.";
        }
        
        const isSoldByPrice = ['spices', 'nuts'].includes(product.category);

        if (productDetailAreaEl) {
            const isFav = wishlist.some(item => item.globalId === product.globalId);
            const categoryDisplayName = categoryNames[product.category] || 'غير مصنف';

            let productImageSrc = product.image;
            let currentPrice = product.price;

            const hasVariants = product.variants && product.variants.length > 0;

            if (hasVariants) {
                currentSelectedVariant = product.variants[0];
                if (currentSelectedVariant.image) {
                    productImageSrc = currentSelectedVariant.image;
                }
                if (currentSelectedVariant.price_modifier !== undefined) {
                    currentPrice = product.price + currentSelectedVariant.price_modifier;
                }
            } else {
                currentSelectedVariant = null;
            }

            productDetailAreaEl.innerHTML = `
                <img src="${productImageSrc}" alt="${product.name}" class="detail-image" id="product-detail-image" loading="lazy" />
                <div class="detail-info">
                    <span class="product-category">${categoryDisplayName}</span>
                    <h3>(${product.id}) ${product.name}</h3>
                    <p class="detail-desc">${product.desc}. ${additionalDetails}</p>

                    ${hasVariants ? `
                        <div class="product-variants" id="product-variants-container">
                            <h4>اختر ${product.variants[0].type || 'النوع'}:</h4>
                            <div class="variant-options">
                                ${product.variants.map((variant, index) => `
                                    <button class="variant-option-btn ${index === 0 ? 'active' : ''}"
                                            data-variant-index="${index}"
                                            data-variant-value="${variant.value}"
                                            aria-label="اختر ${variant.value}">
                                        ${variant.value}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="price-stock-info">
                        <span class="detail-price" id="product-display-price">السعر: ${currentPrice} د.ع / ${isSoldByPrice ? 'كيلو' : 'قطعة'}</span>
                        <span class="stock-info"><i class="fas fa-box"></i> متوفر في المخزون</span>
                    </div>
                    <div class="quantity-selector">
                        <button class="quantity-btn decrease-quantity-btn" aria-label="تقليل الكمية">-</button>
                        <input type="number" value="${isSoldByPrice ? 1000 : 1}" min="${isSoldByPrice ? 250 : 1}" step="${isSoldByPrice ? 250 : 1}" class="quantity-input" aria-label="أدخل الكمية أو القيمة بالدينار"/>
                        <button class="quantity-btn increase-quantity-btn" aria-label="زيادة الكمية">+</button>
                    </div>
                    <div class="product-actions">
                        <button class="add-btn" data-global-id="${product.globalId}" aria-label="أضف ${product.name} إلى السلة">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>
                        <button class="add-to-wishlist-btn ${isFav ? 'active' : ''}" data-global-id="${product.globalId}" aria-label="${isFav ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}">
                            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="delivery-info">
                        <i class="fas fa-truck"></i> توصيل سريع خلال 24 ساعة (داخل البصرة)
                        <br>
                        
                    </div>
                </div>
            `;

            const detailAddBtn = productDetailAreaEl.querySelector('.add-btn');
            const detailWishlistBtn = productDetailAreaEl.querySelector('.add-to-wishlist-btn');
            const quantityInput = productDetailAreaEl.querySelector('.quantity-input');
            const decreaseBtn = productDetailAreaEl.querySelector('.decrease-quantity-btn');
            const increaseBtn = productDetailAreaEl.querySelector('.increase-quantity-btn');
            const productDetailImage = productDetailAreaEl.querySelector('#product-detail-image');
            const productDisplayPriceEl = productDetailAreaEl.querySelector('#product-display-price');
            const variantOptionsContainer = productDetailAreaEl.querySelector('.variant-options');

            if (isSoldByPrice) {
                quantityInput.placeholder = "القيمة د.ع";
            } else {
                quantityInput.placeholder = "الكمية";
            }

            if (detailAddBtn) {
                detailAddBtn.addEventListener('click', (e) => {
                    let amountInIQD = parseFloat(quantityInput.value);
                    if (isNaN(amountInIQD) || amountInIQD <= 0) {
                        showNotification('يرجى إدخال قيمة صحيحة (250، 500، 1000 وهكذا).', 'error');
                        return;
                    }
                    
                    if (isSoldByPrice && amountInIQD % 250 !== 0) {
                        showNotification('يرجى إدخال قيمة من مضاعفات 250 (مثلاً: 250, 500, 750, 1000).', 'error');
                        return;
                    }

                    addToCart(e.target.getAttribute('data-global-id'), amountInIQD, isSoldByPrice, currentSelectedVariant);
                });
            }
            if (detailWishlistBtn) {
                detailWishlistBtn.addEventListener('click', (e) => {
                    toggleWishlist(e.currentTarget.getAttribute('data-global-id'), e.currentTarget);
                });
            }
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    let currentVal = parseFloat(quantityInput.value);
                    if (isSoldByPrice) {
                        currentVal = Math.max(250, currentVal - 250);
                    } else {
                        currentVal = Math.max(1, currentVal - 1);
                    }
                    quantityInput.value = currentVal;
                });
            }
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => {
                    let currentVal = parseFloat(quantityInput.value);
                    if (isSoldByPrice) {
                        quantityInput.value = currentVal + 250;
                    } else {
                        quantityInput.value = currentVal + 1;
                    }
                });
            }
            if (quantityInput) {
                quantityInput.addEventListener('change', () => {
                    let val = parseFloat(quantityInput.value);
                    if (isNaN(val) || val <= 0) {
                        quantityInput.value = isSoldByPrice ? 250 : 1;
                    } else if (isSoldByPrice && val % 250 !== 0) {
                        quantityInput.value = Math.round(val / 250) * 250;
                        if (quantityInput.value === "0") quantityInput.value = "250";
                        showNotification('تم تعديل القيمة لأقرب مضاعف لـ 250.', 'info');
                    }
                });
            }

            if (hasVariants && variantOptionsContainer) {
                variantOptionsContainer.addEventListener('click', (e) => {
                    const clickedButton = e.target.closest('.variant-option-btn');
                    if (clickedButton) {
                        variantOptionsContainer.querySelectorAll('.variant-option-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });

                        clickedButton.classList.add('active');

                        const variantIndex = parseInt(clickedButton.getAttribute('data-variant-index'));
                        const selectedVariant = product.variants[variantIndex];
                        currentSelectedVariant = selectedVariant;

                        if (selectedVariant.image && productDetailImage) {
                            productDetailImage.src = selectedVariant.image;
                        } else {
                            productDetailImage.src = product.image;
                        }

                        let newPrice = product.price;
                        if (selectedVariant.price_modifier !== undefined) {
                            newPrice = product.price + selectedVariant.price_modifier;
                        }
                        if (productDisplayPriceEl) {
                            productDisplayPriceEl.textContent = `السعر: ${newPrice} د.ع / ${isSoldByPrice ? 'كيلو' : 'قطعة'}`;
                        }
                    }
                });
            }
        }
        displayRelatedProducts(product.category, product.globalId);
    }

    // وظيفة لعرض المنتجات ذات الصلة (تستخدم أيضاً للمنتجات المميزة)
    function displayRelatedProducts(category, excludeGlobalProductId) {
        if (!relatedProductsListEl) return;

        const related = products.filter(p => p.category === category && p.globalId !== excludeGlobalProductId);

        if (related.length === 0) {
            relatedProductsListEl.innerHTML = '<p style="text-align: center; color: var(--light-text);">لا توجد منتجات أخرى ذات صلة في الوقت الحالي.</p>';
            return;
        }

        const shuffled = related.sort(() => 0.5 - Math.random());
        const selectedRelated = shuffled.slice(0, 4);

        relatedProductsListEl.innerHTML = '';
        selectedRelated.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-item';
            const isFav = wishlist.some(item => item.globalId === p.globalId);
            const isSoldByPriceRelated = ['spices', 'nuts'].includes(p.category);
            const hasVariants = p.variants && p.variants.length > 0; // إضافة هذا السطر

            div.innerHTML = `
                <a href="product-details.html?globalId=${p.globalId}" class="product-link" aria-label="عرض تفاصيل المنتج ${p.name}">
                    <img src="${p.image}" alt="${p.name}" width="100" height="100" loading="lazy" />
                    <div class="product-text-info">
                        <h3>(${p.id}) ${p.name}</h3>
                        <span class="price">السعر: ${p.price} د.ع</span>
                    </div>
                </a>
                <div class="product-actions">
                    ${hasVariants ? // إضافة هذا الشرط
                        `<button class="view-details-btn" data-global-id="${p.globalId}" aria-label="اختر أنواع ${p.name}">
                            <i class="fas fa-info-circle"></i> اختر النوع
                        </button>`
                        :
                        `<button class="add-to-cart-btn" data-global-id="${p.globalId}" aria-label="أضف ${p.name} إلى السلة">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>`
                    }
                    <button class="add-to-wishlist-btn ${isFav ? 'active' : ''}" data-global-id="${p.globalId}" aria-label="${isFav ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            `;
            relatedProductsListEl.appendChild(div);

            // معالج لزر "أضف للسلة" للمنتجات التي لا تحتوي على متغيرات
            const addBtn = div.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    addToCart(e.currentTarget.getAttribute('data-global-id'), isSoldByPriceRelated ? 1000 : 1, isSoldByPriceRelated);
                });
            }
            // معالج لزر "اختر النوع" للمنتجات التي تحتوي على متغيرات
            const viewDetailsBtn = div.querySelector('button.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (e) => {
                    const globalProductId = e.currentTarget.getAttribute('data-global-id');
                    window.location.href = `product-details.html?globalId=${globalProductId}`;
                });
            }

            const wishlistBtn = div.querySelector('.add-to-wishlist-btn');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    toggleWishlist(e.currentTarget.getAttribute('data-global-id'), e.currentTarget);
                });
            }
        });
    }

    // وظيفة لعرض المنتجات المميزة في الصفحة الرئيسية
    function displayFeaturedProducts() {
        if (!featuredProductsListEl) return;

        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
        const selectedFeatured = shuffledProducts.slice(0, 4);

        featuredProductsListEl.innerHTML = '';
        selectedFeatured.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-item';
            const isFav = wishlist.some(item => item.globalId === p.globalId);
            const isSoldByPriceFeatured = ['spices', 'nuts'].includes(p.category);
            const hasVariants = p.variants && p.variants.length > 0; // إضافة هذا السطر

            div.innerHTML = `
                <a href="product-details.html?globalId=${p.globalId}" class="product-link" aria-label="عرض تفاصيل المنتج ${p.name}">
                    <img src="${p.image}" alt="${p.name}" width="100" height="100" loading="lazy" />
                    <div class="product-text-info">
                        <h3>(${p.id}) ${p.name}</h3>
                        <span class="price">السعر: ${p.price} د.ع</span>
                    </div>
                </a>
                <div class="product-actions">
                    ${hasVariants ? // إضافة هذا الشرط
                        `<button class="view-details-btn" data-global-id="${p.globalId}" aria-label="اختر أنواع ${p.name}">
                            <i class="fas fa-info-circle"></i> اختر النوع
                        </button>`
                        :
                        `<button class="add-to-cart-btn" data-global-id="${p.globalId}" aria-label="أضف ${p.name} إلى السلة">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>`
                    }
                    <button class="add-to-wishlist-btn ${isFav ? 'active' : ''}" data-global-id="${p.globalId}" aria-label="${isFav ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            `;
            featuredProductsListEl.appendChild(div);

            // معالج لزر "أضف للسلة" للمنتجات التي لا تحتوي على متغيرات
            const addBtn = div.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    addToCart(e.currentTarget.getAttribute('data-global-id'), isSoldByPriceFeatured ? 1000 : 1, isSoldByPriceFeatured);
                });
            }
            // معالج لزر "اختر النوع" للمنتجات التي تحتوي على متغيرات
            const viewDetailsBtn = div.querySelector('button.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (e) => {
                    const globalProductId = e.currentTarget.getAttribute('data-global-id');
                    window.location.href = `product-details.html?globalId=${globalProductId}`;
                });
            }

            const wishlistBtn = div.querySelector('.add-to-wishlist-btn');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    toggleWishlist(e.currentTarget.getAttribute('data-global-id'), e.currentTarget);
                });
            }
        });
    }

    // وظيفة إدارة المفضلة (إضافة/حذف)
    function toggleWishlist(globalProductId, buttonElement) {
        const product = products.find(p => p.globalId === globalProductId);
        if (!product) {
            showNotification('المنتج غير موجود لحفظه في المفضلة!', 'error');
            return;
        }

        const existingFavIndex = wishlist.findIndex(item => item.globalId === globalProductId);
        const iconElement = buttonElement.querySelector('i');

        if (existingFavIndex !== -1) {
            wishlist.splice(existingFavIndex, 1);
            showNotification(`تمت إزالة "${product.name}" من المفضلة.`, 'error');
            if (iconElement) {
                iconElement.classList.remove('fas');
                iconElement.classList.add('far');
            }
            buttonElement.classList.remove('active');
        } else {
            wishlist.push(product);
            showNotification(`تمت إضافة "${product.name}" إلى المفضلة!`, 'success');
            if (iconElement) {
                iconElement.classList.remove('far');
                iconElement.classList.add('fas');
            }
            buttonElement.classList.add('active');
        }
        saveWishlist();
        updateNavbarCartCount();
        if (isWishlistPage) {
            filterWishlistByCategory(currentWishlistFilterCategory);
            populateCategoryDropdown();
        }
    }

    // وظيفة إزالة منتج من المفضلة (تستدعى من displayWishlist)
    function removeFromWishlist(globalProductId) {
        wishlist = wishlist.filter(item => item.globalId !== globalProductId);
        saveWishlist();
        updateNavbarCartCount();
        if (isWishlistPage) {
            filterWishlistByCategory(currentWishlistFilterCategory);
            populateCategoryDropdown();
        }
    }

    function populateCategoryDropdown() {
        if (!categoryDropdownMenu) return;

        categoryDropdownMenu.innerHTML = '';

        const uniqueWishlistCategories = [...new Set(wishlist.map(item => item.category))];

        if (uniqueWishlistCategories.length > 0) {
            const allCategoriesLink = document.createElement('a');
            allCategoriesLink.href = "#";
            allCategoriesLink.textContent = 'عرض كل المفضلة';
            allCategoriesLink.setAttribute('data-category', 'all');
            if (currentWishlistFilterCategory === 'all') {
                allCategoriesLink.classList.add('active-filter');
            }
            categoryDropdownMenu.appendChild(allCategoriesLink);

            const separator = document.createElement('div');
            separator.className = 'dropdown-separator';
            categoryDropdownMenu.appendChild(separator);
        } else {
            const noCategoriesMessage = document.createElement('div');
            noCategoriesMessage.textContent = 'لا توجد أقسام مفضلة لتصفيتها.';
            noCategoriesMessage.style.padding = '10px';
            noCategoriesMessage.style.textAlign = 'center';
            noCategoriesMessage.style.color = 'var(--light-text)';
            categoryDropdownMenu.appendChild(noCategoriesMessage);
        }
        
        uniqueWishlistCategories.forEach(category => {
            const categoryFilterLink = document.createElement('a');
            categoryFilterLink.href = "#";
            categoryFilterLink.textContent = categoryNames[category] || category; 
            categoryFilterLink.setAttribute('data-category', category);
            if (currentWishlistFilterCategory === category) {
                categoryFilterLink.classList.add('active-filter');
            }
            categoryDropdownMenu.appendChild(categoryFilterLink);
        });

        categoryDropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedCategory = e.target.getAttribute('data-category');
                currentWishlistFilterCategory = selectedCategory;
                filterWishlistByCategory(selectedCategory);
                categoryDropdownMenu.classList.remove('show');
                toggleCategoriesBtn.querySelector('.dropdown-icon').classList.remove('rotate');
                categoryDropdownMenu.querySelectorAll('a').forEach(a => a.classList.remove('active-filter'));
                e.target.classList.add('active-filter');
            });
        });
    }

// ============================================================
    // دالة عرض المفضلة (تم ضبط الأزرار لتكون متساوية 100%)
    // ============================================================
    function filterWishlistByCategory(category) {
        if (!wishlistProductsListEl) return;

        wishlistProductsListEl.innerHTML = '';

        let filteredItems = wishlist;

        if (category !== 'all') {
            filteredItems = wishlist.filter(item => item.category === category);
        }

        if (showAllWishlistBtn) {
            if (category === 'all') {
                showAllWishlistBtn.classList.add('active-filter');
            } else {
                showAllWishlistBtn.classList.remove('active-filter');
            }
        }

        if (filteredItems.length === 0) {
            wishlistProductsListEl.innerHTML = '<p style="text-align: center; color: var(--light-text); width: 100%; margin-top: 30px;">قائمة المفضلة فارغة حالياً.</p>';
            return;
        }

        const groupedFilteredWishlist = filteredItems.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = [];
            acc[product.category].push(product);
            return acc;
        }, {});

        let firstCategory = true;
        for (const cat in groupedFilteredWishlist) {
            const productsInCategory = groupedFilteredWishlist[cat];
            const categoryTitle = categoryNames[cat] || cat;

            if (currentWishlistFilterCategory === 'all' || cat === currentWishlistFilterCategory) {
                if (!firstCategory) {
                    const separatorDiv = document.createElement('div');
                    separatorDiv.className = 'category-separator';
                    wishlistProductsListEl.appendChild(separatorDiv);
                }
                firstCategory = false;

                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-products-header';
                categoryHeader.textContent = categoryTitle;
                wishlistProductsListEl.appendChild(categoryHeader);
            }

            productsInCategory.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product'; 
                
                const isSoldByPriceWishlist = ['spices', 'nuts'].includes(p.category);
                const hasVariants = p.variants && p.variants.length > 0;

                div.innerHTML = `
                    <a href="product-details.html?globalId=${p.globalId}" class="product-link" aria-label="عرض تفاصيل المنتج ${p.name}">
                        <div class="product-info">
                            <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy" onerror="this.onerror=null; this.src='logo.png';">
                            <div class="product-text-content">
                                <strong>(${p.id}) ${p.name}</strong>
                                <span class="product-price-inline">السعر: ${p.price} د.ع / ${isSoldByPriceWishlist ? 'كيلو' : 'قطعة'}</span>
                            </div>
                        </div>
                    </a>
                    
                    <div class="product-actions">
                        ${hasVariants ? 
                            `<button class="view-details-btn" data-global-id="${p.globalId}">
                                <i class="fas fa-info-circle"></i> اختر النوع
                            </button>`
                            :
                            `<button class="add-btn" data-global-id="${p.globalId}">
                                <i class="fas fa-cart-plus"></i> أضف للسلة
                            </button>`
                        }
                        
                        <button class="remove-from-wishlist-btn" data-global-id="${p.globalId}">
                            <i class="fas fa-trash-alt"></i> إزالة
                        </button>
                    </div>
                `;
                wishlistProductsListEl.appendChild(div);
                                                        
                // تفعيل الأزرار (Events)
                const addBtn = div.querySelector('.add-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', (e) => {
                        const globalProductId = e.target.getAttribute('data-global-id');
                        const productToAdd = products.find(prod => prod.globalId === globalProductId);
                        const isSoldByPriceForAdd = ['spices', 'nuts'].includes(productToAdd.category);
                        addToCart(globalProductId, isSoldByPriceForAdd ? 1000 : 1, isSoldByPriceForAdd);
                    });
                }

                const viewDetailsBtn = div.querySelector('button.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.addEventListener('click', (e) => {
                        const globalProductId = e.currentTarget.getAttribute('data-global-id');
                        window.location.href = `product-details.html?globalId=${globalProductId}`;
                    });
                }

                const removeBtn = div.querySelector('.remove-from-wishlist-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', (e) => {
                        if (confirm(`هل أنت متأكد من إزالة "${p.name}" من قائمة المفضلة؟`)) {
                            removeFromWishlist(e.target.getAttribute('data-global-id'));
                        }
                    });
                }
            });
        }
        
        if (isWishlistPage && wishlistProductsListEl && typeof applyWishlistResponsiveStyles === 'function') {
            applyWishlistResponsiveStyles();
        }
    }
    // تفويض الأحداث لزر "أضف للسلة" (في صفحات المنتجات)
    if (productsListEl) {
        productsListEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                const globalProductId = e.target.getAttribute('data-global-id');
                const product = products.find(p => p.globalId === globalProductId);
                const isSoldByPriceCurrent = ['spices', 'nuts'].includes(product.category);
                addToCart(globalProductId, isSoldByPriceCurrent ? 1000 : 1, isSoldByPriceCurrent);
            }
        });
    }

    // وظيفة إضافة المنتج إلى السلة
    function addToCart(globalProductId, quantityOrPrice = 1, isSoldByPrice = false, selectedVariant = null) {
        const product = products.find(p => p.globalId === globalProductId);
        if (!product) {
            console.error('Product not found for globalId:', globalProductId);
            showNotification('المنتج غير موجود!', 'error');
            return;
        }

        let actualQuantity = quantityOrPrice;
        let displayMessage = "";
        let itemName = product.name;
        let itemPrice = product.price;

        // تحسين عرض اسم المتغير لتجنب التكرار
        if (selectedVariant && selectedVariant.value) { // تحقق من وجود selectedVariant.value
            itemName = `${product.name} (${selectedVariant.value})`;
            if (selectedVariant.price_modifier !== undefined) {
                itemPrice = product.price + selectedVariant.price_modifier;
            }
        }

        if (isSoldByPrice) {
            // هنا نضمن أن يتم عرض "بقيمة X د.ع" حتى لو كان 1000
            displayMessage = `بقيمة ${quantityOrPrice} د.ع`;
            actualQuantity = quantityOrPrice;
        } else {
            displayMessage = `(الكمية: ${quantityOrPrice})`; // عدّلت الرسالة لتكون أوضح
            actualQuantity = quantityOrPrice;
        }

        const existingItem = cart.find(item => {
            return item.product.globalId === globalProductId &&
                   (selectedVariant ? (item.variant && item.variant.value === selectedVariant.value) : !item.variant);
        });
        // --- بداية التعديل: التحقق من القيود ---
let newTotalQuantity = actualQuantity;
if (existingItem) {
    newTotalQuantity += existingItem.quantity;
}

if (isSoldByPrice) {
    // الحد الأقصى للوزن/القيمة: 25,000 د.ع
    if (newTotalQuantity > 25000) {
        showNotification('عفواً، الحد الأقصى لهذا المنتج هو 25,000 د.ع.', 'error');
        return; 
    }
} else {
    // الحد الأقصى للعدد: 50 قطعة
    if (newTotalQuantity > 50) {
        showNotification('عفواً، الحد الأقصى لهذا المنتج هو 50 قطعة.', 'error');
        return;
    }
}
// --- نهاية التعديل ---

        if (existingItem) {
            if (isSoldByPrice) {
                existingItem.quantity += actualQuantity;
            } else {
                existingItem.quantity += actualQuantity;
            }
        } else {
            cart.push({
                product: { ...product, name: itemName, price: itemPrice }, // استخدام itemName المعدل هنا
                quantity: actualQuantity,
                isSoldByPrice: isSoldByPrice,
                variant: selectedVariant
            });
        }
        showNotification(`تم إضافة "${itemName}" ${displayMessage} إلى السلة!`, 'success');
        updateNavbarCartCount();
        saveCart();
        if (isCartPage) {
            updateCartUI();
        }
    }
// وظيفة تحديث واجهة السلة (في cart.html)
function updateCartUI() {
        if (!cartTableBody) return;

        // اختيار المصفوفة الصحيحة
        const targetCart = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') ? scannerCart : cart;

        cartTableBody.innerHTML = '';
        let total = 0;

        if (targetCart.length === 0) {
            const emptyMsg = (currentCartView === 'scanner') ? 'سلة الماسح فارغة حالياً.' : 'سلة المشتريات فارغة حالياً.';
            cartTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">${emptyMsg}</td></tr>`;
            // التعديل: لا تخفِ السلة بالكامل هنا لكي تظل التبويبات ظاهرة
            if (checkoutSection) checkoutSection.classList.add('hidden');
        } else {
            targetCart.forEach((item, index) => {
                // تأكد من وجود كائن المنتج لتجنب توقف السكربت
                if (!item.product) return; 

                let itemSubtotal;
                let displayName = item.product.name;
                let displayPricePerUnit = item.product.price;

                // حساب المجموع الفرعي
                if (item.isSoldByPrice) {
                    itemSubtotal = item.quantity;
                } else {
                    let price = item.product.price;
                    if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
                    itemSubtotal = price * item.quantity;
                }
                total += itemSubtotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="display:flex; align-items:center; justify-content: flex-end;">
                            <span>${displayName}</span>
                            <img src="${item.variant?.image || item.product.image}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                        </div>
                    </td>
                    <td>
                        <input type="number" min="${item.isSoldByPrice ? 250 : 1}" value="${item.quantity}" data-index="${index}" class="cart-quantity-input" style="width:60px; text-align:center;"/>
                    </td>
                    <td>${displayPricePerUnit} د.ع</td>
                    <td>${itemSubtotal} د.ع</td>
                  <td class="action-cell">
    <button data-index="${index}" class="remove-btn"><i class="fas fa-trash-alt"></i></button>
</td>
                `;
                cartTableBody.appendChild(tr);
            });
            if (cartEl) cartEl.classList.remove('hidden');
        }
        
        if (cartTotalEl) cartTotalEl.textContent = total.toLocaleString();
        
        // الحفظ
        if (currentCartView === 'scanner') {
            if (typeof saveScannerCart === 'function') saveScannerCart();
        } else {
            saveCart();
        }

        bindCartEvents();
        updateNavbarCartCount();
    }

    // وظيفة ربط أحداث السلة (تغيير الكمية، حذف)
    function bindCartEvents() {
        if (!cartTableBody) return;
        
        // اختيار السلة النشطة
        const targetCart = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') ? scannerCart : cart;

        cartTableBody.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
             const idx = parseInt(e.target.getAttribute('data-index'));
let val = parseFloat(e.target.value);
const item = targetCart[idx];

if (item.isSoldByPrice) {
    if (isNaN(val) || val < 250) val = 250;
    // التعديل هنا: إضافة الحد الأقصى للسعر
    if (val > 25000) { val = 25000; showNotification('الحد الأقصى 25,000 د.ع', 'error'); }
    if (val % 250 !== 0) val = Math.round(val / 250) * 250;
} else {
    if (isNaN(val) || val < 1) val = 1;
    // التعديل هنا: إضافة الحد الأقصى للعدد
    if (val > 50) { val = 50; showNotification('الحد الأقصى 50 قطعة', 'error'); }
}
item.quantity = val;
updateCartUI();
            });
        });

        cartTableBody.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.closest('button').getAttribute('data-index'));
                if (confirm('هل أنت متأكد من حذف هذا المنتج من السلة؟')) {
                    const removedProductName = targetCart[idx].product.name;
                    targetCart.splice(idx, 1);
                    showNotification(`تم حذف "${removedProductName}" من السلة.`, 'error');
                    updateCartUI();
                }
            });
        });
    }

    // زر إتمام الطلب (Checkout)
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const targetCart = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') ? scannerCart : cart;
            if (targetCart.length === 0) {
                showNotification('سلة الطلبات فارغة!', 'error');
                return;
            }
            if (checkoutSection) {
                checkoutSection.classList.remove('hidden');
                checkoutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

// ==========================================
    // تحديث زر "تأكيد الطلب" (إصلاح الخطأ الذي يوقف سلة الماسح)
    // ==========================================
    
    // 1. تعريف دالة التحقق من الهاتف (لضمان وجودها)
    function validatePhone(phone) {
        const regex = /^07[0-9]{9}$/;
        return regex.test(phone);
    }

    // 2. معالجة زر التأكيد بأمان تام
    const currentConfirmBtn = document.getElementById('confirm-btn');

    // الشرط التالي هو الأهم: لن يعمل الكود إلا إذا كان الزر موجوداً في الصفحة
    if (currentConfirmBtn && currentConfirmBtn.parentNode) {
        
        const newConfirmBtn = currentConfirmBtn.cloneNode(true);
        currentConfirmBtn.parentNode.replaceChild(newConfirmBtn, currentConfirmBtn);

        newConfirmBtn.addEventListener('click', () => {
            // تحديد السلة النشطة
            const targetCart = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') ? scannerCart : cart;
            const sourceLabel = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') ? 'scanner' : 'app';

            // قراءة الحقول
            const phoneEl = document.getElementById('phone');
            const locationEl = document.getElementById('location');
            const notesEl = document.getElementById('notes');
            const nameEl = document.getElementById('customer-name');

            const phone = phoneEl ? phoneEl.value.trim() : '';
            const location = locationEl ? locationEl.value.trim() : '';
            const notes = notesEl ? notesEl.value.trim() : '';
            const customerNameVal = (nameEl && nameEl.value.trim() !== "") ? nameEl.value.trim() : "زبون";

            // التحقق من صحة البيانات
            if (targetCart.length === 0) {
                showNotification('السلة فارغة!', 'error');
                return;
            }
            if (!validatePhone(phone)) {
                showNotification('يرجى إدخال رقم هاتف صحيح (07XXXXXXXXX).', 'error');
                if(phoneEl) phoneEl.focus();
                return;
            }
            if (!location) {
                showNotification('يرجى إدخال الموقع.', 'error');
                if(locationEl) locationEl.focus();
                return;
            }

            // الحفظ
            newConfirmBtn.textContent = 'جاري الحفظ...';
            newConfirmBtn.disabled = true;

            const now = new Date();
            const order = {
                orderId: Date.now(),
                orderSource: sourceLabel,
                customerName: customerNameVal,
                phone: phone,
                location: location,
                notes: notes,
                date: now.toLocaleDateString('en-GB'),
                time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace('AM', 'ص').replace('PM', 'م'),
                items: targetCart.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    isSoldByPrice: item.isSoldByPrice || false,
                    variant: item.variant 
                })),
                total: targetCart.reduce((sum, item) => {
                    let price = item.product.price;
                    if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
                    return sum + (item.isSoldByPrice ? item.quantity : price * item.quantity);
                }, 0),
                status: 'قيد المراجعة'
            };

            orders.unshift(order);
            saveOrders();

            // تفريغ السلة المناسبة
            if (sourceLabel === 'scanner') {
                scannerCart.length = 0;
                saveScannerCart();
            } else {
                cart.length = 0;
                saveCart();
            }

            updateCartUI();
            showNotification('تم الطلب بنجاح!', 'success');
            
            setTimeout(() => {
                if(checkoutSection) checkoutSection.classList.add('hidden');
                newConfirmBtn.textContent = 'تأكيد الطلب';
                newConfirmBtn.disabled = false;
                window.location.href = 'orders.html';
            }, 1500);
        });
    }
    // زر تفريغ السلة
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من تفريغ سلة المشتريات بالكامل؟')) {
                if (typeof currentCartView !== 'undefined' && currentCartView === 'scanner') {
                    scannerCart.length = 0;
                    if (typeof saveScannerCart === 'function') saveScannerCart();
                } else {
                    cart.length = 0;
                    saveCart();
                }
                updateCartUI();
                showNotification('تم تفريغ السلة.', 'error');
            }
        });
    }
    // ==========================================
    // دالة البحث المفقودة (أضف هذا الكود لإصلاح الخطأ)
    // ==========================================
    function handleSearch() {
        // محاولة العثور على حقل البحث (سواء في الناف بار أو الصفحة الرئيسية)
        const input = document.getElementById('navbar-search-input') || document.getElementById('search-input');
        
        // إذا لم نجد الحقل، نخرج من الدالة
        if (!input) return;

        const query = input.value.trim().toLowerCase();
        
        // إذا كان حقل البحث فارغاً
        if (!query) {
            // نعيد عرض المنتجات حسب القسم الحالي
            if (typeof currentCategory !== 'undefined' && currentCategory && currentCategory !== 'all') {
                const defaultProducts = products.filter(p => p.category === currentCategory);
                if (typeof displayProducts === 'function') displayProducts(defaultProducts);
                if (categoryTitleEl) categoryTitleEl.textContent = categoryNames[currentCategory] || 'المنتجات';
            } else {
                // أو نعرض كل المنتجات
                if (typeof displayProducts === 'function') displayProducts(products);
                if (categoryTitleEl) categoryTitleEl.textContent = 'جميع المنتجات';
            }
            return;
        }

        // تصفية المنتجات
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.barcode && p.barcode.includes(query)) ||
            (p.id && p.id.toString().includes(query))
        );

        // عرض النتائج
        if (typeof displayProducts === 'function') displayProducts(filtered);
        
        // تحديث العنوان
        if (categoryTitleEl) categoryTitleEl.textContent = `نتائج البحث عن: "${query}"`;
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            // في حالة مسح البحث، نعتمد على الحالة الأصلية للصفحة
            if (isCategoryProductsPage) {
                initializeApp(); // إعادة تحميل المنتجات الخاصة بالقسم
            } else if (isIndexPage) {
                displayFeaturedProducts();
            } else if (isWishlistPage) {
                filterWishlistByCategory('all'); // إعادة عرض كل المفضلة
            }
        });
    }

    // ربط أحداث صفحة المفضلة
    if (isWishlistPage) {
        // تطبيق الأنماط الأساسية للترتيب العمودي
        // تم نقل هذا المنطق إلى هنا لضمان تنفيذه فقط في صفحة المفضلة
        if (wishlistProductsListEl) {
            wishlistProductsListEl.style.setProperty('display', 'flex', 'important');
            wishlistProductsListEl.style.setProperty('flex-direction', 'column', 'important');
            wishlistProductsListEl.style.setProperty('flex-wrap', 'nowrap', 'important');
            wishlistProductsListEl.style.setProperty('overflow-x', 'hidden', 'important');
            wishlistProductsListEl.style.setProperty('scroll-snap-type', 'unset', 'important');
            wishlistProductsListEl.style.setProperty('-webkit-overflow-scrolling', 'unset', 'important');
            wishlistProductsListEl.style.setProperty('justify-content', 'center', 'important');
            wishlistProductsListEl.style.setProperty('align-items', 'center', 'important');
            wishlistProductsListEl.style.setProperty('gap', '20px', 'important');
            wishlistProductsListEl.style.setProperty('padding', '0 10px', 'important');
            wishlistProductsListEl.style.setProperty('width', '100%', 'important');
            wishlistProductsListEl.style.setProperty('margin-top', '25px', 'important');
        }

        // دالة لتطبيق أنماط الـ Media Query عبر JavaScript
        function applyWishlistResponsiveStyles() {
            if (!wishlistProductsListEl) return;

            const productItems = wishlistProductsListEl.querySelectorAll('.product-item');
            productItems.forEach(item => {
                item.style.setProperty('text-align', 'center', 'important');
                item.style.setProperty('align-items', 'center', 'important');

                const productTextInfo = item.querySelector('.product-text-info');
                if (productTextInfo) {
                    productTextInfo.style.setProperty('align-items', 'center', 'important');
                    productTextInfo.style.setProperty('text-align', 'center', 'important');
                }
                const productActions = item.querySelector('.product-actions');
                if (productActions) {
                    productActions.style.setProperty('align-items', 'center', 'important');
                }
            });

            if (window.innerWidth <= 768) {
                wishlistProductsListEl.style.setProperty('gap', '15px', 'important');
                wishlistProductsListEl.style.setProperty('padding', '0 5px', 'important');
                productItems.forEach(item => {
                    item.style.setProperty('max-width', '100%', 'important'); 
                });
            } else if (window.innerWidth <= 480) {
                 wishlistProductsListEl.style.setProperty('gap', '10px', 'important');
                 wishlistProductsListEl.style.setProperty('padding', '0', 'important');
                 productItems.forEach(item => {
                    item.style.setProperty('max-width', '100%', 'important');
                });
            } else {
                wishlistProductsListEl.style.setProperty('gap', '20px', 'important');
                wishlistProductsListEl.style.setProperty('padding', '0 10px', 'important');
                productItems.forEach(item => {
                    item.style.setProperty('max-width', '600px', 'important');
                });
            }
        }
        window.addEventListener('resize', applyWishlistResponsiveStyles);

        if (clearWishlistBtn) {
            clearWishlistBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من تفريغ قائمة المفضلة بالكامل؟')) {
                    wishlist = [];
                    saveWishlist();
                    filterWishlistByCategory('all');
                    populateCategoryDropdown();
                    updateNavbarCartCount();
                    showNotification('تم تفريغ قائمة المفضلة.', 'error');
                }
            });
        }

        if (toggleCategoriesBtn) {
            toggleCategoriesBtn.addEventListener('click', () => {
                categoryDropdownMenu.classList.toggle('show');
                toggleCategoriesBtn.querySelector('.dropdown-icon').classList.remove('rotate'); // إزالة rotate عند الفتح
                // لإظهار الرمز بشكل صحيح عند الفتح والإغلاق
                if (categoryDropdownMenu.classList.contains('show')) {
                     toggleCategoriesBtn.querySelector('.dropdown-icon').classList.add('rotate');
                }
            });
        }

        if (showAllWishlistBtn) {
            showAllWishlistBtn.addEventListener('click', () => {
                currentWishlistFilterCategory = 'all';
                filterWishlistByCategory('all');
                categoryDropdownMenu.classList.remove('show');
                toggleCategoriesBtn.querySelector('.dropdown-icon').classList.remove('rotate');
                categoryDropdownMenu.querySelectorAll('a').forEach(a => a.classList.remove('active-filter'));
                showAllWishlistBtn.classList.add('active-filter');
            });
        }

        document.addEventListener('click', (event) => {
            if (categoryDropdownMenu && !categoryDropdownMenu.contains(event.target) && !toggleCategoriesBtn.contains(event.target)) {
                categoryDropdownMenu.classList.remove('show');
                toggleCategoriesBtn.querySelector('.dropdown-icon').classList.remove('rotate');
            }
        });
    } // نهاية if (isWishlistPage)


// في ملف script.js (الجزء الخاص بشريط التنقل المتجاوب)

    // شريط التنقل المتجاوب (Responsive Navbar)
    if (menuToggle && navLinks) {
        function setMenuTogglePosition() {
            if (window.innerWidth <= 768) {
                const navbarHeight = mainNavbar.offsetHeight;
                const toggleHeight = menuToggle.offsetHeight;
                menuToggle.style.position = 'absolute';
                menuToggle.style.top = `${(navbarHeight - toggleHeight) / 2}px`; 
                menuToggle.style.left = '0px';
                menuToggle.style.right = 'auto';
                menuToggle.style.setProperty('left', '0px', 'important');
            } else {
                menuToggle.style.position = '';
                menuToggle.style.top = '';
                menuToggle.style.left = '';
                menuToggle.style.right = '';
            }
        }

        function toggleMobileMenu() {
            const willBeActive = !navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            if (willBeActive) {
                menuToggle.classList.add('active');
            } else {
                menuToggle.classList.remove('active');
            }
            
            menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
            setMenuTogglePosition();
        }

        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMobileMenu();
        });

        // **التعديل الجديد يبدأ هنا**
        // أضف معالج أحداث لكل رابط داخل القائمة لإغلاقها عند النقر
        navLinks.querySelectorAll('a').forEach(link => { //
            link.addEventListener('click', (event) => { //
                // إذا لم نكن في الصفحة الرئيسية أو إذا كان الرابط يؤدي إلى صفحة مختلفة، دعه يختفي تلقائياً
                // أما إذا كنا في الصفحة الرئيسية والرابط هو لـ Anchor (#)، فنحن بحاجة لإغلاقه يدوياً
                const href = link.getAttribute('href'); //
                const isAnchorLink = href && href.startsWith('#'); //
                const isCurrentPage = currentPage === 'index.html' || currentPage === ''; //

                // أغلق القائمة في كل الحالات بعد النقر على الرابط
                if (navLinks.classList.contains('active')) { //
                    toggleMobileMenu(); //
                }
            });
        });
        // **التعديل الجديد ينتهي هنا**

        document.addEventListener('click', (event) => {
            if (navLinks.classList.contains('active') && 
                !menuToggle.contains(event.target) && 
                !navLinks.contains(event.target)) {
                
                toggleMobileMenu();
            }
        });
        
        if (menuToggle) menuToggle.setAttribute('role', 'button');
        if (menuToggle) menuToggle.setAttribute('aria-haspopup', 'true');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');

        window.addEventListener('resize', setMenuTogglePosition);
        setMenuTogglePosition();
    }

// ==========================================
    //  نظام تسريع الموقع (تم التحديث لجلب البيانات الجديدة) ⚡
    // ==========================================
    async function fetchProductsWithCache() {
        // قمت بتغيير الاسم هنا إلى v3 لكي يجبر النظام على تحميل الملفات الجديدة التي تحتوي على الباركود
        const CACHE_KEY = 'spiceShopProductsData_v3'; 
        const CACHE_DURATION = 1000 * 60 * 60; // ساعة واحدة

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { timestamp, data } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    console.log('⚡ تم تحميل المنتجات من الذاكرة (Cache)');
                    return data;
                }
            } catch (e) {
                console.warn('بيانات الكاش تالفة.');
            }
        }

        console.log('🔄 جاري تحميل المنتجات الجديدة من السيرفر...');
        const allJsonFilesPaths = CATEGORY_JSON_FILES.map(file => `json/${file}`);
        let allProductsFromFiles = [];

        try {
            const responses = await Promise.all(allJsonFilesPaths.map(url => fetch(url).then(res => res.json())));
            responses.forEach(data => {
                allProductsFromFiles = allProductsFromFiles.concat(data);
            });

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: allProductsFromFiles
            }));
            
            return allProductsFromFiles;

        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            if (cached) return JSON.parse(cached).data;
            return [];
        }
    }
 // ✅ ضع هذا الكود الجديد بدلاً منه 👇

    // ==========================================
    // 🛠️ دالة إصلاح الصور والبيانات القديمة (جديد)
    // ==========================================
    function syncStoredDataWithFreshProducts() {
        let cartUpdated = false;
        let wishlistUpdated = false;

        // 1. تحديث السلة (Cart)
        cart.forEach(cartItem => {
            const freshProduct = products.find(p => p.globalId === cartItem.product.globalId);
            if (freshProduct) {
                // تحديث الصورة والاسم والسعر
                cartItem.product.image = freshProduct.image;
                cartItem.product.name = freshProduct.name;
                if (!cartItem.isSoldByPrice) {
                    cartItem.product.price = freshProduct.price;
                }
                // تحديث صورة النوع (Variant)
                if (cartItem.variant) {
                    const freshVariant = freshProduct.variants ? freshProduct.variants.find(v => v.value === cartItem.variant.value) : null;
                    if (freshVariant) {
                        cartItem.variant = freshVariant; 
                    }
                }
                cartUpdated = true;
            }
        });

        // 2. تحديث المفضلة (Wishlist)
        const newWishlist = [];
        wishlist.forEach(wishlistItem => {
            const freshProduct = products.find(p => p.globalId === wishlistItem.globalId);
            if (freshProduct) {
                newWishlist.push(freshProduct); // استبدال القديم بالجديد
                wishlistUpdated = true;
            }
        });
        
        if (wishlistUpdated) {
            wishlist = newWishlist;
            saveWishlist();
            console.log('✅ تم تحديث صور وبيانات المفضلة.');
        }

        if (cartUpdated) { 
            saveCart(); 
            console.log('✅ تم تحديث صور وبيانات السلة.'); 
        }
    }
// ============================================================
    // دالة عرض المنتجات (تم إصلاح مشكلة الثقل والتعليق)
    // ============================================================
    function displayProducts(productsToShow) {
        if (!productsListEl) return;

        productsListEl.innerHTML = '';
        
        let filteredProducts = productsToShow;

        if (filteredProducts.length === 0) {
            productsListEl.innerHTML = '<p style="text-align: center; color: var(--light-text);">عفواً، لم يتم العثور على منتجات في هذا القسم أو تطابق بحثك.</p>';
            return;
        }

        filteredProducts.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product';
            
            const isFav = wishlist.some(item => item.globalId === p.globalId);
            const isSoldByPriceCurrent = ['spices', 'nuts'].includes(p.category);
            const hasVariants = p.variants && p.variants.length > 0;

            div.innerHTML = `
                <a href="product-details.html?globalId=${p.globalId}" class="product-link" aria-label="عرض تفاصيل المنتج ${p.name}">
                    <div class="product-info">
                        <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy" onerror="this.onerror=null; this.src='logo.png';"> 
                        <div class="product-text-content">
                            <strong>(${p.id}) ${p.name}</strong>
                            <span class="product-price-inline">السعر: ${p.price} د.ع / ${isSoldByPriceCurrent ? 'كيلو' : 'قطعة'}</span>
                        </div>
                    </div>
                </a>
                <div class="product-actions">
                    ${hasVariants ? 
                        `<button class="view-details-btn" data-global-id="${p.globalId}" aria-label="اختر أنواع ${p.name}">
                            <i class="fas fa-info-circle"></i> اختر النوع
                        </button>`
                        :
                        `<button class="add-btn" data-global-id="${p.globalId}" aria-label="أضف ${p.name} إلى السلة">
                            <i class="fas fa-cart-plus"></i> أضف للسلة
                        </button>`
                    }
                    <button class="add-to-wishlist-btn ${isFav ? 'active' : ''}" data-global-id="${p.globalId}" aria-label="${isFav ? 'إزالة من المفضلة' : 'أضف إلى المفضلة'}">
                        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            `;
            productsListEl.appendChild(div);
        });

        // --- إعادة تفعيل الأزرار ---
        productsListEl.querySelectorAll('.add-to-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                if(typeof toggleWishlist === 'function') toggleWishlist(globalProductId, e.currentTarget);
            });
        });
        
        productsListEl.querySelectorAll('button.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                const product = products.find(p => p.globalId === globalProductId);
                const isSoldByPriceCurrent = ['spices', 'nuts'].includes(product.category);
                if(typeof addToCart === 'function') addToCart(globalProductId, isSoldByPriceCurrent ? 1000 : 1, isSoldByPriceCurrent);
            });
        });

        productsListEl.querySelectorAll('button.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const globalProductId = e.currentTarget.getAttribute('data-global-id');
                window.location.href = `product-details.html?globalId=${globalProductId}`;
            });
        });
    }
    // ============================================================
    // هنا تبدأ دالة initializeApp الموجودة عندك أصلاً...
    // ============================================================
// ==========================================
    // تهيئة التطبيق (النسخة النهائية المصلحة)
    // ==========================================
    async function initializeApp() {
        try {
            // 1. تحميل أسماء الأقسام
            const categoriesResponse = await fetch('category_names.json');
            categoryNames = await categoriesResponse.json();

            // 2. تحميل المنتجات وضمان تعبئة المصفوفة العالمية لمنع "التصفير"
            if (typeof fetchProductsWithCache === 'function') {
                products = await fetchProductsWithCache();
            } else {
                console.log('Fetching products normally...');
                const allJsonFilesPaths = CATEGORY_JSON_FILES.map(file => `json/${file}`);
                let loadedProducts = [];
                for (const filePath of allJsonFilesPaths) {
                    try {
                        const response = await fetch(filePath);
                        const data = await response.json();
                        loadedProducts = loadedProducts.concat(data);
                    } catch (e) { console.error(`خطأ في تحميل ${filePath}:`, e); }
                }
                products = loadedProducts;
            }

            // 3. تحميل كافة السلال والبيانات المخزنة
            loadCart();
            loadScannerCart(); // ضروري لاسترجاع بيانات الماسح
            loadOrders();
            loadWishlist();

            // 4. تحديث الصور والأسعار في السلة فوراً
            if (typeof syncStoredDataWithFreshProducts === 'function') {
                syncStoredDataWithFreshProducts();
            }

            // 5. منطق توجيه الصفحات وعرض المنتجات
            if (isCartPage) {
                if (checkoutSection) checkoutSection.classList.add('hidden');
                updateCartUI();
            } 
            else if (isCategoryProductsPage) {
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                const searchParam = urlParams.get('search');

                if (searchParam) {
                    if (searchInput) searchInput.value = searchParam;
                    if (categoryTitleEl) categoryTitleEl.textContent = `نتائج البحث عن: ${searchParam}`;
                    
                    // إصلاح: التأكد من وجود دالة البحث قبل استدعائها لمنع الخطأ
                    if (typeof handleSearch === 'function') {
                        handleSearch(); 
                    } else {
                        // حل بديل سريع إذا كانت الدالة مفقودة
                        const filtered = products.filter(p => 
                            p.name.toLowerCase().includes(searchParam.toLowerCase())
                        );
                        displayProducts(filtered);
                    }
                } else {
                    currentCategory = categoryParam || 'all';
                    if (categoryTitleEl) {
                        categoryTitleEl.textContent = categoryNames[currentCategory] || 'جميع المنتجات';
                    }
                    
                    // الفلترة من المصفوفة التي تأكدنا من تحميلها أعلاه
                    const productsForCategory = (currentCategory === 'all') 
                        ? products 
                        : products.filter(p => p.category === currentCategory);
                        
                    displayProducts(productsForCategory);
                }
            } 
            else if (isProductDetailsPage) {
                const urlParams = new URLSearchParams(window.location.search);
                const globalId = urlParams.get('globalId');
                if (globalId) {
                    currentGlobalProductId = globalId;
                    displayProductDetails(globalId);
                }
            } 
            else if (isWishlistPage) {
                if (typeof filterWishlistByCategory === 'function') filterWishlistByCategory('all');
                if (typeof populateCategoryDropdown === 'function') populateCategoryDropdown();
            } 
            else if (isIndexPage) {
                if (typeof displayFeaturedProducts === 'function') displayFeaturedProducts();
            } 
            else if (isOrdersPage) {
                if (typeof displayOrders === 'function') displayOrders();
            }

            // 6. تحديث عدادات الناف بار
            updateNavbarCartCount();

        } catch (error) {
            console.error('حدث خطأ أثناء تشغيل التطبيق:', error);
        }
    }

    // تشغيل الدالة
    initializeApp();
// ============================================================
// 1. وظيفة عرض الطلبات (تم التعديل: تصميم مرتب ومنع التداخل)
// ============================================================
function displayOrders() {
    if (!ordersListEl) return;

    // رأس القائمة (البحث وزر الحذف)
    let head = `
        <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
            <input type="text" id="order-search" placeholder="🔍 ابحث برقم الطلب أو اسم الزبون..." 
                   style="width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd;">
            <button id="del-all-btn" style="background: #fff; color: #d63031; border: 1px solid #d63031; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-trash-sweep"></i> مسح جميع الطلبات
            </button>
        </div>`;

    if (orders.length === 0) {
        ordersListEl.innerHTML = head + '<div class="card" style="text-align: center; padding: 20px; color: #777;"><p>لا توجد طلبات سابقة حتى الآن.</p></div>';
    } else {
        let html = head;
        
        // فرز المصفوفة: الأحدث أولاً
        const sortedOrders = orders.slice().sort((a, b) => b.orderId - a.orderId);

        sortedOrders.forEach((order) => {
            // بيانات العرض
            const displayTime = order.time || 'غير محدد';
            const displayDate = order.date || 'غير محدد';
            
            // ألوان الحالة
            const isSent = order.status === 'تم الإرسال';
            const statusColor = isSent ? '#27ae60' : '#f39c12'; 
            const statusBg = isSent ? '#e8f8f5' : '#fef9e7';

            // تحديد مصدر الطلب (الماسح أم التطبيق) والألوان
            const sourceText = (order.orderSource === 'scanner') ? 'سلة الماسح' : 'سلة التطبيق';
            const sourceBadgeColor = (order.orderSource === 'scanner') ? '#e65100' : '#2980b9'; // برتقالي للماسح، أزرق للتطبيق

            html += `
            <div class="card order-item" style="padding: 15px; margin-bottom: 15px; border-radius: 12px; border-right: 6px solid ${statusColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: white;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #333; font-size: 1.2rem;">#${order.orderId}</h3>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">${order.status}</span>
                </div>
                
                <div style="text-align: right;">
                    <div style="margin-bottom: 8px;">
                        <span style="background:${sourceBadgeColor}; color:white; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; display: inline-block;">
                           <i class="fas ${order.orderSource === 'scanner' ? 'fa-barcode' : 'fa-shopping-basket'}"></i> ${sourceText}
                        </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #2c3e50; font-size: 1.1em;">
                            <i class="fas fa-user-circle" style="color:#bdc3c7;"></i> ${order.customerName || 'زبون'}
                        </h4>
                        <h4 style="margin: 0; color: #d35400; font-size: 1.3em; font-weight: 800;">
                            ${order.total} د.ع
                        </h4>
                    </div>
                    
                    <div style="color: #555; font-size: 0.95em; line-height: 1.6;">
                        <p style="margin: 0;"><i class="fas fa-phone fa-fw" style="color:#7f8c8d;"></i> ${order.phone}</p>
                        <p style="margin: 4px 0 0 0;"><i class="fas fa-map-marker-alt fa-fw" style="color:#7f8c8d;"></i> ${order.location || 'غير محدد'}</p>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee; display: flex; gap: 15px; font-size: 0.85em; color: #95a5a6;">
                    <span><i class="far fa-calendar-alt"></i> ${displayDate}</span>
                    <span><i class="far fa-clock"></i> ${displayTime}</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <button class="wa-btn" data-id="${order.orderId}" style="background: #25D366; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fab fa-whatsapp" style="font-size: 1.2em;"></i> إرسال واتساب
                    </button>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="pdf-btn" data-id="${order.orderId}" style="background: #0984e3; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                        
                        <button class="del-btn" data-id="${order.orderId}" style="background: #fff; color: #d63031; border: 1px solid #ffccd5; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            </div>`;
        });
        ordersListEl.innerHTML = html;

        // تفعيل الأزرار
        document.getElementById('order-search').addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const cards = ordersListEl.querySelectorAll('.order-item');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(val) ? 'block' : 'none';
            });
        });

        document.getElementById('del-all-btn').addEventListener('click', () => {
            if (confirm('سيتم مسح جميع سجلات الطلبات نهائياً، هل أنت متأكد؟')) {
                orders = [];
                saveOrders();
                displayOrders();
                showNotification('تم مسح السجل بالكامل', 'error');
            }
        });

        ordersListEl.querySelectorAll('.wa-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-id'));
                const order = orders.find(o => o.orderId === orderId);
                if(order) sendOrderToWhatsApp(order);
            });
        });

        ordersListEl.querySelectorAll('.pdf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-id'));
                const order = orders.find(o => o.orderId === orderId);
                if(order) downloadOrderPDF(order);
            });
        });

        ordersListEl.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-id'));
                if (confirm('هل تريد حذف سجل هذا الطلب؟')) {
                    orders = orders.filter(o => o.orderId !== orderId);
                    saveOrders();
                    displayOrders();
                    showNotification('تم حذف السجل', 'error');
                }
            });
        });
    }
}

// 2. وظيفة المساعدة: إرسال واتساب (محدثة)
function sendOrderToWhatsApp(order) {
    const sourceText = (order.orderSource === 'scanner') ? 'سلة الماسح' : 'سلة التطبيق';
    const customerName = order.customerName || "زبون";
    
    let message = `*📦 طلب جديد (${sourceText})*\n`; // تمت إضافة المصدر هنا
    message += `*👤 الاسم:* ${customerName}\n`;
    message += `*📱 رقم الهاتف:* ${order.phone}\n\n`;
    message += `*رقم الطلب:* ${order.orderId}\n`;
    message += `*📅 التاريخ:* ${order.date}\n`;
    message += `*⏰ الوقت:* ${order.time}\n`;
    message += `*📍 الموقع:* ${order.location}\n`;
    message += `\n*🛒 تفاصيل المنتجات:*\n`;

    order.items.forEach(item => {
        // نستخدم الاسم المحفوظ لضمان عدم ظهور undefined
        const itemName = item.name || 'منتج';
        if (item.isSoldByPrice) {
            message += `- ${itemName}: ${item.quantity} د.ع\n`;
        } else {
            message += `- ${itemName}: ${item.quantity} × ${item.price} د.ع\n`;
        }
    });

    message += `\n*💰 المجموع الكلي: ${order.total} د.ع*`;
    message += `\n\n*بانتظار تأكيد الطلب...*`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/9647816780645?text=${encodedMessage}`;
    
    order.status = 'تم الإرسال';
    saveOrders();
    displayOrders(); 
    window.open(whatsappUrl, '_blank');
}

// 3. وظيفة المساعدة: طباعة PDF (محدثة)
function downloadOrderPDF(order) {
    const sourceText = (order.orderSource === 'scanner') ? 'سلة الماسح' : 'سلة التطبيق';
    const printWindow = window.open('', '_blank');
    
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name || 'غير معروف'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${item.isSoldByPrice ? item.quantity + ' د.ع' : item.quantity}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${item.isSoldByPrice ? item.quantity : item.price * item.quantity} د.ع
            </td>
        </tr>`).join('');

    const content = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; margin-bottom: 5px;">سنتر الرضا</h2>
            <p style="text-align: center; margin-top: 0; color: #666; font-size: 14px;">فاتورة طلب - (${sourceText})</p>
            <hr style="border: 1px dashed #ccc;">
            <p><strong>الاسم:</strong> ${order.customerName || 'زبون'}</p>
            <p><strong>الهاتف:</strong> ${order.phone}</p> 
            <p><strong>رقم الفاتورة:</strong> #${order.orderId}</p>
            <p><strong>التاريخ:</strong> ${order.date} | <strong>الوقت:</strong> ${order.time}</p>
            <p><strong>العنوان:</strong> ${order.location}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead><tr style="background: #f1f1f1;">
                    <th style="border: 1px solid #ddd; padding: 8px;">المنتج</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">الكمية</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">السعر</th>
                </tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <h3 style="text-align: left; margin-top: 20px;">المجموع النهائي: ${order.total} د.ع</h3>
            <p style="text-align: center; margin-top: 50px; font-size: 12px;">شكراً لتسوقكم معنا</p>
        </div>`;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

// ============================================================
// 4. إصلاح زر تأكيد الطلب (مهم جداً لحفظ الأسماء والمصدر)
// ============================================================
const checkoutConfirmBtn = document.getElementById('confirm-btn');

if (checkoutConfirmBtn && checkoutConfirmBtn.parentNode) {
    
    // استنساخ الزر لتنظيف الأحداث القديمة
    const newConfirmBtn = checkoutConfirmBtn.cloneNode(true);
    checkoutConfirmBtn.parentNode.replaceChild(newConfirmBtn, checkoutConfirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        // معرفة السلة الحالية والمصدر
        const isScanner = (typeof currentCartView !== 'undefined' && currentCartView === 'scanner');
        const targetCart = isScanner ? scannerCart : cart;
        const sourceLabel = isScanner ? 'scanner' : 'app';

        // قراءة البيانات
        const phoneVal = document.getElementById('phone').value.trim();
        const locVal = document.getElementById('location').value.trim();
        const notesVal = document.getElementById('notes').value.trim();
        const nameEl = document.getElementById('customer-name');
        const nameVal = (nameEl && nameEl.value.trim() !== "") ? nameEl.value.trim() : "زبون";

        // التحقق
        if (!targetCart || targetCart.length === 0) {
            showNotification('السلة فارغة!', 'error'); return;
        }
        if (!phoneVal.startsWith('07') || phoneVal.length < 11) {
            showNotification('رقم الهاتف غير صحيح.', 'error'); return;
        }
        if (!locVal) {
            showNotification('يرجى كتابة العنوان.', 'error'); return;
        }

        // الحفظ
        newConfirmBtn.textContent = 'جاري الحفظ...';
        newConfirmBtn.disabled = true;

        const now = new Date();
        const order = {
            orderId: Date.now(),
            orderSource: sourceLabel, // حفظ المصدر (scanner أو app)
            customerName: nameVal,
            phone: phoneVal,
            location: locVal,
            notes: notesVal,
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace('AM', 'ص').replace('PM', 'م'),
            // حفظ تفاصيل المنتجات بشكل صريح (الاسم والسعر)
            items: targetCart.map(item => ({
                id: item.product.id,
                name: item.product.name, // حفظ الاسم هنا
                price: item.product.price,
                quantity: item.quantity,
                isSoldByPrice: item.isSoldByPrice || false,
                variantName: item.variant ? item.variant.value : ''
            })),
            total: document.getElementById('cart-total').textContent,
            status: 'قيد المراجعة'
        };

        orders.unshift(order);
        saveOrders();

        // تفريغ السلة وتحديث الصفحة
        if (isScanner) { scannerCart = []; saveScannerCart(); } 
        else { cart = []; saveCart(); }

        updateCartUI();
        showNotification('تم إرسال الطلب بنجاح!', 'success');

        setTimeout(() => {
            document.querySelector('.checkout').classList.add('hidden');
            newConfirmBtn.textContent = 'تأكيد الطلب';
            newConfirmBtn.disabled = false;
            window.location.href = 'orders.html';
        }, 1500);
    });
}
    // إصلاح زر البحث (فتح/إغلاق النافذة المنبثقة)
    // ==========================================
    const searchTriggerBtn = document.getElementById('searchTriggerBtn'); // زر الموبايل
    const desktopSearchTrigger = document.getElementById('desktopSearchTrigger'); // زر الحاسوب
    const searchBoxContainer = document.getElementById('searchBoxContainer'); // النافذة المخفية
    const closeSearchBtn = document.getElementById('close-search-btn'); // زر الإغلاق X
    const navbarSearchInput = document.getElementById('navbar-search-input'); // حقل الكتابة
    const navbarSearchSubmit = document.getElementById('navbar-search-submit'); // زر العدسة داخل النافذة

    // دالة لفتح البحث
    function openSearch() {
        if (searchBoxContainer) {
            searchBoxContainer.classList.add('active');
            setTimeout(() => {
                if(navbarSearchInput) navbarSearchInput.focus(); // وضع المؤشر للكتابة فوراً
            }, 100);
        }
    }

    // دالة لإغلاق البحث
    function closeSearch() {
        if (searchBoxContainer) {
            searchBoxContainer.classList.remove('active');
        }
    }

    // تشغيل الأحداث (Events)
    if (searchTriggerBtn) searchTriggerBtn.addEventListener('click', openSearch);
    if (desktopSearchTrigger) {
        desktopSearchTrigger.addEventListener('click', (e) => {
            e.preventDefault(); // منع الرابط من الانتقال
            openSearch();
        });
    }
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

    // دالة تنفيذ البحث عند الضغط على زر العدسة الجديد
    function executeNavbarSearch() {
        const query = navbarSearchInput.value.trim();
        if (query) {
            // توجيه المستخدم لصفحة المنتجات مع كلمة البحث
            // ملاحظة: تأكد أن صفحة category-products.html تدعم استقبال البحث في الرابط
            window.location.href = `category-products.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (navbarSearchSubmit) navbarSearchSubmit.addEventListener('click', executeNavbarSearch);
    
    // البحث عند ضغط Enter
    if (navbarSearchInput) {
        navbarSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeNavbarSearch();
        });
    }
// ==========================================
    // 1. منطق التبويبات (إصلاح الانتقال واختفاء البيانات)
    // ==========================================
    if (isCartPage && tabAppCart && tabScannerCart) {
        
        // دالة لتفعيل سلة الماسح
        function activateScannerTab() {
            currentCartView = 'scanner'; // تحديد السلة الحالية
            
            // تحديث الأزرار
            tabScannerCart.classList.add('active');
            tabAppCart.classList.remove('active');
            
            // تحديث العناوين
            if(cartViewTitle) cartViewTitle.textContent = "تفاصيل المنتجات (سلة الماسح)";
            if(clearCartBtn) clearCartBtn.textContent = "تفريغ سلة الماسح";
            
            // أهم خطوة: التأكد من وجود بيانات وعرضها
            loadScannerCart(); 
            updateCartUI(); 
        }

        // دالة لتفعيل سلة التطبيق
        function activateAppTab() {
            currentCartView = 'app'; // تحديد السلة الحالية
            
            tabAppCart.classList.add('active');
            tabScannerCart.classList.remove('active');
            
            if(cartViewTitle) cartViewTitle.textContent = "تفاصيل المنتجات (سلة التطبيق)";
            if(clearCartBtn) clearCartBtn.textContent = "تفريغ سلة التطبيق";
            
            loadCart();
            updateCartUI();
        }

        // قراءة الرابط عند الفتح (إذا جاي من زر الماسح في الهيدر)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'scanner') {
            activateScannerTab();
        } else {
            activateAppTab(); // الافتراضي
        }

        // أحداث الضغط
        tabAppCart.addEventListener('click', activateAppTab);
        tabScannerCart.addEventListener('click', activateScannerTab);
    }
// ============================================================
//  نظام الماسح الضوئي (النسخة الخفيفة والسريعة) 📷
// ============================================================
{ 
    let isScanning = false;
    let currentScanMode = 'check'; 
    let html5QrCode = null; 
    let lastScannedCode = null; 
    let scanLockTimer = null;

    // تعريف العناصر
    const scannerModal = document.getElementById('scanner-modal');
    const scannerTriggerBtn = document.getElementById('barcodeTriggerBtn');
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    const scanResultEl = document.getElementById('scan-result');
    const scannerFooter = document.getElementById('scanner-footer'); // الفوتر السفلي فقط
    
    // عناصر النافذة المنبثقة
    const overlay = document.getElementById('product-found-overlay');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');
    const overlayImg = document.getElementById('found-img');
    const overlayName = document.getElementById('found-name');
    const overlayPrice = document.getElementById('found-price');

    // 1. أزرار التبديل
    const modeBtns = document.querySelectorAll('.mode-btn');
    if(modeBtns) {
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentScanMode = e.target.getAttribute('data-mode');

                if (currentScanMode === 'cart') {
                    if(scannerFooter) scannerFooter.classList.remove('hidden'); 
                    if(scanResultEl) scanResultEl.innerHTML = '🛒 الوضع: حاسبة المشتريات';
                    updateLocalScannerStats();
                } else {
                    if(scannerFooter) scannerFooter.classList.add('hidden');
                    if(scanResultEl) scanResultEl.innerHTML = '🔍 الوضع: كاشف السعر';
                }
            });
        });
    }

    // 2. تحديث الأرقام (والشريط العلوي)
    function updateLocalScannerStats() {
        if (typeof scannerCart === 'undefined') return;
        
        let totalQty = 0;
        let totalPrice = 0;

        scannerCart.forEach(item => {
            let itemPrice = item.product.price;
            if (item.variant && item.variant.price_modifier) itemPrice += item.variant.price_modifier;
            
            if (item.isSoldByPrice) {
                totalPrice += item.quantity;
                totalQty += 1; 
            } else {
                totalPrice += (itemPrice * item.quantity);
                totalQty += item.quantity;
            }
        });

        // تحديث الفوتر السفلي للماسح
        const scanTotalEl = document.getElementById('scan-total');
        const scanCountEl = document.getElementById('scan-count');
        if (scanCountEl) scanCountEl.textContent = scannerCart.length; 
        if (scanTotalEl) scanTotalEl.textContent = totalPrice.toLocaleString();
        
        // **هام:** تحديث الرقم في الشريط العلوي (Navbar)
        updateNavbarCartCount();
    }

    // 3. إغلاق النافذة المنبثقة
    if (closeOverlayBtn && overlay) {
        closeOverlayBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); 
            overlay.classList.add('hidden');
            setTimeout(() => { isScanning = false; lastScannedCode = null; }, 500);
            if(scanResultEl) scanResultEl.innerHTML = 'جاهز...';
        });
    }

    // 4. تشغيل الكاميرا (محسّن للسرعة)
    function startScannerLogic() {
        if (typeof Html5Qrcode === 'undefined') {
            if(scanResultEl) scanResultEl.innerHTML = "جاري تحميل المكتبة...";
            return;
        }

        if (html5QrCode) return; // الكاميرا تعمل مسبقاً

        html5QrCode = new Html5Qrcode("reader");
        
        // تقليل FPS إلى 10 يزيد الأداء ويقلل التأخير
        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 150 }, // تكبير مربع المسح قليلاً لسرعة الالتقاط
            aspectRatio: 1.0,
            disableFlip: false 
        };
        
        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccessHandler)
        .catch(err => {
            console.error("Error:", err);
            if(scanResultEl) scanResultEl.innerHTML = "تعذر فتح الكاميرا (تأكد من الصلاحيات)";
            // محاولة إعادة المحاولة في حال الفشل البسيط
            html5QrCode = null;
        });
    }

    // 5. زر فتح الماسح
    if (scannerTriggerBtn && scannerModal) {
        scannerTriggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scannerModal.classList.remove('hidden');
            // تأخير بسيط جداً لضمان رسم النافذة قبل طلب الكاميرا
            requestAnimationFrame(() => {
                startScannerLogic();
                updateLocalScannerStats();
            });
        });
    }

    // 6. زر إغلاق الماسح
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', () => {
            if (scannerModal) scannerModal.classList.add('hidden');
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                    html5QrCode = null;
                }).catch(err => { console.log(err); html5QrCode = null; });
            }
            isScanning = false;
            lastScannedCode = null;
        });
    }

    // 7. منطق المسح الناجح
    const onScanSuccessHandler = (decodedText, decodedResult) => {
        if (isScanning) return;
        
        const scannedCode = decodedText.trim();
        if (scannedCode === lastScannedCode) return; 

        const product = products.find(p => 
            p.id == scannedCode || p.globalId == scannedCode || (p.barcode && p.barcode.trim() == scannedCode)
        );

        if (product) {
            const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
            audio.play().catch(e => {});

            isScanning = true;
            lastScannedCode = scannedCode;

            if (currentScanMode === 'check') {
                if (overlayImg) overlayImg.src = product.image;
                if (overlayName) overlayName.textContent = product.name;
                if (overlayPrice) overlayPrice.innerHTML = `${product.price.toLocaleString()} <span class="currency-symbol">د.ع</span>`;
                
                // تنظيف وإظهار زر "متوفر"
                const foundContent = document.querySelector('.found-content');
                if (foundContent) {
                    Array.from(foundContent.children).forEach(child => {
                        if (!['IMG','H2'].includes(child.tagName) && !child.classList.contains('found-price') && child.id !== 'close-overlay-btn') {
                            if (!child.classList.contains('stock-status')) child.style.display = 'none';
                        }
                    });
                    const oldStatus = foundContent.querySelectorAll('.stock-status'); oldStatus.forEach(el => el.remove());
                    const statusDiv = document.createElement('div'); statusDiv.className = 'stock-status';
                    statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> متوفر';
                    foundContent.appendChild(statusDiv);
                }
                if (overlay) overlay.classList.remove('hidden');

            } else {
                // وضع الحاسبة
                const isSoldByPrice = ['spices', 'nuts'].includes(product.category);
                if (typeof scannerCart === 'undefined') scannerCart = [];
                
                const exist = scannerCart.find(item => item.product.globalId === product.globalId);
                let qtyToAdd = isSoldByPrice ? 1000 : 1;
                let currentQty = exist ? exist.quantity : 0;
                let newQty = currentQty + qtyToAdd;
                let limitReached = false;

                if (isSoldByPrice) {
                    if (newQty > 25000) { limitReached = true; if(scanResultEl) scanResultEl.innerHTML = `<span style="color:red; font-weight:bold;">❌ الحد الأقصى 25 ألف</span>`; }
                } else {
                    if (newQty > 50) { limitReached = true; if(scanResultEl) scanResultEl.innerHTML = `<span style="color:red; font-weight:bold;">❌ الحد الأقصى 50 قطعة</span>`; }
                }

                if (!limitReached) {
                    if (exist) { exist.quantity += qtyToAdd; }
                    else { scannerCart.push({ product: product, quantity: qtyToAdd, isSoldByPrice: isSoldByPrice }); }
                    
                    if (typeof saveScannerCart === 'function') saveScannerCart();
                    
                    // تحديث الأرقام والعداد العلوي
                    updateLocalScannerStats(); 
                    
                    if (scanResultEl) scanResultEl.innerHTML = `<span style="color:#27ae60; font-weight:bold;">✔ ${product.name}</span>`;
                }
                
                clearTimeout(scanLockTimer);
                scanLockTimer = setTimeout(() => { isScanning = false; lastScannedCode = null; if(scanResultEl) scanResultEl.innerHTML = 'جاهز...'; }, 1500); 
            }
        } else {
            isScanning = true;
            if (scanResultEl) scanResultEl.innerHTML = `<span style="color:red;">❌ غير معروف</span>`;
            setTimeout(() => { isScanning = false; }, 1500);
        }
    };
}
});