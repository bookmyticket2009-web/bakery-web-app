const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const summaryCount = document.getElementById('summary-count');
const summaryTotal = document.getElementById('summary-total');
const clearCartBtn = document.getElementById('clear-cart');
const orderForm = document.getElementById('order-form');
const formMessage = document.getElementById('form-message');

const cart = [];

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();

  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-details">
            <div class="product-head">
              <h4>${product.name}</h4>
              <span class="product-price">${formatMoney(product.price)}</span>
            </div>
            <span class="category-badge">${product.category}</span>
            <p>${product.description}</p>
            <button type="button" data-product-id="${product.id}">Add to cart</button>
          </div>
        </article>
      `
    )
    .join('');

  productList.querySelectorAll('button[data-product-id]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.productId));
  });
}

function addToCart(productId) {
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  renderCart();
}

function updateProductQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === productId);
    cart.splice(index, 1);
  }
  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((entry) => entry.id === productId);
  if (index >= 0) cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty. Add a few bakery favorites to continue.</div>';
    summaryCount.textContent = '0';
    summaryTotal.textContent = '$0.00';
    return;
  }

  fetch('/api/products')
    .then((response) => response.json())
    .then((products) => {
      const itemMap = new Map(products.map((product) => [product.id, product]));
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalCost = cart.reduce((sum, item) => {
        const product = itemMap.get(item.id);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);

      summaryCount.textContent = String(totalItems);
      summaryTotal.textContent = formatMoney(totalCost);

      cartItems.innerHTML = cart
        .map((item) => {
          const product = itemMap.get(item.id);
          if (!product) return '';

          return `
            <div class="cart-item">
              <div class="cart-item-info">
                <h4>${product.name}</h4>
                <small>${formatMoney(product.price)} each</small>
              </div>
              <div class="cart-item-actions">
                <div class="qty-controls">
                  <button type="button" data-action="decrease" data-product-id="${product.id}">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-action="increase" data-product-id="${product.id}">+</button>
                </div>
                <button type="button" class="remove-item" data-product-id="${product.id}">Remove</button>
              </div>
            </div>
          `;
        })
        .join('');

      cartItems.querySelectorAll('[data-action="increase"]').forEach((button) => {
        button.addEventListener('click', () => updateProductQuantity(button.dataset.productId, 1));
      });

      cartItems.querySelectorAll('[data-action="decrease"]').forEach((button) => {
        button.addEventListener('click', () => updateProductQuantity(button.dataset.productId, -1));
      });

      cartItems.querySelectorAll('.remove-item').forEach((button) => {
        button.addEventListener('click', () => removeFromCart(button.dataset.productId));
      });
    });
}

clearCartBtn.addEventListener('click', () => {
  cart.length = 0;
  renderCart();
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    formMessage.textContent = 'Add at least one item before placing your order.';
    formMessage.style.color = '#b44a2d';
    return;
  }

  const payload = {
    customerName: document.getElementById('customerName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    pickupTime: document.getElementById('pickupTime').value,
    notes: document.getElementById('notes').value,
    items: cart
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok) {
      formMessage.textContent = result.message || 'Unable to place order.';
      formMessage.style.color = '#b44a2d';
      return;
    }

    formMessage.textContent = result.message;
    formMessage.style.color = '#2a7f62';
    orderForm.reset();
    cart.length = 0;
    renderCart();
  } catch (error) {
    formMessage.textContent = 'There was a server issue while placing the order.';
    formMessage.style.color = '#b44a2d';
  }
});

loadProducts();
renderCart();
