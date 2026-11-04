// =======================================================================
// 1. ESTRUCTURA OFICIAL DE CATEGORÍAS Y TIPOS (MAPA DE NAVEGACIÓN)
// =======================================================================
const OFFICIAL_CATEGORIES = {
    "Computacion & Hardware": [
        "Componentes",
        "Perifericos",
        "Almacenamiento",
        "Conectividad"
    ],
    "Telefonia & Tablets": [
        "Smartphones",
        "Tablets",
        "Smartwatches",
        "Accesorios"
    ],
    "Audio & Video": [
        "Auriculares",
        "Parlantes y sonido",
        "Smart TV",
        "Streaming y Fotografía"
    ],
    "Gaming": [
        "Consolas",
        "Videojuegos",
        "Accesorios Gamer",
        "Periféricos Gamer"
    ],
    "Hogar Inteligente": [
        "Asistentes Virtuales",
        "Iluminación Inteligente",
        "Seguridad Wi-Fi",
        "Redes y Routers"
    ]
};

const URL_API = 'https://fakestoreapi.com/products/category/electronics';
let cart = JSON.parse(localStorage.getItem('carrito')) || [];
let allCategoryProducts = [];
let filteredProducts = [];

// Elementos del DOM
const productsCardsContainer = document.querySelector('.products_cards_container');
const recomendationContainer = document.querySelector('.recomendation_container');
const cartCountElement = document.getElementById('cart-count');

// Elementos de Filtro en el HTML
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const starFilter = document.getElementById('starFilter');
const ratingText = document.getElementById('ratingText');

let selectedCategoryFilter = 'ALL';
let currentStarRating = 0;

// =======================================================================
// 2. MAPEO AUTOMÁTICO DE PRODUCTOS A CATEGORÍAS
// =======================================================================
function mapProductCategory(product) {
    if (product.category && product.subcategory) {
        return {
            category: product.category,
            subcategory: product.subcategory
        };
    }

    const titleLower = (product.title || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();

    if (titleLower.includes('watch') || titleLower.includes('reloj')) {
        return { category: "Telefonia & Tablets", subcategory: "Smartwatches" };
    }
    if (titleLower.includes('phone') || titleLower.includes('smartphone') || titleLower.includes('iphone')) {
        return { category: "Telefonia & Tablets", subcategory: "Smartphones" };
    }
    if (titleLower.includes('ipad') || titleLower.includes('tablet')) {
        return { category: "Telefonia & Tablets", subcategory: "Tablets" };
    }
    if (titleLower.includes('game') || titleLower.includes('ps5') || titleLower.includes('xbox') || titleLower.includes('fc 25') || titleLower.includes('juego')) {
        return { category: "Gaming", subcategory: "Videojuegos" };
    }
    if (titleLower.includes('ssd') || titleLower.includes('hard drive') || titleLower.includes('disco') || titleLower.includes('almacenamiento')) {
        return { category: "Computacion & Hardware", subcategory: "Almacenamiento" };
    }
    if (titleLower.includes('monitor') || titleLower.includes('screen') || titleLower.includes('tv') || titleLower.includes('pantalla')) {
        return { category: "Audio & Video", subcategory: "Smart TV" };
    }
    if (titleLower.includes('headphone') || titleLower.includes('auricular') || titleLower.includes('audifono')) {
        return { category: "Audio & Video", subcategory: "Auriculares" };
    }
    if (titleLower.includes('speaker') || titleLower.includes('parlante') || titleLower.includes('sonido')) {
        return { category: "Audio & Video", subcategory: "Parlantes y sonido" };
    }

    return { category: "Computacion & Hardware", subcategory: "Perifericos" };
}

// =======================================================================
// 3. CARGA Y NORMALIZACIÓN DE PRODUCTOS
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

        filteredProducts = [...allCategoryProducts];

        setupPriceRange();
        renderCategorySidebarFilter();
        setupEventListeners();
        applyFilters();
        renderRecommendations();

    } catch (error) {
        console.error("Error al cargar productos del catálogo:", error);
    }
}

