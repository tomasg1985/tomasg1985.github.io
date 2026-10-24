function showProducts(productList) {
    
    let htmlContent = '';
    
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


const productContainer = document.getElementById('product-container')

const URL_API = 'https://fakestoreapi.com/products/category/electronics';

async function obtainProducts() {
    const response = await fetch(URL_API);
    const products = await response.json();

    console.log(products);

    showProducts(products)
}

obtainProducts();