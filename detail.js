const URL_API = 'https://fakestoreapi.com/products/category/electronics';
let cart = JSON.parse(localStorage.getItem('carrito')) || [];
const selectedProductId = parseInt(localStorage.getItem('selectedProductId'));

const detailsContainer = document.getElementById('details-container');
const cartCountElement = document.getElementById('cart-count');


async function loadProductDetails() {
    updateCartCount();

    if (!selectedProductId) {
        detailsContainer.innerHTML = `<p style="text-align: center; padding: 40px;">No se seleccionó ningún producto. <a href="index.html">Volver al catálogo</a></p>`;
        return;
    }

    try {
        const response = await fetch(URL_API);
        const apiProducts = await response.json();
        
        const allProducts = apiProducts;

        const product = allProducts.find(p => p.id === selectedProductId);

        if (!product) {
            detailsContainer.innerHTML = `<p style="text-align: center; padding: 40px;">Producto no encontrado. <a href="index.html">Volver al catálogo</a></p>`;
            return;
        }

        renderDetails(product);

    } catch (error) {
        console.log("Error al cargar los detalles del producto:" , error);
    }
}


function renderDetails(product) {
    detailsContainer.innerHTML = `
        <div class="product_details_container">
            <div class="product_gallery">
                <img class="single_product_picture" src="${product.image}" alt="${product.title}">
            </div>

            <div class="single_product_details">
                <p class="product_category">Electrónica / ${product.category || 'General'}</p>
                <h4 class="single_product_title">${product.title}</h4>
                <p class="product_description">${product.description}</p>

                <h4 class="product_discount">USD ${product.price}</h4>

                <div class="quantity_btn_cart_container">
                    <div>
                        <select class="qty_select" id="detail-qty">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div>
                        <input class="add_to_cart" type="button" value="Agregar al carrito" onclick="addFromDetails(${product.id})">
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addFromDetails(productId) {
    const qtySelect = document.getElementById('detail-qty');
    const selectedQty = parseInt('qtySelect.value') || 1;

    const existingProduct = cart.find(p => p.id === productId);

    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + selectedProductId;
    } else {
        fetch(`${URL_API}/${productId}`)
        .then(res => res.json())
        .then(product => {
            cart.push({ ...product, quantity: selectedQty});
            saveAndRefreshCart();
        })
        return;
    }
    saveAndRefreshCart();
}

function saveAndRefreshCart() {
    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();
    alert("¡Producto añadido al carrito con éxito!")
}

function updateCartCount() {

    if (cartCountElement) {
        const totalItems = cart.reduce((total, p) => total + (p.quantity || 1), 0);
        cartCountElement.innerText = totalItems;
    }
}

loadProductDetails();