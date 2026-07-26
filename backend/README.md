# Munch Backend

Restaurant ordering API for The Yard Milkshake Bar PWA.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database (generate + migrate + seed)
npm run setup

# Start development server
npm run dev
```

## API Endpoints

| Method | Path                        | Auth    | Description               |
|--------|-----------------------------|---------|---------------------------|
| POST   | /api/auth/register          | —       | Register new user         |
| POST   | /api/auth/login             | —       | Login                     |
| GET    | /api/auth/me                | ✅      | Get current user          |
| GET    | /api/menu                   | —       | Get menu items            |
| GET    | /api/menu/categories        | —       | Get categories            |
| GET    | /api/menu/:id               | —       | Get item detail           |
| GET    | /api/cart                   | —       | Get cart (by session)     |
| POST   | /api/cart/items             | —       | Add item to cart          |
| PUT    | /api/cart/items/:id         | —       | Update cart item qty      |
| DELETE | /api/cart/items/:id         | —       | Remove cart item          |
| POST   | /api/orders                 | ✅      | Place order               |
| GET    | /api/orders                 | ✅      | Get my orders             |
| GET    | /api/orders/:id             | ✅      | Get order by ID           |
| PUT    | /api/orders/:id/status      | ✅      | Update order status       |
| POST   | /api/orders/:id/reorder     | ✅      | Reorder past order        |
| GET    | /api/chat/:orderId          | ✅      | Get chat for order        |
| POST   | /api/chat/:orderId/messages | ✅      | Send message              |
| POST   | /api/reviews                | ✅      | Submit review             |
| GET    | /api/users/profile          | ✅      | Get profile               |
| PUT    | /api/users/profile          | ✅      | Update profile            |
| GET    | /api/users/addresses        | ✅      | Get saved addresses       |
| POST   | /api/users/addresses        | ✅      | Add address               |
| GET    | /api/users/favourites       | ✅      | Get favourites            |
| POST   | /api/users/favourites       | ✅      | Add favourite             |
| DELETE | /api/users/favourites/:id   | ✅      | Remove favourite          |
| GET    | /api/wallet                 | ✅      | Get wallet + transactions |
| POST   | /api/wallet/topup           | ✅      | Top up wallet             |
| POST   | /api/promo/validate         | —       | Validate promo code       |

## Socket Events

| Event                  | Direction         | Description                  |
|------------------------|-------------------|------------------------------|
| join-order             | Client → Server   | Subscribe to order updates   |
| order-status-updated   | Server → Client   | Status changed               |
| rider-location-update  | Client → Server   | Rider sends GPS              |
| rider-location         | Server → Client   | Broadcast rider location     |
| join-chat              | Client → Server   | Join chat room               |
| new-message            | Server → Client   | New chat message             |

## Demo Credentials

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Customer | customer@demo.com   | password123 |
| Staff    | staff@demo.com      | password123 |
| Rider    | rider@demo.com      | password123 |
| Admin    | admin@demo.com      | password123 |

## Promo Codes

| Code     | Discount           | Min Order |
|----------|--------------------|-----------|
| MUNCH10  | 10% off            | $15       |
| YARD5    | $5 off             | $20       |
