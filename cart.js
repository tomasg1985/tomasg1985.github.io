let cart = JSON.parse(localStorage.getItem('carrito')) || [];

const cartItemsContainer = document.getElementById('cart-items-container');
const subtotalElement = document.getElementById('subtotal-amount');
const shippingElement = document.getElementById('shipping-amount');
const discountElement = document.getElementById('discount-amount');
const totalElement = document.getElementById('total-amount');

const SHIPPING_COST = 15.00;
const DISCOUNT_RATE = 0.15;

function renderCartDetails() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; margin-top: 20px;">
                <h3 clas="empty_title" style="margin-bottom:35px; font-weight:400; font-size: 40px; color: grey;">Tu carrito está vacío</h3>
                <a class="back_btn" href="index.html">Volver al catálogo para agregar productos</a>
            </div>
        `;
        calculateTotals();
        return;
    }

    let htmlContent = '';

    cart.forEach(product => {
        htmlContent += `
            <div class="purchase_details_container">
                <div class="product_section">
                    <img src="${product.image}" class="cart_product_image" alt="${product.title}">
                    <div class="product_info">
                        <h4 class="product_name">${product.title}</h4>
                        <div class="detailed_product_description">${product.description}</div>
                        <div class="product_caracteristic_container">
                            <p class="product_caracteristic">Producto original</p>
                        </div>
                        <p class="product_shipment">Llega a su domicilio: En 3 días hábiles</p>
                    </div>

                    <div class="quantity_container">
                        <label for="opciones_${product.id}">QTY.</label>
                        <select id="opciones_${product.id}" onchange="changeQuantity(${product.id}, this.value)">
                            ${generateQuantityOptions(product.quantity)}
                        </select>
                    </div>

                    <div class="price_container">
                        <button class="delete_btn" onclick="removeFromCart(${product.id})" style="background:none; border:none; cursor:pointer;">&#128465;</button>
                        <p class="price_text">${product.quantity}x USD ${product.price}</p>
                    </div>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = htmlContent;
    calculateTotals();
}


function generateQuantityOptions(currentQuantity) {
    
    let options = '';
    for (let i = 1; i <= 10; i++) {
        const isSelected = i === currentQuantity ? 'selected' : '';
        options += `<option value="${i}" ${isSelected}>${i}</option>`
    }
    return options
}


function calculateTotals() {
    
    const subtotal = cart.reduce((total, product) => total + (product.price * (product.quantity || 1)), 0);
    const discount = subtotal * DISCOUNT_RATE;
    const finalTotal = subtotal > 0 ? (subtotal + SHIPPING_COST - discount) : 0;

    if (subtotalElement) subtotalElement.innerText = `USD ${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.innerText = `USD ${subtotal > 0 ? SHIPPING_COST.toFixed(2) : '0.00'}`;
    if (discountElement) discountElement.innerText = `-10% (-USD ${discount.toFixed(2)})`;
    if (totalElement) totalElement.innerText = `USD ${finalTotal.toFixed(2)}`;
}

function changeQuantity(productId, newQuantity) {
    const product = cart.find(p => p.id === productId);
    if (product) {
        product.quantity = parseInt(newQuantity);
        localStorage.setItem('carrito', JSON.stringify(cart));
        renderCartDetails();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(product => product.id !== productId);
    localStorage.setItem('carrito', JSON.stringify(cart));
    renderCartDetails();
}

renderCartDetails();