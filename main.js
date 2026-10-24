const productContainer = document.getElementById('product-container')
const searchInput = document.getElementById('search-input')

const URL_API = 'https://fakestoreapi.com/products/category/electronics';

let allProducts = [];

const localProducts = [

    {
        id: 101,
        title: "iPhone 15 Pro Max 256GB",
        price: 1199.99,
        description: "El último smartphone de Apple con chip A17 Pro y cámara de 48 MP.",
        image: "https://i0.wp.com/shop.litecorp.com.ar/wp-content/uploads/2024/02/iphone-15-pro-max-natural-titanium.--e1771435890944.webp?fit=1125%2C1125&ssl=1"
    },
    {
        id: 101,
        title: "iPhone 15 Pro Max 256GB",
        price: 1199.99,
        description: "El último smartphone de Apple con chip A17 Pro y cámara de 48 MP.",
        image: "https://i0.wp.com/shop.litecorp.com.ar/wp-content/uploads/2024/02/iphone-15-pro-max-natural-titanium.--e1771435890944.webp?fit=1125%2C1125&ssl=1"
    },
    {
        id: 103,
        title: "MacBook Pro 14' M3 Chip",
        price: 1599.99,
        description: "Rendimiento extremo para profesionales con pantalla Liquid Retina XDR.",
        image: "https://idestiny.in/wp-content/uploads/2024/10/Macbook-Pro-14_-600x600.png",
    }
]


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
        <input type="button" class="purchase_btn" value="Añadir al carrito">
        </div>
        <div class="buy_btn">
        <a href="product_details.html">
        <input type="button" class="purchase_btn_more_info" value="Detalles">
        </a>
        </div>
        </div>
        </div>
        `;
    });

    productContainer.innerHTML = htmlContent;
}


searchInput.addEventListener ('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    const filteredProducts = allProducts.filter(products => products.title.toLowerCase().includes(searchTerm)
);

showProducts(filteredProducts);
});


async function obtainProducts() {
    const response = await fetch(URL_API);
    const apiProducts = await response.json();

    allProducts = [...apiProducts, ...localProducts];

    showProducts(allProducts)
}

obtainProducts();