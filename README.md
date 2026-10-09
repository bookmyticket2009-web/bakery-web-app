# Bakery Web App

A simple bakery ordering platform with a customer storefront and an admin dashboard that receives order notifications.

## Features

- Customer-facing storefront for bakery items
- Add-to-cart ordering flow
- Checkout form for name, phone, email and pickup time
- Admin dashboard showing recent order notifications and all orders
- Notifications update automatically on the admin panel
- Clean responsive UI for desktop and mobile

## Tech stack

- Node.js
- Express
- Static HTML/CSS/JS frontend
- JSON file storage for products, orders and notifications

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open the app in a browser:
   - Customer page: http://localhost:3000/
   - Admin page: http://localhost:3000/admin.html

## Folder structure

```text
.
├── data/
│   ├── notifications.json
│   ├── orders.json
│   └── products.json
├── public/
│   ├── admin.html
│   ├── admin.js
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── admin.css
├── package.json
├── server.js
└── README.md
```

## Notes

This app uses a lightweight JSON-store approach so it works without needing a database. It is designed for local development and demo use.
