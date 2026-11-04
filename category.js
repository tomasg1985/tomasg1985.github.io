// =======================================================================
// CATEGORY.JS - LÓGICA COMPLETA DEL CATÁLOGO DE PRODUCTOS POR CATEGORÍA
// =======================================================================

const URL_API = 'https://fakestoreapi.com/products/category/electronics';
let cart = JSON.parse(localStorage.getItem('carrito')) || [];
let allCategoryProducts = [];
let filteredProducts = [];

// Elementos del DOM
const productsCardsContainer = document.querySelector('.products_cards_container');
const recomendationContainer = document.querySelector('.recomendation_container');
const cartCountElement = document.getElementById('cart-count');

// Elementos de Filtro en Sidebar
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const starFilter = document.getElementById('starFilter');
const ratingText = document.getElementById('ratingText');

let currentStarRating = 0;

// =======================================================================
// 1. MAPEO RIGUROSO DE PRODUCTOS POR CATEGORÍA Y SUBCATEGORÍA
// =======================================================================
function mapProductCategory(product) {
    if (product.category && product.subcategory) {
        return { category: product.category, subcategory: product.subcategory };
    }

    const titleLower = (product.title || '').toLowerCase();

    // 1. Gaming
    if (titleLower.includes('ps5') || titleLower.includes('playstation') || titleLower.includes('xbox') || titleLower.includes('nintendo') || titleLower.includes('consola')) {
        return { category: "Gaming", subcategory: "Consolas" };
    }
    if (titleLower.includes('fc 25') || titleLower.includes('fifa') || titleLower.includes('game') || titleLower.includes('juego')) {
        return { category: "Gaming", subcategory: "Videojuegos" };
    }

    // 2. Telefonía & Tablets
    if (titleLower.includes('watch') || titleLower.includes('reloj')) {
        return { category: "Telefonia & Tablets", subcategory: "Smartwatches" };
    }
    if (titleLower.includes('phone') || titleLower.includes('iphone') || titleLower.includes('smartphone') || titleLower.includes('celular')) {
        return { category: "Telefonia & Tablets", subcategory: "Smartphones" };
    }
    if (titleLower.includes('ipad') || titleLower.includes('tablet')) {
        return { category: "Telefonia & Tablets", subcategory: "Tablets" };
    }

    // 3. Audio & Video
    if (titleLower.includes('headphone') || titleLower.includes('auricular') || titleLower.includes('audifono')) {
        return { category: "Audio & Video", subcategory: "Auriculares" };
    }
    if (titleLower.includes('speaker') || titleLower.includes('parlante') || titleLower.includes('sonido') || titleLower.includes('aiwa')) {
        return { category: "Audio & Video", subcategory: "Parlantes y sonido" };
    }
    if (titleLower.includes('tv') || titleLower.includes('screen')) {
        return { category: "Audio & Video", subcategory: "Smart TV" };
    }

    // 4. Computación & Hardware
    if (titleLower.includes('ssd') || titleLower.includes('hard drive') || titleLower.includes('disco') || titleLower.includes('almacenamiento') || titleLower.includes('elements') || titleLower.includes('sandisk')) {
        return { category: "Computacion & Hardware", subcategory: "Almacenamiento" };
    }
    if (titleLower.includes('acer') || titleLower.includes('silicon power') || titleLower.includes('teclado') || titleLower.includes('ram') || titleLower.includes('procesador') || titleLower.includes('componente')) {
        return { category: "Computacion & Hardware", subcategory: "Componentes" };
    }

    // Por defecto asignamos a Componentes
    return { category: "Computacion & Hardware", subcategory: "Componentes" };
}

// =======================================================================
// 2. CARGA DE DATOS
// =======================================================================
async function loadCategoryProducts() {
    updateCartCount();

    try {
        const [apiRes, localRes] = await Promise.all([
            fetch(URL_API).catch(() => ({ json: () => [] })),
            fetch('products.json').catch(() => ({ json: () => [] }))
        ]);

        const apiProducts = await apiRes.json().catch(() => []);
        const localProducts = await localRes.json().catch(() => []);

        const rawProducts = [...apiProducts, ...localProducts];

        allCategoryProducts = rawProducts.map(p => {
            const catInfo = mapProductCategory(p);
            return {
                ...p,
                category: catInfo.category,
                subcategory: catInfo.subcategory
            };
        });

        setupPriceRange();
        setupEventListeners();
        applyFilters();
        renderRecommendations();

    } catch (error) {
        console.error("Error al cargar productos del catálogo:", error);
    }
}

