# E-commerce Stock & Order Management (MERN)

Upgraded from inventory CRUD to a complete multi-channel stock and order system.

## Stack

- Frontend: React (Vite), Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Auth: JWT + bcrypt
- Validation: express-validator
- Export: CSV (`json2csv`)

## Folder Structure

```text
inventory-management/
|-- frontend/
`-- backend/
    |-- config/
    |-- controllers/
    |-- middleware/
    |-- models/
    |-- routes/
    |-- services/
    |-- utils/
    `-- validators/
```

## Backend Models

### User

- `name`, `email`, `password`, `role (admin|staff)`

### Product

- `userId`
- `name`, `sku` (unique per user), `barcode`
- `category`, `description`
- `sellingPrice`, `costPrice` (Number, INR)
- `quantityAvailable`, `minimumStockLevel`, `reservedStock`
- `marketplaceStock.amazonStock`, `flipkartStock`, `meeshoStock`
- `supplierId`
- `isDeleted`

### StockTransaction

- `userId`, `productId`
- `type` (`IN|OUT|RETURN|DAMAGE`)
- `quantity`
- `platform` (`Amazon|Flipkart|Meesho|Offline|Supplier`)
- `referenceId`, `note`, `date`

### Order

- `userId`, `orderId` (unique per user)
- `platform`, `productId`, `quantity`
- `sellingPrice`, `totalAmount` (INR)
- `status` (`Pending|Shipped|Delivered|Cancelled|Returned`)
- `orderDate`, `isDeleted`

### Purchase

- `userId`, `supplierName`, `invoiceNumber` (unique per user)
- `productId`, `quantityPurchased`
- `purchasePrice`, `totalCost` (INR)
- `purchaseDate`, `isDeleted`

### Supplier

- `userId`, `name`, `email`, `phone`, `address`, `isDeleted`

## Stock Logic

- Stock is transaction-driven only.
- Product quantity is recalculated from ledger:
  - `Available = IN - OUT - DAMAGE + RETURN`
- Manual product quantity edits are blocked.
- Overselling prevention:
  - Order creation fails if `quantityAvailable < order quantity`.
- Order lifecycle:
  - Create order -> adds `OUT` transaction.
  - Cancel/Return -> adds `RETURN` transaction.
- Purchase creation -> adds `IN` transaction.

## API Routes

Base: `http://localhost:5000`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products` (search/filter/sort/pagination)
- `POST /api/products`
- `POST /api/products/bulk-upload`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id` (soft delete)

### Orders

- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id` (soft delete)

### Purchases

- `GET /api/purchases`
- `POST /api/purchases`
- `DELETE /api/purchases/:id` (soft delete)

### Stock Ledger

- `GET /api/stock-transactions`
- `POST /api/stock-transactions`

### Dashboard

- `GET /api/dashboard/summary`

### Reports

- `GET /api/reports/daily-sales`
- `GET /api/reports/monthly-sales`
- `GET /api/reports/platform-sales`
- `GET /api/reports/dead-stock`
- `GET /api/reports/fast-moving`
- `GET /api/reports/profit`
- CSV export on each report: add query `?export=csv`

## Frontend Pages

- Home
- Signup / Login
- Dashboard
- Products
- Add/Edit Product
- Orders
- Create Order
- Purchases
- Stock Ledger
- Low Stock Alerts
- Reports

## INR Handling

- All price fields are stored as `Number` in MongoDB.
- Frontend renders INR using `Intl.NumberFormat("en-IN", { currency: "INR" })`.

## Environment Variables

### Backend `backend/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
```

### Frontend `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

## Run

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seed Data

```bash
cd backend
npm run seed
```

Seed login:

- Email: `admin@example.com`
- Password: `Admin@123`

## Example API Requests

### Create Product

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bluetooth Speaker",
  "autoGenerateSku": true,
  "category": "Electronics",
  "description": "Portable speaker",
  "sellingPrice": 1999,
  "costPrice": 1200,
  "minimumStockLevel": 8,
  "marketplaceStock": {
    "amazonStock": 30,
    "flipkartStock": 20,
    "meeshoStock": 10
  }
}
```

### Create Order

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "AMZ-10101",
  "platform": "Amazon",
  "productId": "<product_id>",
  "quantity": 2,
  "sellingPrice": 1999
}
```

### Create Purchase

```http
POST /api/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierName": "Prime Traders",
  "invoiceNumber": "INV-2201",
  "productId": "<product_id>",
  "quantityPurchased": 50,
  "purchasePrice": 1200
}
```

### Manual Damage Transaction

```http
POST /api/stock-transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "<product_id>",
  "type": "DAMAGE",
  "quantity": 1,
  "platform": "Offline",
  "referenceId": "DMG-0001",
  "note": "Damaged in transit"
}
```
