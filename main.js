const productContainer = document.getElementById('product-container')
const searchInput = document.getElementById('search-input')
const searchResultsContainer = document.getElementById('search-results')
const loadMoreBtn = document.getElementById('load-more-btn');
const cartCountElement = document.getElementById('cart-count');

const URL_API = 'https://fakestoreapi.com/products/category/electronics';

let cart = JSON.parse(localStorage.getItem('carrito')) || [];
let allProducts = [];
let isExpanded = false;

function updateCartCount() {
    const totalItems = cart.reduce((total, product) => total + product.quantity, 0);
    cartCountElement.innerText = totalItems;
}

function addToCart(productId) {
    const productToAdd = allProducts.find(p => p.id === productId);

    if (!productToAdd) return;

    const existingProduct = cart.find(p => p.id === productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...productToAdd, quantity: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();
}

updateCartCount();

function showProducts(productList) {
    
    let htmlContent = '';

    if (productList.length === 0) {
        productContainer.innerHTML = `<p>No se encontraron productos.</p>`;
        return;
    }
    
    productList.forEach(products => {
        
        htmlContent += `
        
        <div class="product_card">
        <div class="product_tag">
        <p class="condition_tag">Nuevo</p>
        </div>
        <div>
        <img src="${products.image}" class="product_image" alt="${products.title}">
        </div>
        <div class="product_card_product_price">
        <div> 
        <h4 class="title">${products.title}</h4>
        </div>
        <div>
        <p class="amount">$${products.price}</p>
        </div>
        </div>
        <div class="product_description_container">
        <p class="description"> ${products.description} </p>
        </div>
        <div class="card_btn_container">
        <div class="buy_btn">
        <input type="button" class="purchase_btn" value="Añadir al carrito" onclick="addToCart(${products.id})">
        </div>
        <div class="buy_btn">
        <a href="product_details.html">
        <div class="buy_btn">
        <button class="purchase_btn_more_info" onclick="goToDetails(${products.id})">
        Detalles
        </button>
        </div>
        </a>
        </div>
        </div>
        </div>
        `;
    });

    productContainer.innerHTML = htmlContent;
}

function goToDetails(productId) {
    localStorage.setItem('selectedProductId', productId);
    window.location.href = 'product_detail.html';
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
    
        if (!isExpanded) {
        showProducts(allProducts);
        loadMoreBtn.innerText = 'Mostrar menos';
        isExpanded = true;
        } else {
            const initialProducts = allProducts.slice(0, 6);
            showProducts(initialProducts);
            loadMoreBtn.innerText = 'Mostrar más productos';
            isExpanded = false;
        }
    });
}


searchInput.addEventListener ('input', (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.classList.remove('active');
        return;
    }

    const filteredProducts = allProducts.filter(products => products.title.toLowerCase().includes(searchTerm)
    );

    if(filteredProducts.length === 0) {
        searchResultsContainer.innerHTML = `<div>No se encontraron productos coincidentes.</div>`;
        searchResultsContainer.classList.add('active');
        return;
    }

    let dropdownHTML = '';

    filteredProducts.forEach(products => {
        dropdownHTML += `
            <div class="dropdown_item">
                <img src="${products.image}" class="dropdown_image" alt="${products.title}">
                <div class="dropdown_info">
                    <h5>${products.title}</h5>
                    <p>$${products.price}</p>
                </div>
            </div>
        `;
    });

    searchResultsContainer.innerHTML = dropdownHTML;
    searchResultsContainer.classList.add('active');
});

document.addEventListener('click',  (event) => {
    
    if (!searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
        searchResultsContainer.classList.remove('active');
    }

});


async function obtainProducts() {
    try {
        const response = await fetch(URL_API);
        const apiProducts = await response.json();
    
        const responseLocal = await fetch('products.json')
        const localProducts = await responseLocal.json();
    
        allProducts = [...apiProducts, ...localProducts];
    
        const initialProducts = allProducts.slice(0, 6);
    
        showProducts(initialProducts)
    
        if (loadMoreBtn) {
            if (allProducts.length > 6) {
                loadMoreBtn.style.display = 'inline-block';
            }
            else {
                loadMoreBtn.style.display = 'none'
            }
        }
    } catch (error) {
        console.log("Error al cargar los productos:", error);
    }
}

obtainProducts();