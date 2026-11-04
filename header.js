// =======================================================================
// HEADER.JS - LÓGICA GLOBAL DE CABECERA (BUSCADOR + CARRITO + NAVEGACIÓN DE MENÚ)
// =======================================================================

const API_SEARCH_URL = 'https://fakestoreapi.com/products/category/electronics';
let globalHeaderProducts = [];

// Inicializar cabecera
async function initHeaderSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const cartCountElement = document.getElementById('cart-count');
    const mobileMenuBtn = document.getElementById('mobile_menu_btn');
    const mainNavMenu = document.getElementById('main_nav_menu');

    // 1. Contador del carrito
    updateGlobalCartCount();

    // 2. Menú móvil
    if (mobileMenuBtn && mainNavMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNavMenu.classList.toggle('active');
        });
    }

    // 3. Enlazar automáticamente los links del menú desplegable con sus query params
    setupHeaderCategoryLinks();

    // Cargar productos para el buscador
    if (!searchInput || !searchResults) return;

    try {
        const [apiRes, localRes] = await Promise.all([
            fetch(API_SEARCH_URL).catch(() => ({ json: () => [] })),
            fetch('products.json').catch(() => ({ json: () => [] }))
        ]);

        const apiProds = await apiRes.json().catch(() => []);
        const localProds = await localRes.json().catch(() => []);

        globalHeaderProducts = [...apiProds, ...localProds];
    } catch (err) {
        console.error("Error al cargar productos para buscador:", err);
    }

    // Buscador en tiempo real
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        const matches = globalHeaderProducts.filter(product => {
            const titleMatch = (product.title || '').toLowerCase().includes(query);
            const categoryMatch = (product.category || '').toLowerCase().includes(query);
            return titleMatch || categoryMatch;
        });

        renderSearchResults(matches, searchResults);
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Configurar clicks en los enlaces del menú desplegable para asegurar que envíen query params (?cat= o ?sub=)
function setupHeaderCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.colapse_menu_link, .categories-dropdown a, .sub_menu_title');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const text = link.innerText.trim();
            if (!text) return;

            // Si el enlace es de una subcategoría específica
            if (link.classList.contains('colapse_menu_link') || link.closest('.categories-dropdown')) {
                e.preventDefault();
                window.location.href = `products_category.html?sub=${encodeURIComponent(text)}`;
            } else if (link.classList.contains('sub_menu_title')) {
                e.preventDefault();
                window.location.href = `products_category.html?cat=${encodeURIComponent(text)}`;
            }
        });
    });
}

function renderSearchResults(products, container) {
    if (products.length === 0) {
        container.innerHTML = `
            <div style="padding: 12px 15px; color: #666; font-size: 0.9rem; text-align: center;">
                No se encontraron productos
            </div>
        `;
        container.style.display = 'block';
        return;
    }

    let html = '';
    products.slice(0, 6).forEach(product => {
        html += `
            <div class="search-result-item" onclick="selectSearchResult(${product.id})" style="display: flex; align-items: center; gap: 12px; padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #eee; transition: background-color 0.2s;">
                <img src="${product.image}" alt="${product.title}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px;">
                <div style="flex: 1; overflow: hidden;">
                    <h5 style="margin: 0; font-size: 0.9rem; color: #264653; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${product.title}</h5>
                    <span style="font-size: 0.8rem; color: #2a9d8f; font-weight: bold;">USD ${product.price}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.style.display = 'block';
}

function selectSearchResult(productId) {
    localStorage.setItem('selectedProductId', productId);
    window.location.href = 'product_details.html';
}

function updateGlobalCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    const cart = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = cart.reduce((total, p) => total + (p.quantity || 1), 0);
    cartCountElement.innerText = totalItems;
}

window.addEventListener('storage', updateGlobalCartCount);

document.addEventListener('DOMContentLoaded', initHeaderSearch);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initHeaderSearch();
}
