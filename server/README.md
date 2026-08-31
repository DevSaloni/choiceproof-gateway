# ChoiceProof Gateway - Backend (Server)

Express.js + TypeScript backend API for ChoiceProof Gateway decision management system.

## 🎯 Purpose

RESTful API server for handling:
- User authentication & authorization
- Product data management
- Decision tracking & verification
- Intent locking mechanism
- Offer management & verification
- Payment processing integration
- Receipt generation & retrieval

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

## 📁 Project Structure (Recommended)

```
server/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── config/
│   │   ├── environment.ts          # Env validation
│   │   └── database.ts             # DB connection
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication
│   │   ├── errorHandler.ts         # Error handling
│   │   ├── cors.ts                 # CORS config
│   │   └── validation.ts           # Request validation
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── auth.ts                 # Authentication routes
│   │   ├── products.ts             # Product routes
│   │   ├── selections.ts           # Selection/decision routes
│   │   ├── offers.ts               # Offers routes
│   │   └── receipts.ts             # Receipt routes
│   ├── controllers/
│   │   ├── authController.ts       # Auth logic
│   │   ├── productController.ts    # Product logic
│   │   ├── selectionController.ts  # Selection logic
│   │   ├── offerController.ts      # Offer logic
│   │   └── receiptController.ts    # Receipt logic
│   ├── services/
│   │   ├── authService.ts          # Auth business logic
│   │   ├── productService.ts       # Product business logic
│   │   ├── decisionService.ts      # Decision logic
│   │   └── paymentService.ts       # Payment integration
│   ├── models/
│   │   ├── User.ts                 # User data model
│   │   ├── Product.ts              # Product model
│   │   ├── Decision.ts             # Decision model
│   │   └── Offer.ts                # Offer model
│   ├── types/
│   │   ├── index.ts                # Type exports
│   │   ├── api.ts                  # API response types
│   │   ├── errors.ts               # Error types
│   │   └── database.ts             # DB schema types
│   ├── utils/
│   │   ├── logger.ts               # Logging utility
│   │   ├── validators.ts           # Validation schemas (Zod)
│   │   ├── errorHandler.ts         # Error utilities
│   │   └── helpers.ts              # Helper functions
│   └── constants/
│       └── messages.ts             # Error/success messages
├── prisma/                         # Prisma ORM (if using)
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # DB migrations
├── .env                            # Environment variables (NOT committed)
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with auto-reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm test` | Run tests (when configured) |

## 📦 Dependencies

### Production
- **express@5.2.1** - Web framework
- **cors@2.8.6** - Cross-origin request handling
- **dotenv@17.4.2** - Environment variable management
- **zod@4.5.4** - Schema validation

### Development
- **typescript@7.0.2** - Type checking
- **tsx@4.23.13** - Run TypeScript directly
- **@types/express@5.0.6** - Express type definitions
- **@types/cors@2.8.19** - CORS type definitions
- **@types/node@26.4.0** - Node type definitions

## 🔌 API Endpoints (Recommended Structure)

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/refresh           # Refresh token
GET    /api/auth/me                # Get current user
```

### Products
```
GET    /api/products               # List all products
GET    /api/products/:id           # Get product details
POST   /api/products               # Create product (admin)
PUT    /api/products/:id           # Update product (admin)
DELETE /api/products/:id           # Delete product (admin)
```

### Selections/Decisions
```
POST   /api/selections             # Create selection/decision
GET    /api/selections             # List user selections
GET    /api/selections/:id         # Get selection details
PUT    /api/selections/:id/lock    # Lock intent
GET    /api/selections/:id/stability  # Check stability
```

### Offers
```
GET    /api/offers                 # List verified offers
GET    /api/offers/:id             # Get offer details
POST   /api/offers/verify          # Verify offer
```

### Receipts
```
GET    /api/receipts               # List user receipts
GET    /api/receipts/:id           # Get receipt
POST   /api/receipts/:id/download  # Download receipt
```

## 🔐 Environment Variables

Create `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/choiceproof_db
DB_POOL_SIZE=10

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=24h

# Razorpay (Payment Integration)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Feature Flags
ENABLE_RAZORPAY=true
ENABLE_AI_SELECTION=true
```

## 📝 Example Middleware Setup

```typescript
// src/middleware/index.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './errorHandler';
import { authMiddleware } from './auth';

export function setupMiddleware(app: express.Application) {
  // Built-in middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }));
  
  // Authentication (optional for protected routes)
  app.use('/api/protected', authMiddleware);
  
  // Error handling (last middleware)
  app.use(errorHandler);
}
```

## 🧪 Example Validation Schema

```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const createSelectionSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().positive('Quantity must be positive'),
  intentLock: z.boolean().default(false),
});

export type CreateSelectionInput = z.infer<typeof createSelectionSchema>;

// In route handler:
import { createSelectionSchema } from '../utils/validators';

app.post('/api/selections', (req, res) => {
  try {
    const data = createSelectionSchema.parse(req.body);
    // Process validated data
    res.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    }
  }
});
```

## 🔄 Request/Response Pattern

### Standard Response Format

```typescript
// Success
{
  "success": true,
  "data": { /* actual data */ },
  "timestamp": "2026-09-01T10:30:00Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* error details */ }
  },
  "timestamp": "2026-09-01T10:30:00Z"
}
```

## 🗄️ Database Integration (Recommended: Prisma)

### Setup Prisma

```bash
npm install @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init
```

### Example Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  selections Selection[]
}

model Selection {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  intentLocked Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Deployment Checklist

- ✅ All environment variables configured
- ✅ Database migrations run (`prisma migrate deploy`)
- ✅ Error logging configured
- ✅ CORS properly configured
- ✅ Rate limiting implemented
- ✅ Input validation on all endpoints
- ✅ Authentication/authorization working
- ✅ Health check endpoint available
- ✅ Secrets not exposed in logs

## 🐛 Debugging

### Enable Debug Logging

```bash
DEBUG=* npm run dev
```

### VS Code Debug Config

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/src/index.ts",
      "runtimeArgs": ["--loader", "tsx/esm"],
      "cwd": "${workspaceFolder}/server"
    }
  ]
}
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)
- [Prisma ORM](https://www.prisma.io/docs/)
- [CORS Middleware](https://github.com/expressjs/cors)
- [Razorpay API](https://razorpay.com/docs/api/)

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Validate all inputs** with Zod
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Hash passwords** (bcrypt)
6. **Use JWT for stateless auth**
7. **Log sensitive operations**
8. **Regular security updates**

---

**Created**: 2026-09-01 | **Last Updated**: 2026-09-01