// =======================================================================
// 3. LECTURA DE URL PARAMS Y FILTRADO RIGUROSO
// =======================================================================
function applyFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat') || urlParams.get('category');
    const subParam = urlParams.get('sub') || urlParams.get('subcategory');

    const minP = parseFloat(minPriceInput ? minPriceInput.value : 0) || 0;
    const maxP = parseFloat(maxPriceInput ? maxPriceInput.value : 99999) || 99999;

    // Actualizar Encabezado del Banner según la URL
    updateBannerHeader(catParam, subParam);

    // Obtener checkboxes seleccionados en Sidebar
    const checkedConditions = Array.from(document.querySelectorAll('input[name="condition"]:checked')).map(cb => cb.value);

    filteredProducts = allCategoryProducts.filter(product => {
        // 1. Filtro por precio
        if (product.price < minP || product.price > maxP) return false;

        // 2. Filtro por estrellas
        const rating = product.rating?.rate || product.rating || 5;
        if (currentStarRating > 0 && rating < currentStarRating) return false;

        // 3. Filtro por condición
        if (checkedConditions.length > 0) {
            const prodCondition = product.condition || "Nuevo";
            if (!checkedConditions.includes(prodCondition)) return false;
        }

        // 4. FILTRADO POR SUBCATEGORÍA O CATEGORÍA DESDE LA URL
        if (subParam) {
            if (product.subcategory.toLowerCase() !== subParam.toLowerCase()) return false;
        } else if (catParam) {
            if (product.category.toLowerCase() !== catParam.toLowerCase()) return false;
        }

        return true;
    });

    renderProductsGrid(filteredProducts, subParam || catParam);
}

// Actualizar Banner
function updateBannerHeader(category, subcategory) {
    const bannerTitle = document.querySelector('.banner_main_title');
    const bannerCategory = document.querySelector('.page_category');
    const bannerDesc = document.querySelector('.banner_description');

    if (subcategory) {
        if (bannerTitle) bannerTitle.innerText = subcategory;
        if (bannerCategory) bannerCategory.innerText = category ? `${category} > ${subcategory}` : `Categoría: ${subcategory}`;
        if (bannerDesc) bannerDesc.innerText = `Mostrando exclusivamente productos de ${subcategory}`;
    } else if (category) {
        if (bannerTitle) bannerTitle.innerText = category;
        if (bannerCategory) bannerCategory.innerText = "Catálogo Destacado";
        if (bannerDesc) bannerDesc.innerText = `Explora todos nuestros productos en ${category}`;
    } else {
        if (bannerTitle) bannerTitle.innerText = "Tecnología y Accesorios";
        if (bannerCategory) bannerCategory.innerText = "Colección Destacada";
        if (bannerDesc) bannerDesc.innerText = "Descubrí todos nuestros productos de tecnología con envíos gratis";
    }
}