// =======================================================================
// 4. GENERAR EL FILTRO DE CATEGORÍAS DENTRO DEL SIDEBAR ORIGINAL
// =======================================================================
function renderCategorySidebarFilter() {
    const filterSidebar = document.querySelector('.product_gallery_filter') || document.querySelector('aside');
    if (!filterSidebar) return;

    let existingFilterBox = document.getElementById('official-category-filter-box');

    // Si no existe, lo creamos respetando exactamente la clase .filter_group
    if (!existingFilterBox) {
        existingFilterBox = document.createElement('details');
        existingFilterBox.id = 'official-category-filter-box';
        existingFilterBox.className = 'filter_group';
        existingFilterBox.setAttribute('open', '');

        // Insertar después de filter_header
        const filterHeader = filterSidebar.querySelector('.filter_header');
        if (filterHeader && filterHeader.nextSibling) {
            filterSidebar.insertBefore(existingFilterBox, filterHeader.nextSibling);
        } else {
            filterSidebar.insertBefore(existingFilterBox, filterSidebar.firstChild);
        }
    }

    let filterHtml = `
        <summary class="filter_title">Categorías y Tipos</summary>
        <ul class="filter_list">
            <li class="filter_list_item">
                <label class="checkbox_label" style="font-weight: 600; color: #2a9d8f;">
                    <input type="radio" name="categoryFilter" value="ALL" ${selectedCategoryFilter === 'ALL' ? 'checked' : ''}>
                    Todas las categorías (${allCategoryProducts.length})
                </label>
            </li>
    `;

    for (const [mainCat, subCats] of Object.entries(OFFICIAL_CATEGORIES)) {
        const countMain = allCategoryProducts.filter(p => p.category === mainCat).length;

        filterHtml += `
            <li class="filter_list_item" style="margin-top: 8px;">
                <label class="checkbox_label" style="font-weight: 600; color: #264653;">
                    <input type="radio" name="categoryFilter" value="CAT:${mainCat}" ${selectedCategoryFilter === `CAT:${mainCat}` ? 'checked' : ''}>
                    ${mainCat} (${countMain})
                </label>
                <ul class="filter_list" style="padding-left: 18px; margin-top: 4px;">
        `;

        subCats.forEach(sub => {
            const countSub = allCategoryProducts.filter(p => p.category === mainCat && p.subcategory === sub).length;
            filterHtml += `
                <li class="filter_list_item">
                    <label class="checkbox_label" style="font-size: 0.88rem; color: #555;">
                        <input type="radio" name="categoryFilter" value="SUB:${sub}" ${selectedCategoryFilter === `SUB:${sub}` ? 'checked' : ''}>
                        ${sub} (${countSub})
                    </label>
                </li>
            `;
        });

        filterHtml += `
                </ul>
            </li>
        `;
    }

    filterHtml += `</ul>`;
    existingFilterBox.innerHTML = filterHtml;

    // Escuchar eventos de cambio en los botones de selección
    const categoryRadios = existingFilterBox.querySelectorAll('input[name="categoryFilter"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedCategoryFilter = e.target.value;
            applyFilters();
        });
    });
}

// =======================================================================
// 5. EVENT LISTENERS PARA FILTROS DEL SIDEBAR
// =======================================================================
function setupEventListeners() {
    if (minRange && minPriceInput) {
        minRange.addEventListener('input', () => {
            minPriceInput.value = minRange.value;
            applyFilters();
        });
        minPriceInput.addEventListener('input', () => {
            minRange.value = minPriceInput.value;
            applyFilters();
        });
    }

    if (maxRange && maxPriceInput) {
        maxRange.addEventListener('input', () => {
            maxPriceInput.value = maxRange.value;
            applyFilters();
        });
        maxPriceInput.addEventListener('input', () => {
            maxRange.value = maxPriceInput.value;
            applyFilters();
        });
    }

    // Checkboxes nativos del sidebar (Disponibilidad, Descuentos, Condición, etc.)
    const checkboxes = document.querySelectorAll('.product_gallery_filter input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    // Filtro por valoración de estrellas
    if (starFilter) {
        const stars = starFilter.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.getAttribute('data-value'));
                currentStarRating = (currentStarRating === val) ? 0 : val;

                stars.forEach(s => {
                    const sVal = parseInt(s.getAttribute('data-value'));
                    s.style.color = (sVal <= currentStarRating) ? '#ffb703' : '#ccc';
                });

                if (ratingText) {
                    ratingText.innerText = currentStarRating > 0 ? `${currentStarRating} estrellas o más` : 'Todas las calificaciones';
                }

                applyFilters();
            });
        });
    }

    // Botón de Limpiar Filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            selectedCategoryFilter = 'ALL';
            currentStarRating = 0;

            checkboxes.forEach(cb => cb.checked = false);

            if (starFilter) {
                starFilter.querySelectorAll('.star').forEach(s => s.style.color = '#ccc');
                if (ratingText) ratingText.innerText = 'Todas las calificaciones';
            }

            const catRadios = document.querySelectorAll('input[name="categoryFilter"]');
            catRadios.forEach(r => {
                r.checked = (r.value === 'ALL');
            });

            setupPriceRange();
            applyFilters();
        });
    }
}

// =======================================================================
// 6. RANGO DE PRECIOS
// =======================================================================
function setupPriceRange() {
    if (!allCategoryProducts.length || !minRange || !maxRange) return;

    const prices = allCategoryProducts.map(p => p.price);
    const maxP = Math.ceil(Math.max(...prices));

    minRange.min = 0;
    minRange.max = maxP + 100;
    maxRange.min = 0;
    maxRange.max = maxP + 100;

    minRange.value = 0;
    maxRange.value = maxP + 100;

    if (minPriceInput) minPriceInput.value = 0;
    if (maxPriceInput) maxPriceInput.value = maxP + 100;
}

