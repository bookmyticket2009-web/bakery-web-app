const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
  }
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function generateOrderNumber() {
  return `BK-${Math.floor(Date.now() / 1000)}`;
}

function computeOrderTotal(items, productCatalog) {
  return items.reduce((sum, item) => {
    const product = productCatalog.find((entry) => entry.id === item.id);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);
}

ensureDataFiles();

app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  res.json(products);
});

app.get('/api/orders', (req, res) => {
  const orders = readJson(ORDERS_FILE);
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.get('/api/notifications', (req, res) => {
  const notifications = readJson(NOTIFICATIONS_FILE);
  res.json(notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.post('/api/orders', (req, res) => {
  const payload = req.body || {};
  const productCatalog = readJson(PRODUCTS_FILE);

  const customerName = String(payload.customerName || '').trim();
  const phone = String(payload.phone || '').trim();
  const email = String(payload.email || '').trim();
  const pickupTime = String(payload.pickupTime || '').trim();
  const notes = String(payload.notes || '').trim();
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!customerName || !phone || items.length === 0) {
    return res.status(400).json({
      message: 'Customer name, phone and at least one item are required.'
    });
  }

  const mappedItems = items
    .map((item) => {
      const product = productCatalog.find((entry) => entry.id === item.id);
      if (!product) return null;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      return {
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
        total: product.price * quantity
      };
    })
    .filter(Boolean);

  if (mappedItems.length === 0) {
    return res.status(400).json({ message: 'No valid bakery items were selected.' });
  }

  const total = mappedItems.reduce((sum, item) => sum + item.total, 0);
  const order = {
    id: Date.now(),
    orderNumber: generateOrderNumber(),
    customerName,
    phone,
    email,
    pickupTime,
    notes,
    items: mappedItems,
    total,
    createdAt: new Date().toISOString()
  };

  const orders = readJson(ORDERS_FILE);
  orders.push(order);
  writeJson(ORDERS_FILE, orders);

  const notifications = readJson(NOTIFICATIONS_FILE);
  const notification = {
    id: Date.now() + 1,
    type: 'new-order',
    title: 'New bakery order',
    message: `${customerName} placed order #${order.orderNumber} for ${formatMoney(total)}.`,
    timestamp: new Date().toISOString(),
    orderId: order.id
  };
  notifications.unshift(notification);
  writeJson(NOTIFICATIONS_FILE, notifications);

  res.status(201).json({
    message: 'Order placed successfully. The admin has been notified.',
    order
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Bakery app is running on http://localhost:${PORT}`);
});

module.exports = app;
