const URL_API = 'https://fakestoreapi.com/products/category/electronics';
let cart = JSON.parse(localStorage.getItem('carrito')) || [];
const selectedProductId = parseInt(localStorage.getItem('selectedProductId'));

const detailsContainer = document.getElementById('details-container');
const cartCountElement = document.getElementById('cart-count');

async function loadProductDetails() {
    updateCartCount();

    if (!selectedProductId) {
        if (detailsContainer) {
            detailsContainer.innerHTML = `<p style="text-align: center; padding: 40px;">No se seleccionó ningún producto. <a href="index.html">Volver al catálogo</a></p>`;
        }
        return;
    }

    try {
        const [apiRes, localRes] = await Promise.all([
            fetch(URL_API),
            fetch('products.json')
        ]);

        const apiProducts = await apiRes.json();
        const localProducts = await localRes.json();
        const allProducts = [...apiProducts, ...localProducts];

        const product = allProducts.find(p => Number(p.id) === Number(selectedProductId));

        if (!product) {
            if (detailsContainer) {
                detailsContainer.innerHTML = `<p style="text-align: center; padding: 40px;">Producto no encontrado. <a href="index.html">Volver al catálogo</a></p>`;
            }
            return;
        }

        renderDetails(product);

    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
        if (detailsContainer) {
            detailsContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Error al cargar la información.</p>`;
        }
    }
}

function getNormalizedSpecs(product) {
    if (product.specs) {
        return product.specs;
    }

    return {
        main: {
            brand: "Genérico",
            line: product.category || "General",
            model: product.title ? product.title.slice(0, 15) : "Estándar",
            version: "N/A",
            color: "Variados"
        },
        connectivity: {
            wifi: "No",
            bluetooth: "No",
            gps: "No",
            cardiac_sensor: "-",
            acelerometer: "-"
        },
        battery_and_dimensions: {
            autonomy: "No aplica",
            charge: "Estándar",
            waterproof: "Resistente al uso diario",
            box: "Caja sellada",
            weight: "Estándar"
        }
    };
}

function renderDetails(product) {
    if (!detailsContainer) return;

    const specs = getNormalizedSpecs(product);

    const sectionTitles = {
        main: "Características Principales",
        connectivity: "Conectividad y Sensores",
        battery_and_dimensions: "Batería y Dimensiones"
    };

    const keyLabels = {
        brand: "Marca",
        line: "Línea",
        model: "Modelo",
        version: "Versión",
        screen: "Pantalla",
        color: "Color",
        wifi: "Wi-Fi",
        bluetooth: "Bluetooth",
        gps: "GPS",
        cardiac_sensor: "Sensor Cardíaco",
        acelerometer: "Acelerómetro",
        autonomy: "Autonomía",
        charge: "Carga",
        waterproof: "Resistencia al Agua",
        box: "Caja",
        weight: "Peso"
    };

    let gridHtml = '';

    for (const [sectionKey, items] of Object.entries(specs)) {
        let itemsHtml = '';
        let index = 0;

        for (const [key, value] of Object.entries(items)) {
            const formattedKey = keyLabels[key] || key.replace(/_/g, ' ');
            const rowClass = (index % 2 === 0) ? 'caracteristics_container-light' : 'caracteristics_container-dark';

            itemsHtml += `
                <div class="${rowClass}">
                    <p class="product-main-title">${formattedKey}</p>
                    <p class="product-main-caracteristic">${value}</p>
                </div>
            `;
            index++;
        }

        gridHtml += `
            <div class="product-tecnical-details-container">
                <h4 class="subtitle">${sectionTitles[sectionKey] || sectionKey}</h4>
                ${itemsHtml}
            </div>
        `;
    }

    detailsContainer.innerHTML = `
        <div class="product_details_container">
            <div class="product_gallery">
                <img class="single_product_picture" src="${product.image}" alt="${product.title}">
            </div>

            <div class="single_product_details">
                <p class="product_category">Categoría / ${product.category || 'General'}</p>
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

        <!-- Sección de Ficha Técnica con las clases CSS del proyecto -->
        <div class="technical_specs_wrapper" style="margin-top: 40px;">
            <h3 class="technical_section_title">Especificaciones Técnicas completas</h3>
            <div class="technical_grid">
                ${gridHtml}
            </div>
        </div>
    `;
}

function addFromDetails(productId) {
    const qtySelect = document.getElementById('detail-qty');
    const selectedQty = parseInt(qtySelect ? qtySelect.value : 1) || 1;

    const existingProduct = cart.find(p => p.id === productId);

    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + selectedQty;
        saveAndRefreshCart();
    } else {
        fetch(`${URL_API}/${productId}`)
            .then(res => res.json())
            .then(product => {
                cart.push({ ...product, quantity: selectedQty });
                saveAndRefreshCart();
            })
            .catch(() => {
                fetch('products.json')
                    .then(res => res.json())
                    .then(localProds => {
                        const localP = localProds.find(p => Number(p.id) === Number(productId));
                        if (localP) {
                            cart.push({ ...localP, quantity: selectedQty });
                            saveAndRefreshCart();
                        }
                    });
            });
    }
}

function saveAndRefreshCart() {
    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    if (cartCountElement) {
        const totalItems = cart.reduce((total, p) => total + (p.quantity || 1), 0);
        cartCountElement.innerText = totalItems;
    }
}

loadProductDetails();