// =======================================================================
// 4. RENDERIZADO DE GRILLA CON CLASES Y ESTILOS NATIVOS (.product_card_container)
// =======================================================================
function renderProductsGrid(productsList, activeFilterName) {
    if (!productsCardsContainer) return;

    if (productsList.length === 0) {
        const filterText = activeFilterName ? ` en "${activeFilterName}"` : '';
        productsCardsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #264653; margin-bottom: 10px;">No se encontraron productos${filterText}</h3>
                <p style="color: #666; margin-bottom: 15px;">Intenta ajustar los filtros de precio o explorar otra categoría del menú.</p>
                <a href="products_category.html" style="display: inline-block; padding: 10px 20px; background: #2a9d8f; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver todo el catálogo</a>
            </div>
        `;
        return;
    }

    let cardsHtml = '';

    productsList.forEach(product => {
        const rating = product.rating?.rate || product.rating || 4.8;
        const condition = product.condition || "Nuevo";
        const discountTag = product.discount ? `-${product.discount}% OFF` : "-15% OFF";

        cardsHtml += `
            <div class="product_card_container">
                <div class="condition_header">
                    <div class="single_product_condition">
                        <p class="condition">${condition}</p>
                    </div>
                    <div class="single_product_discount">
                        <p class="discount">${discountTag}</p>
                    </div>
                </div>
                
                <div class="img_container" onclick="goToDetails(${product.id})" style="cursor: pointer;">
                    <div class="product_img">
                        <img class="picture" src="${product.image}" alt="${product.title}">
                    </div>
                </div>

                <div class="product_info_container">
                    <div class="product_data">
                        <h4 class="product_name" onclick="goToDetails(${product.id})" style="cursor: pointer;">${product.title}</h4>
                        <p class="product_seller">TecnoStore</p>
                        
                        <span class="product_rating">
                            <svg class="star_icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span class="rating_number">${rating}</span>
                        </span>

                        <p class="single_product_price">USD ${product.price}</p>
                        
                        <div style="display: flex; gap: 8px; margin-top: 10px; width: 100%;">
                            <input class="cart" type="button" value="Agregar al Carrito" onclick="addToCartFromCategory(event, ${product.id})" style="flex: 1; cursor: pointer;">
                            <input class="purchase" type="button" value="Comprar" onclick="buyNow(event, ${product.id})" style="flex: 1; cursor: pointer;">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    productsCardsContainer.innerHTML = cardsHtml;
}

// =======================================================================
// 5. RENDERIZADO DE RECOMENDACIONES (.recomendation_container)
// =======================================================================
function renderRecommendations() {
    if (!recomendationContainer) return;

    const recommended = allCategoryProducts.slice(0, 4);
    let html = '';

    recommended.forEach(product => {
        html += `
            <div class="product_card_container">
                <div class="condition_header">
                    <div class="single_product_condition"><p class="condition">Recomendado</p></div>
                </div>
                <div class="img_container" onclick="goToDetails(${product.id})" style="cursor: pointer;">
                    <div class="product_img"><img class="picture" src="${product.image}" alt="${product.title}"></div>
                </div>
                <div class="product_info_container">
                    <div class="product_data">
                        <h4 class="product_name" onclick="goToDetails(${product.id})" style="cursor: pointer;">${product.title}</h4>
                        <p class="single_product_price">USD ${product.price}</p>
                        <div style="display: flex; gap: 8px; margin-top: 10px; width: 100%;">
                            <input class="cart" type="button" value="Agregar al Carrito" onclick="addToCartFromCategory(event, ${product.id})" style="flex: 1; cursor: pointer;">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    recomendationContainer.innerHTML = html;
}

// =======================================================================
// 6. EVENTOS DE FILTROS EN SIDEBAR Y PRECIOS
// =======================================================================
function setupEventListeners() {
    if (minRange && minPriceInput) {
        minRange.addEventListener('input', () => { minPriceInput.value = minRange.value; applyFilters(); });
        minPriceInput.addEventListener('input', () => { minRange.value = minPriceInput.value; applyFilters(); });
    }

    if (maxRange && maxPriceInput) {
        maxRange.addEventListener('input', () => { maxPriceInput.value = maxRange.value; applyFilters(); });
        maxPriceInput.addEventListener('input', () => { maxRange.value = maxPriceInput.value; applyFilters(); });
    }

    const checkboxes = document.querySelectorAll('.product_gallery_filter input[type="checkbox"]');
    checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));

    if (starFilter) {
        const stars = starFilter.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.getAttribute('data-value'));
                currentStarRating = (currentStarRating === val) ? 0 : val;
                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    s.style.color = (sVal <= currentStarRating) ? '#f4a261' : '#ccc';
                });
                if (ratingText) ratingText.innerText = currentStarRating > 0 ? `${currentStarRating} estrellas o más` : 'Todas las calificaciones';
                applyFilters();
            });
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentStarRating = 0;
            checkboxes.forEach(cb => cb.checked = false);
            if (starFilter) {
                starFilter.querySelectorAll('.star').forEach(s => s.style.color = '#ccc');
                if (ratingText) ratingText.innerText = 'Todas las calificaciones';
            }
            setupPriceRange();
            window.location.href = 'products_category.html';
        });
    }
}

function setupPriceRange() {
    if (!allCategoryProducts.length || !minRange || !maxRange) return;
    const prices = allCategoryProducts.map(p => p.price);
    const maxP = Math.ceil(Math.max(...prices));

    minRange.min = 0; minRange.max = maxP + 100;
    maxRange.min = 0; maxRange.max = maxP + 100;

    minRange.value = 0; maxRange.value = maxP + 100;
    if (minPriceInput) minPriceInput.value = 0;
    if (maxPriceInput) maxPriceInput.value = maxP + 100;
}

function goToDetails(productId) {
    localStorage.setItem('selectedProductId', productId);
    window.location.href = 'product_details.html';
}

function addToCartFromCategory(event, productId) {
    if (event) event.stopPropagation();
    const productToAdd = allCategoryProducts.find(p => Number(p.id) === Number(productId));
    if (!productToAdd) return;

    const existingProduct = cart.find(p => Number(p.id) === Number(productId));
    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        cart.push({ ...productToAdd, quantity: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();
}

function buyNow(event, productId) {
    if (event) event.stopPropagation();
    addToCartFromCategory(event, productId);
    window.location.href = 'cart.html';
}

function updateCartCount() {
    if (cartCountElement) {
        const totalItems = cart.reduce((total, p) => total + (p.quantity || 1), 0);
        cartCountElement.innerText = totalItems;
    }
}

loadCategoryProducts();
