// في ملف script.js (استبدل الملف بالكامل بهذا الكود)

document.addEventListener('DOMContentLoaded', () => {

    let products = []; // سيتم تخزين جميع المنتجات هنا بعد دمجها من ملفات JSON المختلفة
    let cart = [];
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
        // 1. الموبايل (كما هو)
        const totalCartItems = cart.length; 
        if (navCartCountEl) {
            navCartCountEl.textContent = totalCartItems;
            navCartCountEl.style.display = totalCartItems > 0 ? 'flex' : 'none';
        }
        
        const totalWishlistItems = wishlist.length;
        if (navWishlistCountEl) {
            navWishlistCountEl.textContent = totalWishlistItems;
            navWishlistCountEl.style.display = totalWishlistItems > 0 ? 'inline-block' : 'none';
        }

        // 2. الحاسوب (تعديل: رقم فقط بدون أقواس)
        const desktopCartCountEl = document.getElementById('desktopCartCount');
        const desktopWishlistCountEl = document.getElementById('desktopWishlistCount');

        // السلة
        if (desktopCartCountEl) {
            desktopCartCountEl.textContent = totalCartItems; // رقم فقط
            // إظهار الرقم فقط اذا كان اكبر من صفر
            if (totalCartItems > 0) {
                desktopCartCountEl.style.display = 'inline-block';
            } else {
                desktopCartCountEl.style.display = 'none';
            }
        }

        // المفضلة
        if (desktopWishlistCountEl) {
            desktopWishlistCountEl.textContent = totalWishlistItems; // رقم فقط
            if (totalWishlistItems > 0) {
                desktopWishlistCountEl.style.display = 'inline-block';
            } else {
                desktopWishlistCountEl.style.display = 'none';
            }
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

    // وظيفة فلترة قائمة المفضلة حسب القسم
    function filterWishlistByCategory(category) {
        if (!wishlistProductsListEl) {
            console.error('wishlistProductsListEl element not found. Cannot filter wishlist.');
            return;
        }

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
            wishlistProductsListEl.innerHTML = '<p style="text-align: center; color: var(--light-text);">قائمة المفضلة فارغة حالياً أو لا توجد منتجات مفضلة في هذا القسم.</p>';
            return;
        }

        const groupedFilteredWishlist = filteredItems.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = [];
            }
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
                div.className = 'product-item';
                const isFav = wishlist.some(item => item.globalId === p.globalId);
                const isSoldByPriceWishlist = ['spices', 'nuts'].includes(p.category);
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
                        <button class="remove-from-wishlist-btn" data-global-id="${p.globalId}" aria-label="إزالة ${p.name} من المفضلة">
                            <i class="fas fa-trash-alt"></i> إزالة
                        </button>
                    </div>
                `;
                wishlistProductsListEl.appendChild(div);
                                                        
                // معالج لزر "أضف للسلة" للمنتجات التي لا تحتوي على متغيرات
                const addBtn = div.querySelector('.add-to-cart-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', (e) => {
                        const globalProductId = e.target.getAttribute('data-global-id');
                        const productToAdd = products.find(prod => prod.globalId === globalProductId);
                        const isSoldByPriceForAdd = ['spices', 'nuts'].includes(productToAdd.category);
                        addToCart(globalProductId, isSoldByPriceForAdd ? 1000 : 1, isSoldByPriceForAdd);
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
        // بعد تحديث القائمة، طبق الأنماط المتجاوبة
        if (isWishlistPage && wishlistProductsListEl) {
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
        if (!cartTableBody) {
             console.error('cartTableBody element not found. Cannot update cart UI.');
             showNotification('حدث خطأ في عرض السلة. يرجى إعادة تحميل الصفحة.', 'error');
             return;
        }

        cartTableBody.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">سلة المشتريات فارغة حالياً.</td></tr>';
            if (cartEl) cartEl.classList.add('hidden');
            if (checkoutSection) checkoutSection.classList.add('hidden');
        } else {
             cart.forEach((item, index) => {
                let itemSubtotal;
                let quantityDisplay;
                let displayName = item.product.name;
                let displayPricePerUnit = item.product.price;

                // تحسين عرض اسم المتغير لتجنب التكرار في السلة
                if (item.variant && item.variant.value) { // تحقق من وجود item.variant.value
                    // إذا كان اسم المنتج لا يتضمن قيمة المتغير بالفعل (لتجنب التكرار إذا تم حفظه مسبقًا)
                    if (!item.product.name.includes(`(${item.variant.value})`)) {
                         displayName = `${item.product.name} (${item.variant.value})`;
                    } else {
                        displayName = item.product.name; // استخدم الاسم المحفوظ إذا كان يشمل المتغير
                    }
                    
                    if (item.variant.price_modifier !== undefined) {
                        displayPricePerUnit = item.product.price + item.variant.price_modifier;
                    }
                }

                if (item.isSoldByPrice) {
                    itemSubtotal = item.quantity;
                    quantityDisplay = `بقيمة ${item.quantity} د.ع`;
                } else {
                    itemSubtotal = item.product.price * item.quantity;
                    if (item.variant && item.variant.price_modifier !== undefined) {
                         itemSubtotal = (item.product.price + item.variant.price_modifier) * item.quantity;
                    }
                    quantityDisplay = item.quantity;
                }
                total += itemSubtotal;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="display:flex; align-items:center; justify-content: flex-end;">
                            <span>${displayName}</span>
                            <img src="${item.variant && item.variant.image ? item.variant.image : item.product.image}" alt="${displayName}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; object-fit: cover;" loading="lazy">
                        </div>
                    </td>
                    <td>
                        <input type="number" min="${item.isSoldByPrice ? 250 : 1}" step="${item.isSoldByPrice ? 250 : 1}" value="${item.quantity}" data-index="${index}" class="cart-quantity-input" style="width:60px; text-align:center;" aria-label="تغيير الكمية لـ ${displayName}"/>
                    </td>
                    <td>${displayPricePerUnit} د.ع / ${item.isSoldByPrice ? 'كيلو' : 'قطعة'}</td>
                    <td>${itemSubtotal} د.ع</td>
                    <td>
                        <button data-index="${index}" class="remove-btn" aria-label="حذف ${displayName} من السلة">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                    </td>
                `;
                cartTableBody.appendChild(tr);
            });
            if (cartEl) cartEl.classList.remove('hidden');
        }
        
        if (cartTotalEl) cartTotalEl.textContent = total;
        saveCart();
        bindCartEvents();
        updateNavbarCartCount();
    }

    // وظيفة ربط أحداث السلة (تغيير الكمية، حذف)
    function bindCartEvents() {
        if (!cartTableBody) return;
        cartTableBody.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                let val = parseFloat(e.target.value);
                const item = cart[idx];

                if (item.isSoldByPrice) {
                    if (isNaN(val) || val < 250) val = 250;
                    if (val % 250 !== 0) {
                        val = Math.round(val / 250) * 250;
                        if (val === 0) val = 250;
                        showNotification('تم تعديل القيمة لأقرب مضاعف لـ 250.', 'info');
                    }
                } else {
                    if (isNaN(val) || val < 1) val = 1;
                }
                item.quantity = val;
                updateCartUI();
            });
        });
        cartTableBody.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('هل أنت متأكد من حذف هذا المنتج من السلة؟')) {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    const removedProductName = cart[idx].product.name;
                    cart.splice(idx, 1);
                    showNotification(`تم حذف "${removedProductName}" من السلة.`, 'error');
                    updateCartUI();
                }
            });
        });
    }

    // وظيفة التعامل مع البحث عن المنتجات
    function handleSearch() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        let productsToSearch;
        if (isCategoryProductsPage && currentCategory && currentCategory !== 'all') {
            productsToSearch = products.filter(p => p.category === currentCategory); // البحث ضمن منتجات القسم الحالي فقط
        } else {
            productsToSearch = products; // البحث في كل المنتجات للصفحات الأخرى
        }


        if (!searchTerm) {
            if (isCategoryProductsPage) {
                // إعادة عرض منتجات القسم الأصلي (غير مفلترة بالبحث)
                displayProducts(products.filter(p => p.category === currentCategory));
            } else if (isIndexPage) {
                displayFeaturedProducts();
            } else if (isWishlistPage) {
                filterWishlistByCategory(currentWishlistFilterCategory);
            }
            return;
        }

        const isNumeric = /^\d+$/.test(searchTerm);
        const filtered = productsToSearch.filter(p => {
            const matchesId = isNumeric && (p.id === parseInt(searchTerm) || p.globalId.includes(searchTerm));
            const matchesName = p.name.toLowerCase().includes(searchTerm);
            return matchesId || matchesName;
        });
        displayProducts(filtered);
    }

    // وظيفة التحقق من صحة رقم الهاتف
    function validatePhone(phone) {
        const regex = /^(07[0-9]{9}|(\+964)?[0-9]{10})$/;
        return regex.test(phone);
    }

    // وظيفة عرض الطلبات في orders.html
    function displayOrders() {
        if (!ordersListEl) return;

        if (orders.length === 0) {
            ordersListEl.innerHTML = '<div class="card" style="text-align: center; padding: 20px;"><p>لا توجد طلبات سابقة حتى الآن.</p></div>';
            return;
        }

        ordersListEl.innerHTML = '';
        orders.forEach((order, index) => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'card order-item';
            orderDiv.setAttribute('aria-labelledby', `order-id-${order.orderId || index + 1}`);
            orderDiv.innerHTML = `
                <div class="order-header">
                    <h3 id="order-id-${order.orderId || index + 1}">الطلب رقم: ${order.orderId || index + 1}</h3>
                    <span class="order-status ${order.status === 'قيد المراجعة' ? 'pending' : 'completed'}">${order.status}</span>
                </div>
                <p><strong>التاريخ:</strong> ${order.date}</p>
                <p><strong>رقم الهاتف:</strong> ${order.phone}</p>
                <p><strong>الموقع/العنوان:</strong> ${order.location || 'غير محدد'}</p> <p><strong>الملاحظات:</strong> ${order.notes || 'لا توجد ملاحظات.'}</p>
                <div class="order-items">
                    <h4>المنتجات المطلوبة:</h4>
                    <ul>
                        ${order.items.map(item => {
                            let itemDisplay;
                            let displayName = item.name;

                            // تحسين عرض اسم المتغير لتجنب التكرار في الطلبات
                            if (item.variant && item.variant.value) {
                                if (!item.name.includes(`(${item.variant.value})`)) {
                                     displayName = `${item.name} (${item.variant.value})`;
                                } else {
                                    displayName = item.name;
                                }
                            }

                            if (item.isSoldByPrice) {
                                itemDisplay = `${displayName} (بقيمة: ${item.quantity} د.ع)`;
                            } else {
                                itemDisplay = `${displayName} (الكمية: ${item.quantity}) بسعر ${item.price} د.ع / قطعة`;
                            }
                            return `<li> (${item.id}) ${itemDisplay}</li>`;
                        }).join('')}
                    </ul>
                </div>
                <p><strong>المجموع الكلي:</strong> ${order.total} د.ع</p>
            `;
            ordersListEl.appendChild(orderDiv);
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('سلة الطلبات فارغة!', 'error');
                return;
            }
            if (checkoutSection) {
                checkoutSection.classList.remove('hidden');
                checkoutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            // 1. جلب البيانات من الحقول
            const phone = phoneInput.value.trim();
            const location = locationInput.value.trim();
            const notes = notesInput.value.trim();
            
            // --- التعديل الأول: جلب الاسم بشكل صحيح ---
            const nameInput = document.getElementById('customer-name');
            // إذا كان الحقل فارغاً نستخدم كلمة "زبون"
            const customerNameVal = (nameInput && nameInput.value.trim() !== "") ? nameInput.value.trim() : "زبون";

            // التحققات (Validation)
            if (cart.length === 0) {
                showNotification('لا يمكنك إرسال طلب فارغ!', 'error');
                return;
            }
            if (!validatePhone(phone)) {
                showNotification('يرجى إدخال رقم هاتف صحيح.', 'error');
                phoneInput.focus();
                return;
            }
            if (!location) {
                showNotification('يرجى إدخال الموقع/العنوان.', 'error');
                locationInput.focus();
                return;
            }

            confirmBtn.textContent = 'جاري الحفظ...';
            confirmBtn.disabled = true;

            // --- التعديل الثاني: فصل التاريخ عن الوقت (لحل مشكلة undefined) ---
            const now = new Date();
            const currentDate = now.toLocaleDateString('en-GB'); // التاريخ فقط (يوم/شهر/سنة)
            // الوقت فقط (ساعة:دقيقة) مع تحويل AM/PM للعربية
            const currentTime = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            }).replace('AM', 'ص').replace('PM', 'م');

            // إنشاء كائن الطلب
            const order = {
                orderId: Date.now(),
                customerName: customerNameVal, // تم إضافة الاسم هنا
                phone: phone,
                location: location,
                notes: notes,
                date: currentDate, // تاريخ منفصل
                time: currentTime, // وقت منفصل (سيظهر الآن بدلاً من undefined)
                items: cart.map(item => ({
                    id: item.product.id,
                    globalId: item.product.globalId,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    isSoldByPrice: item.isSoldByPrice || false,
                    variant: item.variant 
                })),
                total: cart.reduce((sum, item) => {
                    let itemTotal = 0;
                    if (item.isSoldByPrice) {
                        itemTotal = item.quantity;
                    } else {
                        let price = item.product.price;
                        if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
                        itemTotal = price * item.quantity;
                    }
                    return sum + itemTotal;
                }, 0),
                status: 'قيد المراجعة'
            };

            // الحفظ والتحديث
            orders.unshift(order);
            saveOrders();
            cart = [];
            saveCart();
            updateCartUI();
            
            showNotification('تم تسجيل الطلب بنجاح! سيتم تحويلك لصفحة الطلبات.', 'success');
            
            setTimeout(() => {
                phoneInput.value = '';
                locationInput.value = '';
                notesInput.value = '';
                if(nameInput) nameInput.value = ''; // تفريغ حقل الاسم
                
                if (checkoutSection) checkoutSection.classList.add('hidden');
                confirmBtn.textContent = 'تأكيد الطلب';
                confirmBtn.disabled = false;
                window.location.href = 'orders.html';
            }, 2000);
        });
    }
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من تفريغ سلة المشتريات بالكامل؟')) {
                cart = [];
                saveCart();
                updateCartUI();
                showNotification('تم تفريغ سلة المشتريات.', 'error');
            }
        });
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

    // وظيفة تهيئة التطبيق الرئيسية
    async function initializeApp() {
        try {
            const categoriesResponse = await fetch('category_names.json');
            categoryNames = await categoriesResponse.json();

            const allJsonFilesPaths = CATEGORY_JSON_FILES.map(file => `json/${file}`);

            let allProductsFromFiles = [];
            for (const filePath of allJsonFilesPaths) {
                const response = await fetch(filePath);
                const categoryProducts = await response.json();
                allProductsFromFiles = allProductsFromFiles.concat(categoryProducts);
            }
            products = allProductsFromFiles;

            loadCart();
            loadOrders();
            loadWishlist();

            if (isCartPage) {
                if (checkoutSection) {
                    checkoutSection.classList.add('hidden');
                }
                updateCartUI();
            } else if (isCategoryProductsPage) {
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                currentCategory = categoryParam || 'all';
                if (categoryTitleEl) {
                    categoryTitleEl.textContent = categoryNames[currentCategory] || 'جميع المنتجات';
                }
                const productsForCategory = products.filter(p => p.category === currentCategory);
                displayProducts(productsForCategory);
            } else if (isProductDetailsPage) {
                const urlParams = new URLSearchParams(window.location.search);
                const globalProductId = urlParams.get('globalId');
                if (globalProductId) {
                    currentGlobalProductId = globalProductId;
                    displayProductDetails(globalProductId);
                } else {
                    if (productDetailAreaEl) productDetailAreaEl.innerHTML = '<p style="text-align: center; color: var(--danger-color);">معرف المنتج غير موجود في الرابط.</p>';
                    if (productPageTitleEl) productPageTitleEl.textContent = 'خطأ في المنتج - سنتر الرضا';
                    if (productDetailNameEl) productDetailNameEl.textContent = 'خطأ';
                }
            } else if (isWishlistPage) {
                filterWishlistByCategory('all');
                populateCategoryDropdown();
                // هنا يتم استدعاء applyWishlistResponsiveStyles بعد بناء الـ DOM
                // بواسطة filterWishlistByCategory
            } else if (isIndexPage) {
                displayFeaturedProducts();
            } else if (isOrdersPage) {
                displayOrders();
            }

            updateNavbarCartCount();


        } catch (error) {
            console.error('Error loading products or initializing app:', error);
            showNotification('حدث خطأ أثناء تحميل بيانات المتجر.', 'error');
        }
    }
    
    initializeApp();
