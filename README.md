.admin-page {
  padding: 42px 0 64px;
}

.admin-header {
  margin-bottom: 28px;
}

.admin-header h2 {
  font-size: clamp(2.4rem, 3vw, 4rem);
  line-height: 0.95;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
}

.panel {
  background: linear-gradient(180deg, #fff 0%, #fff8f4 100%);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 20px 40px rgba(90, 52, 35, 0.05);
}

.panel-header h3 {
  margin: 0 0 18px;
  font-size: 1.5rem;
  font-family: 'Cormorant Garamond', serif;
}

.notification-list,
.orders-list {
  display: grid;
  gap: 12px;
}

.notification-item,
.order-item {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.9);
}

.notification-item h4,
.order-item h4 {
  margin: 0 0 6px;
  font-size: 1.08rem;
}

.notification-item p,
.order-item p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.notification-meta,
.order-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.8rem;
}

.order-total {
  color: var(--primary);
  font-weight: 800;
}

@media (max-width: 860px) {
  .admin-grid {
    grid-template-columns: 1fr;
  }
}
