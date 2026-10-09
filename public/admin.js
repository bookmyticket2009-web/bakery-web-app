async function fetchNotifications() {
  const response = await fetch('/api/notifications');
  const notifications = await response.json();

  const notificationList = document.getElementById('notification-list');
  if (!notifications.length) {
    notificationList.innerHTML = '<div class="empty-state">No notifications yet.</div>';
    return;
  }

  notificationList.innerHTML = notifications
    .map(
      (item) => `
        <article class="notification-item">
          <h4>${item.title}</h4>
          <p>${item.message}</p>
          <div class="notification-meta">
            <span>${item.type}</span>
            <span>${new Date(item.timestamp).toLocaleString()}</span>
          </div>
        </article>
      `
    )
    .join('');
}

async function fetchOrders() {
  const response = await fetch('/api/orders');
  const orders = await response.json();

  const ordersList = document.getElementById('orders-list');
  if (!orders.length) {
    ordersList.innerHTML = '<div class="empty-state">No orders placed yet.</div>';
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-item">
          <h4>${order.orderNumber} — ${order.customerName}</h4>
          <p>${order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</p>
          <div class="order-meta">
            <span>${order.phone}</span>
            <span class="order-total">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)}</span>
          </div>
          <div class="order-meta">
            <span>${order.pickupTime || 'Pickup time not set'}</span>
            <span>${new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </article>
      `
    )
    .join('');
}

async function refreshDashboard() {
  await Promise.all([fetchNotifications(), fetchOrders()]);
}

refreshDashboard();
setInterval(refreshDashboard, 7000);