// =======================================================================
// 7. MOTOR DE FILTRADO
// =======================================================================
function applyFilters() {
    const minP = parseFloat(minPriceInput ? minPriceInput.value : 0) || 0;
    const maxP = parseFloat(maxPriceInput ? maxPriceInput.value : 99999) || 99999;

    filteredProducts = allCategoryProducts.filter(product => {
        if (product.price < minP || product.price > maxP) return false;

        if (selectedCategoryFilter !== 'ALL') {
            if (selectedCategoryFilter.startsWith('CAT:')) {
                const catName = selectedCategoryFilter.replace('CAT:', '');
                if (product.category !== catName) return false;
            } else if (selectedCategoryFilter.startsWith('SUB:')) {
                const subName = selectedCategoryFilter.replace('SUB:', '');
                if (product.subcategory !== subName) return false;
            }
        }

        const rating = product.rating?.rate || product.rating || 5;
        if (currentStarRating > 0 && rating < currentStarRating) return false;

        return true;
    });

    renderProductsGrid(filteredProducts);
}

// =======================================================================
// 8. RENDERIZADO DE LA GRILLA DE PRODUCTOS (BOTONES 100% ANCHO)
// =======================================================================
function renderProductsGrid(productsList) {
    if (!productsCardsContainer) return;

    if (productsList.length === 0) {
        productsCardsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h3 style="color: #264653; margin-bottom: 10px;">No se encontraron productos</h3>
                <p style="color: #666;">Intenta ajustar los filtros seleccionados para ver más opciones.</p>
            </div>
        `;
        return;
    }

    const grouped = {};
    productsList.forEach(prod => {
        const key = `${prod.category} • ${prod.subcategory}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(prod);
    });

    let fullHtml = '';

    for (const [groupTitle, items] of Object.entries(grouped)) {
        let itemsCards = '';

        items.forEach(product => {
            const rating = product.rating?.rate || product.rating || 4.8;
            const condition = product.condition || "Nuevo";
            const discountTag = product.discount ? `-${product.discount}% OFF` : "-15% OFF";

            itemsCards += `
                <div class="product_card_container">
                    <div class="condition_header">
                        <div class="single_product_condition">
                            <p class="condition">${condition}</p>
                        </div>
                        <div class="single_product_discount">
                            <p class="discount">${discountTag}</p>
                        </div>
                    </div>
                    
                    <div class="img_container" onclick="goToDetails(${product.id})">
                        <div class="product_img">
                            <img class="picture" src="${product.image}" alt="${product.title}">
                        </div>
                    </div>

                    <div class="product_info_container">
                        <div class="product_data">
                            <h4 class="product_name" onclick="goToDetails(${product.id})">${product.title}</h4>
                            <p class="product_seller">TecnoStore</p>
                            
                            <span class="product_rating">
                                <svg class="star_icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span class="rating_number">${rating}</span>
                            </span>

                            <p class="single_product_price">USD ${product.price}</p>
                            
                            <!-- CONTENEDOR DE BOTONES AL 100% DISTRIBUIDO EN LA TARJETA -->
                            <div class="card_btn_container" style="display: flex; gap: 8px; margin-top: 12px; width: 100%; box-sizing: border-box;">
                                <input class="cart" type="button" value="Agregar al Carrito" onclick="addToCartFromCategory(event, ${product.id})" style="flex: 1; width: 50%; box-sizing: border-box; padding: 10px 4px; cursor: pointer; text-align: center; border-radius: 4px; font-weight: 600;">
                                <input class="purchase" type="button" value="Comprar" onclick="buyNow(event, ${product.id})" style="flex: 1; width: 50%; box-sizing: border-box; padding: 10px 4px; cursor: pointer; text-align: center; border-radius: 4px; font-weight: 600;">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        fullHtml += `
            <div style="grid-column: 1/-1; margin-top: 20px; margin-bottom: 10px;">
                <h3 style="color: #264653; font-size: 1.2rem; border-bottom: 2px solid #2a9d8f; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <span>${groupTitle}</span>
                    <span style="font-size: 0.88rem; color: #888; font-weight: normal;">${items.length} disponible(s)</span>
                </h3>
            </div>
            ${itemsCards}
        `;
    }

    productsCardsContainer.innerHTML = fullHtml;
}

// =======================================================================
// 9. RECOMENDACIONES
// =======================================================================
function renderRecommendations() {
    if (!recomendationContainer || !allCategoryProducts.length) return;

    const recommended = allCategoryProducts.slice(0, 4);
    let recHtml = '';

    recommended.forEach(prod => {
        recHtml += `
            <div class="recomendation_card" onclick="goToDetails(${prod.id})" style="cursor: pointer;">
                <div class="recomendation_img_container">
                    <img class="recomendation_img" src="${prod.image}" alt="${prod.title}">
                </div>
                <div class="recomendation_info">
                    <h5 class="recomendation_title">${prod.title}</h5>
                    <p class="recomendation_price">USD ${prod.price}</p>
                </div>
            </div>
        `;
    });

    recomendationContainer.innerHTML = recHtml;
}

// =======================================================================
// 10. NAVEGACIÓN Y CARRITO
// =======================================================================
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

// Inicializar la carga
loadCategoryProducts();