// ============================================================
// بداية نظام إدارة الطلبات المتطور (تم التحديث: إصلاح الترتيب والتكرار)
// ============================================================

// 1. وظيفة عرض الطلبات (تم التعديل: ترتيب الأحدث للأقدم)
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
        
        // --- إصلاح الترتيب: فرز المصفوفة بحيث يظهر الأحدث (أكبر ID) أولاً ---
        const sortedOrders = orders.slice().sort((a, b) => b.orderId - a.orderId);

        sortedOrders.forEach((order) => {
            // التأكد من وجود البيانات
            const displayTime = order.time || 'غير محدد';
            const displayDate = order.date || 'غير محدد';
            const displayName = order.customerName || 'زبون';
            const displayPhone = order.phone || 'لا يوجد';

            // تحديد لون الحالة
            const isSent = order.status === 'تم الإرسال';
            const statusColor = isSent ? '#27ae60' : '#f39c12'; 
            const statusBg = isSent ? '#e8f8f5' : '#fef9e7';

            html += `
            <div class="card order-item" style="padding: 15px; margin-bottom: 15px; border-radius: 12px; border-right: 6px solid ${statusColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #333; font-size: 1.1rem;">#${order.orderId}</h3>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">${order.status}</span>
                </div>
                
                <div style="font-size: 0.95rem; color: #555; margin-top: 10px; line-height: 1.8;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                        <span style="font-weight:bold; color:#2c3e50;">👤 ${displayName}</span>
                        <span style="color: #d35400; font-weight: bold;">${order.total} د.ع</span>
                    </div>
                    
                    <p style="margin: 0;"><i class="fas fa-phone fa-fw"></i> ${displayPhone}</p>
                    <p style="margin: 0;"><i class="fas fa-map-marker-alt fa-fw"></i> ${order.location || 'الموقع غير محدد'}</p>
                    
                    <div style="display: flex; gap: 15px; margin-top: 8px; font-size: 0.85em; color: #777; background: #f9f9f9; padding: 5px; border-radius: 5px;">
                        <span><i class="far fa-calendar-alt"></i> ${displayDate}</span>
                        <span><i class="far fa-clock"></i> ${displayTime}</span>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                    <button class="wa-btn" data-id="${order.orderId}" style="background: #25D366; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fab fa-whatsapp" style="font-size: 1.2em;"></i> إرسال واتساب
                    </button>
                    
                    <button class="pdf-btn" data-id="${order.orderId}" style="background: #0984e3; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-print"></i> طباعة الفاتورة (PDF)
                    </button>
                    
                    <button class="del-btn" data-id="${order.orderId}" style="background: #fff; color: #d63031; border: 1px solid #ffccd5; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-trash"></i> حذف الطلب
                    </button>
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

// 2. وظيفة المساعدة: إرسال واتساب
function sendOrderToWhatsApp(order) {
    const customerName = order.customerName || "زبون";
    let message = `*📦 طلب جديد من: ${customerName}*\n`;
    message += `*📱 رقم الهاتف:* ${order.phone}\n\n`;
    message += `*رقم الطلب:* ${order.orderId}\n`;
    message += `*📅 التاريخ:* ${order.date}\n`;
    message += `*⏰ الوقت:* ${order.time}\n`;
    message += `*📍 الموقع:* ${order.location}\n`;
    message += `\n*🛒 تفاصيل المنتجات:*\n`;

    order.items.forEach(item => {
        if (item.isSoldByPrice) {
            message += `- ${item.name}: ${item.quantity} د.ع\n`;
        } else {
            message += `- ${item.name}: ${item.quantity} × ${item.price} د.ع\n`;
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

// 3. وظيفة المساعدة: طباعة PDF
function downloadOrderPDF(order) {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
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
            <p style="text-align: center; margin-top: 0; color: #666;">فاتورة طلب</p>
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

// 4. تحديث حدث زر "تأكيد الطلب" (تم الإصلاح لمنع التكرار ورسالة الخطأ)
if (confirmBtn) {
    // هذه الخطوة مهمة جداً: نستنسخ الزر لإزالة أي أحداث سابقة عالقة به
    // هذا يحل مشكلة ظهور رسالة "لا يمكن إرسال طلب فارغ" بعد الإرسال الناجح
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        // قراءة البيانات
        const phone = document.getElementById('phone').value.trim();
        const location = document.getElementById('location').value.trim();
        const notes = document.getElementById('notes').value.trim();
        const nameInput = document.getElementById('customer-name');
        const customerNameVal = (nameInput && nameInput.value.trim() !== "") ? nameInput.value.trim() : "زبون";

        // التحقق من السلة قبل أي شيء
        if (cart.length === 0) {
            showNotification('لا يمكنك إرسال طلب فارغ!', 'error');
            return;
        }
        if (!validatePhone(phone)) {
            showNotification('يرجى إدخال رقم هاتف صحيح.', 'error');
            document.getElementById('phone').focus();
            return;
        }
        if (!location) {
            showNotification('يرجى إدخال الموقع/العنوان.', 'error');
            document.getElementById('location').focus();
            return;
        }

        newConfirmBtn.textContent = 'جاري الإرسال...';
        newConfirmBtn.disabled = true;

        const now = new Date();
        const currentDate = now.toLocaleDateString('en-GB'); 
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).replace('AM', 'ص').replace('PM', 'م');

        const order = {
            orderId: Date.now(),
            customerName: customerNameVal,
            phone: phone,
            location: location,
            notes: notes,
            date: currentDate,
            time: currentTime,
            items: cart.map(item => ({
                id: item.product.id,
                globalId: item.product.globalId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                isSoldByPrice: item.isSoldByPrice || false,
                variant: item.variant 
            })),
            total: cart.reduce((sum, item) => {
                let itemTotal = 0;
                if (item.isSoldByPrice) {
                    itemTotal = item.quantity;
                } else {
                    let price = item.product.price;
                    if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
                    itemTotal = price * item.quantity;
                }
                return sum + itemTotal;
            }, 0),
            status: 'قيد المراجعة'
        };

        orders.unshift(order);
        saveOrders();
        
        // تفريغ السلة وتحديث الواجهة
        cart = [];
        saveCart();
        updateCartUI();
        
        showNotification('تم تسجيل الطلب بنجاح! سيتم تحويلك لصفحة الطلبات.', 'success');
        
        setTimeout(() => {
            document.getElementById('phone').value = '';
            document.getElementById('location').value = '';
            document.getElementById('notes').value = '';
            if(nameInput) nameInput.value = ''; 
            
            if (checkoutSection) checkoutSection.classList.add('hidden');
            newConfirmBtn.textContent = 'تأكيد الطلب';
            newConfirmBtn.disabled = false;
            window.location.href = 'orders.html';
        }, 2000);
    });
}

// ============================================================
// نهاية كود إدارة الطلبات المتطور
// ============================================================
// ==========================================
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
// نظام قراءة الباركود (الكاشير الذكي - سلة منفصلة + تحسين القراءة)
// ==========================================
const barcodeBtn = document.getElementById('barcodeTriggerBtn');
const scannerModal = document.getElementById('scanner-modal');
const closeScannerBtn = document.getElementById('close-scanner-btn');
const scanResultEl = document.getElementById('scan-result');
const modeBtns = document.querySelectorAll('.mode-btn');
const scannerFooter = document.getElementById('scanner-footer');
const scanCountEl = document.getElementById('scan-count');
const scanTotalEl = document.getElementById('scan-total');
const printScannedBtn = document.getElementById('print-scanned-btn');

let html5QrcodeScanner = null;
let currentScanMode = 'check'; 
let isScanning = false;

// --- 1. إنشاء سلة منفصلة للماسح الضوئي ---
let scannerCart = []; 

// تحديث إحصائيات الماسح (من السلة المنفصلة)
function updateScannerStats() {
    if (!scannerCart) return;
    const count = scannerCart.reduce((acc, item) => acc + (item.isSoldByPrice ? 1 : item.quantity), 0);
    const total = scannerCart.reduce((sum, item) => {
        let itemTotal = 0;
        if (item.isSoldByPrice) { itemTotal = item.quantity; } 
        else { 
            let price = item.product.price;
            if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
            itemTotal = price * item.quantity;
        }
        return sum + itemTotal;
    }, 0);
    if (scanCountEl) scanCountEl.textContent = count;
    if (scanTotalEl) scanTotalEl.textContent = total.toLocaleString();
}

// دالة إضافة خاصة لسلة الماسح (منفصلة عن سلة الموقع)
function addToScannerCart(globalProductId, quantityOrPrice = 1, isSoldByPrice = false) {
    const product = products.find(p => p.globalId === globalProductId);
    if (!product) return;

    const existingItem = scannerCart.find(item => item.product.globalId === globalProductId);

    if (existingItem) {
        if (isSoldByPrice) {
            existingItem.quantity += quantityOrPrice;
        } else {
            existingItem.quantity += quantityOrPrice;
        }
    } else {
        scannerCart.push({
            product: product,
            quantity: quantityOrPrice,
            isSoldByPrice: isSoldByPrice
        });
    }
    updateScannerStats();
}

// التبديل بين الأوضاع
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScanMode = btn.getAttribute('data-mode');
        
        if (currentScanMode === 'cart') {
            scanResultEl.innerHTML = 'وضع الحاسبة: امسح للإضافة';
            scannerFooter.classList.remove('hidden');
            updateScannerStats();
        } else {
            scanResultEl.innerHTML = 'كاشف السعر: امسح للتأكد';
            scannerFooter.classList.add('hidden');
        }
    });
});

// عند نجاح المسح
function onScanSuccess(decodedText, decodedResult) {
    if (isScanning) return;
    isScanning = true;
    
    // تشغيل صوت
    const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    audio.play().catch(e => {});

    // البحث عن المنتج (بالباركود أو المعرف)
    const product = products.find(p => p.id == decodedText || p.globalId == decodedText || p.barcode == decodedText);

    if (product) {
        if (currentScanMode === 'check') {
            // وضع كشف السعر
            scanResultEl.innerHTML = `
                <div style="color: green; font-size: 0.9rem;">✔ تم العثور على المنتج:</div>
                <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                    <img src="${product.image}" style="width:40px; height:40px; object-fit:contain;">
                    <div style="text-align:right;">
                        <div style="font-size:0.9rem;">${product.name}</div>
                        <div style="font-size:1.1rem; color:#d35400; font-weight:bold;">${product.price} د.ع</div>
                    </div>
                </div>
            `;
        } else {
            // وضع الحاسبة (الإضافة للسلة المنفصلة)
            const isSoldByPrice = ['spices', 'nuts'].includes(product.category);
            // إضافة للسلة المنفصلة وليس سلة الموقع الرئيسية
            addToScannerCart(product.globalId, isSoldByPrice ? 1000 : 1, isSoldByPrice);
            
            scanResultEl.innerHTML = `<div style="color: #27ae60;">✔ تمت الإضافة للقائمة: <b>${product.name}</b></div>`;
        }
    } else {
        scanResultEl.innerHTML = `<span style="color:red;">❌ منتج غير مسجل (${decodedText})</span>`;
    }
    setTimeout(() => { isScanning = false; }, 1500);
}

// طباعة القائمة المنفصلة
function printScannedList() {
    if (scannerCart.length === 0) { alert("القائمة فارغة!"); return; }
    
    const printWindow = window.open('', '_blank');
    // حساب المجموع للطباعة
    const total = scannerCart.reduce((sum, item) => {
        let price = item.product.price;
        if(item.variant && item.variant.price_modifier) price += item.variant.price_modifier;
        return sum + (item.isSoldByPrice ? item.quantity : price * item.quantity);
    }, 0);

    const itemsHtml = scannerCart.map(item => `
        <tr style="border-bottom: 1px dashed #eee;">
            <td style="padding: 5px;">${item.product.name}</td>
            <td style="padding: 5px; text-align: center;">${item.isSoldByPrice ? item.quantity : item.quantity}</td>
            <td style="padding: 5px; text-align: center;">${item.isSoldByPrice ? item.quantity : item.product.price * item.quantity}</td>
        </tr>`).join('');
        
    printWindow.document.write(`
        <div dir="rtl" style="font-family: Arial; padding: 10px; max-width: 300px; margin: auto; font-size: 12px;">
            <h3 style="text-align: center; margin: 0;">سنتر الرضا</h3>
            <p style="text-align: center; margin: 5px 0;">قائمة كاشير (مسودة)</p>
            <hr>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background:#eee;"><th>المادة</th><th>العدد</th><th>السعر</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <hr>
            <h3 style="text-align: center;">المجموع: ${total} د.ع</h3>
        </div>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function startScanner() {
    if (scannerModal) scannerModal.classList.remove('hidden');
    
    if (currentScanMode === 'cart') { 
            scannerFooter.classList.remove('hidden'); 
            updateScannerStats(); 
    } else { 
            scannerFooter.classList.add('hidden'); 
    }

    if (html5QrcodeScanner) return;

    html5QrcodeScanner = new Html5Qrcode("reader");
    
    // --- 2. تحسين إعدادات الكاميرا لقراءة الباركود ---
    const config = { 
        fps: 15, // زيادة السرعة قليلاً
        qrbox: { width: 250, height: 150 }, // جعل الصندوق مستطيلاً ليتناسب مع الباركود
        aspectRatio: 1.0
    };
    
    // محاولة تشغيل الكاميرا الخلفية مع دعم صيغ الباركود
    // ملاحظة: Html5Qrcode يدعم الباركود تلقائياً في المتصفحات الحديثة
    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
    .catch(err => {
        console.warn("لم يتم العثور على كاميرا خلفية، المحاولة بالأمامية...", err);
        return html5QrcodeScanner.start({ facingMode: "user" }, config, onScanSuccess);
    })
    .catch(finalErr => {
        console.error("فشل تشغيل الكاميرا:", finalErr);
        scanResultEl.innerHTML = `<span style="color:red; font-size:12px;">❌ الكاميرا لا تعمل: ${finalErr}</span>`;
        alert("تنبيه: تأكد من منح إذن الكاميرا وأن الموقع يعمل برابط HTTPS.");
    });
}

function stopScanner() {
    if (scannerModal) scannerModal.classList.add('hidden');
    if (html5QrcodeScanner) { 
        html5QrcodeScanner.stop().then(() => { 
            html5QrcodeScanner.clear(); 
            html5QrcodeScanner = null; 
        }).catch(err => console.log(err)); 
    }
}

if (barcodeBtn) barcodeBtn.addEventListener('click', startScanner);
if (closeScannerBtn) closeScannerBtn.addEventListener('click', stopScanner);
if (printScannedBtn) printScannedBtn.addEventListener('click', printScannedList);
});