# StyleNest — Backend API

A real Node.js + Express + PostgreSQL API for the StyleNest store: products,
auth (register/login/JWT), and orders — including guest checkout and an
admin role for managing products and order status.

Built with **Sequelize** (not Prisma) as the ORM — pure JavaScript, no native
binary downloads required, so it installs cleanly anywhere `npm install` works.

I built, ran, and tested every endpoint below against a real local PostgreSQL
database before handing this over — registration, login, product filtering,
guest checkout, admin-only routes, and price validation all pass.

## What's inside

```
stylenest-backend/
├── src/
│   ├── server.js              Entry point — connects DB, starts Express
│   ├── app.js                 Express app + route mounting
│   ├── lib/db.js              Sequelize connection
│   ├── models/                User, Product, Order, OrderItem + associations
│   ├── controllers/           Route logic (auth, products, orders)
│   ├── routes/                Route definitions
│   ├── middleware/             Auth (JWT) + error handling
│   ├── utils/                  JWT helpers, async error wrapper
│   └── seed.js                 Seeds the 12 products + an admin user
├── .env.example
└── package.json
```

## 1. Prerequisites

- [Node.js](https://nodejs.org) 18+
- A PostgreSQL database — either:
  - **Hosted (recommended, easiest on Windows)**: a free instance from
    [Neon](https://neon.tech), [Supabase](https://supabase.com),
    [Railway](https://railway.app), or [Render](https://render.com) —
    no local install needed, just sign up and copy a connection string
  - **Local**: install Postgres directly on your machine

## 2. Setup

```bash
cd stylenest-backend
npm install
cp .env.example .env
```

Open `.env` and set:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="any-long-random-string"
```

If you're using a hosted provider like Neon, paste in the connection string
exactly as they give it to you — SSL is enabled by default in this project to
match what those providers require. If you're connecting to a plain local
Postgres install that isn't configured for SSL, add this line to `.env`:
```
DB_SSL=false
```

## 3. Create the tables and seed data

```bash
npm run seed
```

This creates all the tables (via Sequelize sync) and inserts:
- The same 12 products used in the React frontend
- An admin account: **admin@stylenest.com / admin123** — change this password
  before using this anywhere real

## 4. Run the server

```bash
npm run dev      # auto-restarts on file changes
# or
npm start        # plain run
```

You should see:
```
Database connected and models synced.
StyleNest API running on http://localhost:4000
```

Test it's alive:
```bash
curl http://localhost:4000/api/health
# {"ok":true}
```

## API Reference

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{name, email, password, phone?}` → `{token, user}` |
| POST | `/api/auth/login` | — | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | Bearer token | Returns the logged-in user |

### Products
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List products. Query params: `category`, `maxPrice`, `colors` (comma-separated), `sizes` (comma-separated), `search`, `sort` (`price-asc`\|`price-desc`\|`rating`\|`newest`) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |

### Orders
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Optional | Create an order. Works for guests (no token) or logged-in users. **Prices are always recalculated server-side from the database** — the client can't manipulate totals. |
| GET | `/api/orders/mine` | Required | The logged-in user's own orders |
| GET | `/api/orders/:id` | Required | A single order (owner or admin only) |
| GET | `/api/orders/admin/all` | Admin | Every order, for the admin dashboard |
| PATCH | `/api/orders/:id/status` | Admin | Update status: `RECEIVED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |

**Order creation payload example:**
```json
{
  "items": [{ "productId": "uuid-here", "qty": 2, "color": "White", "size": "M" }],
  "customerName": "Ama Mensah",
  "email": "ama@example.com",
  "phone": "0240000000",
  "address": "12 Cantonments Rd",
  "city": "Accra",
  "region": "Greater Accra",
  "paymentMethod": "momo"
}
```
Note there's no `price` field on each item — the server looks up the real
price from the database, so a tampered client request can't change what a
customer is charged.

### Uploads
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/uploads` | Admin | Upload a product image (multipart form field named `image`, max 5MB). Returns `{ url }` — a Cloudinary-hosted URL to save on the product's `imageUrl` field. |

**Note:** this requires Cloudinary credentials in `.env` (see setup below). Without
them, product uploads will fail — everything else in the API works fine
regardless, and products without an image just fall back to an illustrated
icon on the storefront.

### Payments
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/initialize` | Optional | `{items, email}` → starts a Paystack transaction, returns `{reference, accessCode, amount}` for the frontend to open Paystack's popup with. |
| POST | `/api/payments/verify` | Optional | `{reference, items, customerName, email, phone, address, city, region}` → verifies the payment directly with Paystack, re-checks the amount against a fresh server-side price calculation, and only then creates the order (marked `paymentStatus: "PAID"`). |

**How this stays safe:** the order total is never taken from the browser.
`initialize` computes the amount to charge from the database. `verify` asks
Paystack directly what was actually paid, recomputes the total from the
database a second time, and rejects the order if those two don't match. A
tampered client request can change neither what Paystack charges nor what
gets recorded as the order total.

Orders placed via card/Mobile Money get `paymentMethod: "paystack"` and
`paymentStatus: "PAID"`. Orders placed via the plain `/api/orders` endpoint
(used for the Bank Transfer option) are marked `paymentStatus: "PENDING"` —
the store owner confirms those manually once the transfer arrives.

## Setting up Cloudinary (for product photos)

1. Sign up free at [cloudinary.com](https://cloudinary.com) — no credit card required.
2. On your dashboard, find "Product Environment Credentials" and copy the
   **Cloud name**, **API Key**, and **API Secret**.
3. Paste them into `.env`:
   ```
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
4. Restart the server. The admin dashboard's product form will now be able to
   upload real photos.

## Setting up Paystack (for real payments)

1. Sign up free at [paystack.com](https://paystack.com).
2. On your dashboard, go to Settings → API Keys & Webhooks. While testing,
   use the **Test Secret Key** (starts with `sk_test_`) — this lets you
   simulate payments without moving real money. Copy it into `.env`:
   ```
   PAYSTACK_SECRET_KEY="sk_test_..."
   ```
3. In the frontend project, copy the matching **Test Public Key**
   (`pk_test_...`) into its own `.env` as `VITE_PAYSTACK_PUBLIC_KEY` (see the
   frontend README).
4. Restart both servers. Mobile Money and Card at checkout will now open a
   real (test-mode) Paystack payment popup.
5. When you're ready to accept real payments, switch both keys to their live
   (`sk_live_...` / `pk_live_...`) equivalents — nothing else needs to change.

## Connecting the React frontend

In the React project, replace the hardcoded `src/data/products.js` array with
calls to `http://localhost:4000/api/products`, and point the checkout flow at
`POST /api/orders`. Store the JWT (e.g. in React state or a cookie) after
login/register and send it as `Authorization: Bearer <token>` on requests that
need it.

## Deploying

This is a standard Node + Postgres app, so it deploys to any Node host:

- **Render** or **Railway**: connect your repo, set the same environment
  variables from `.env`, set the start command to `npm start`, and run
  `npm run seed` once via their shell/console after the first deploy.
- Pair it with a hosted Postgres from the same provider, or Neon/Supabase.

In production, set `NODE_ENV=production` — this disables the automatic
table-altering sync on startup (`syncDb({ alter: true })` only runs in
non-production). For a real production setup, consider migrating to proper
Sequelize migrations (`sequelize-cli`) instead of relying on sync, so schema
changes are tracked and reversible.

## Security notes for going further

- Passwords are hashed with bcrypt — never stored in plain text.
- JWTs expire after 7 days; change `JWT_SECRET` to something long and random
  before deploying anywhere real.
- Order totals are always computed server-side from the database, never
  trusted from the client.
- Before accepting real payments, you'll still need to integrate an actual
  payment provider (e.g. Paystack for Mobile Money/card in Ghana) — right now
  `paymentMethod` is just stored as a label, no money actually moves.
