# StyleNest — React Front-End

A React + Vite front-end for the StyleNest store, connected to the real
StyleNest backend API (see the `stylenest-backend` project) — products,
cart, wishlist, and checkout all talk to a live PostgreSQL-backed server.

## What's inside

```
stylenest-react/
├── index.html              Vite entry HTML (loads fonts, mounts React)
├── package.json
├── vite.config.js
├── .env.example             Backend API URL config
├── public/
│   └── _redirects          SPA fallback rule for static hosts (Netlify etc.)
└── src/
    ├── main.jsx              React root
    ├── App.jsx                Routes + layout shell
    ├── index.css              All styling (dark/gold theme)
    ├── api/
    │   ├── client.js          Base fetch wrapper (reads VITE_API_URL)
    │   ├── products.js        Product fetching + shape normalization
    │   └── orders.js          Order creation
    ├── hooks/
    │   └── useProducts.js     Loading/error-aware product fetch hook
    ├── data/
    │   └── products.js        Shared constants (categories, price formatter)
    ├── context/
    │   └── StoreContext.jsx   Cart, wishlist, toast, order state (React Context)
    ├── components/
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── ProductCard.jsx
    │   ├── CartDrawer.jsx
    │   ├── Toast.jsx
    │   ├── GarmentIcon.jsx    SVG garment illustrations
    │   └── Icons.jsx          Small line icons (search, bag, heart, etc.)
    └── pages/
        ├── Home.jsx            Fetches products live from the API
        ├── Shop.jsx            Filters, sorting, search — all client-side over live data
        ├── Product.jsx         Product detail page — fetches by id
        ├── Checkout.jsx        Delivery + payment form, submits a real order
        ├── Confirmation.jsx    Order confirmation + tracking strip
        └── Account.jsx         Wishlist view
```

## Admin Dashboard

There's now a full admin area at `/#/admin/login`, protected behind a real
login using the backend's existing admin auth.

- **Login**: use the seeded admin account — `admin@stylenest.com` / `admin123`
  (change this password via the backend once you're using this for real)
- **Products**: view all products in a table, create new ones, edit any field
  (price, stock, colors, sizes, tag, photo, etc.), or delete a product
- **Product photos**: upload a real image per product directly from the edit
  form — it uploads to Cloudinary and the URL is saved on the product.
  Products without a photo automatically fall back to the illustrated icon
  style used elsewhere on the site, so this is optional, not required.
- **Orders**: view every order across all customers, expand one to see the
  full item breakdown and delivery details, and change its status (Received
  → Processing → Shipped → Delivered, or Cancelled) — updates save immediately

The admin session is stored as a JWT in `localStorage` (this is a real app
running in your own browser, not a sandboxed Claude artifact, so
`localStorage` is the right tool here — it persists your login across page
refreshes). Non-admin accounts are rejected at login with a clear error.

Everything under `/admin/products` and `/admin/orders` is route-protected —
visiting them without a valid admin session redirects to `/admin/login`.



This app expects the `stylenest-backend` API to be running. By default it
looks for it at `http://localhost:4000/api` — no configuration needed if
you're running the backend locally on its default port.

If your backend runs somewhere else (a different port, or a deployed URL),
copy `.env.example` to `.env` and set:

```
VITE_API_URL=https://your-backend-url.com/api
```

## Customer Accounts

Customers can now register and log in (`/#/login`, `/#/register`), separate
from the admin login — these are regular `CUSTOMER`-role accounts using the
backend's existing auth. Once logged in:

- Checkout auto-fills their name, email, and phone
- Orders placed while logged in are linked to their account
- The **Orders** tab on `/#/account` shows their real order history, pulled
  live from the database, with an expandable view of items and delivery info
- Wishlist still works for guests too — only order history requires login

Sessions persist in `localStorage` under a different key than the admin
session, so being logged in as a customer and as an admin (in two tabs, say)
don't interfere with each other.

## Payments (Paystack)

Checkout now processes real payments through Paystack:

- **Mobile Money** and **Card** both open Paystack's own secure popup — this
  site never sees or stores a card number or Mobile Money PIN directly
- **Bank Transfer** stays a manual option — the order is created immediately
  and marked pending, for stores that want to confirm transfers by hand
- After a successful payment, the frontend sends the reference to the backend,
  which re-verifies it directly with Paystack and re-checks the amount before
  creating the order — so a compromised or tampered browser can't fake a
  successful payment

You'll need a `VITE_PAYSTACK_PUBLIC_KEY` in `.env` for this to work — see
`.env.example`. Use your **Test Public Key** (`pk_test_...`) from your
Paystack dashboard while developing; switch to the live key when you're ready
to accept real payments. The matching secret key setup lives in the backend
project's README.

## Running it locally

You'll need [Node.js](https://nodejs.org) (18+) and the `stylenest-backend`
project running first (see its own README for setup — you'll need a
PostgreSQL database, e.g. a free one from Neon).

```bash
cd stylenest-react
npm install
npm run dev
```

This starts a local dev server (usually `http://localhost:5173`) with hot reload.
With the backend also running, product listings, product detail pages, and
checkout will all be talking to your real database.

## Building for production

```bash
npm run build
```

This outputs a static site to `dist/` — plain HTML/CSS/JS, ready to deploy anywhere.

```bash
npm run preview   # serve the production build locally to double check it
```

## Deploying

Because `npm run build` produces a static `dist/` folder, you can host it anywhere
that serves static files:

- **Vercel / Netlify**: connect the repo (or drag-and-drop the `dist/` folder) —
  they auto-detect Vite and run `npm run build` for you. Set the `VITE_API_URL`
  environment variable in their dashboard to point at your deployed backend.
- **GitHub Pages**: push `dist/` to a `gh-pages` branch, or use an action that
  runs the build for you.
- Any static host / shared hosting: upload the contents of `dist/` after running
  the build.

The app uses `HashRouter` (URLs look like `/#/shop`), so it works correctly on
static hosts without any extra server-side rewrite rules — no special config needed.

## What's real vs. what's mocked

- **Real**: product listing/filtering/sorting/search (live from the database),
  product detail pages, cart math, wishlist, customer accounts and order
  history, order creation (server validates and recalculates prices — see the
  backend README), and Mobile Money/Card payments through Paystack.
- **Still manual**: Bank Transfer orders are created immediately as
  "pending" — there's no automated way to confirm those arrived, so the
  store owner checks and updates the order status by hand in the admin
  dashboard.

## Next steps toward a real store

1. Build a way to reconcile Bank Transfer orders (or drop that option and
   route everyone through Paystack, which does support bank transfers too).
2. Add Paystack webhook handling as a backup path — right now payment
   confirmation relies on the browser staying open through the popup; a
   webhook would catch payments that complete after the tab closes.
3. Build an admin dashboard for managing products and orders (the backend's
   admin routes are ready — `/api/products` POST/PUT/DELETE and
   `/api/orders/admin/all`).

I can help with any of these when you're ready.

