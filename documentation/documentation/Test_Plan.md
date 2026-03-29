# 🧪 Test Plan — MultiStore Stock Management System

**Projet:** CS27 — MultiStore  
**Personne:** 5 — Documentation & Tests  
**Outils:** Jest, Supertest, Cypress, Flutter Test  

---

## 1. Stratégie de Tests

### Pyramide de tests
```
         /\
        /E2E\        10% — Cypress / Flutter Integration Test
       /------\
      /  Intég. \    30% — Supertest + MongoDB Memory Server
     /------------\
    /   Unitaires  \ 60% — Jest (services, utils, models)
   /________________\
```

**Objectif couverture : ≥ 80%**

---

## 2. Tests Unitaires — Jest

### Installation
```bash
cd backend
npm install --save-dev jest @types/jest ts-jest
```

### `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: { global: { lines: 80, functions: 80 } },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

---

### Test 1 — Service d'inventaire

**Fichier:** `src/__tests__/inventory.service.test.ts`

```typescript
import { InventoryService } from '../services/inventory.service';

describe('InventoryService', () => {
  
  test('should detect low stock when quantity < minStockAlert', () => {
    const item = { quantity: 5, minStockAlert: 10 };
    expect(InventoryService.getStatus(item)).toBe('low');
  });

  test('should detect out of stock when quantity = 0', () => {
    const item = { quantity: 0, minStockAlert: 10 };
    expect(InventoryService.getStatus(item)).toBe('out_of_stock');
  });

  test('should return ok when quantity >= minStockAlert', () => {
    const item = { quantity: 15, minStockAlert: 10 };
    expect(InventoryService.getStatus(item)).toBe('ok');
  });

  test('should correctly reduce stock after sale', () => {
    const initial = 50;
    const sold = 10;
    expect(InventoryService.computeNewQty(initial, sold)).toBe(40);
  });

  test('should throw error if sale quantity exceeds stock', () => {
    expect(() => InventoryService.computeNewQty(5, 10))
      .toThrow('Stock insuffisant');
  });
});
```

---

### Test 2 — Service de transfert

**Fichier:** `src/__tests__/transfer.service.test.ts`

```typescript
import { TransferService } from '../services/transfer.service';

describe('TransferService', () => {
  
  test('should validate transfer when source has enough stock', () => {
    const result = TransferService.canTransfer(50, 20);
    expect(result.valid).toBe(true);
  });

  test('should reject transfer if insufficient stock', () => {
    const result = TransferService.canTransfer(5, 20);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Stock insuffisant');
  });

  test('should not allow transfer to same branch', () => {
    const sameId = '64a1b2c3d4e5f6789012';
    expect(() => TransferService.validateBranches(sameId, sameId))
      .toThrow('La source et la destination doivent être différentes');
  });
});
```

---

### Test 3 — Utilitaires JWT

**Fichier:** `src/__tests__/auth.util.test.ts`

```typescript
import { AuthUtil } from '../utils/auth.util';

describe('AuthUtil', () => {
  
  test('should generate a valid JWT token', () => {
    const token = AuthUtil.generateToken({ userId: '123', role: 'admin' });
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('should correctly decode a valid token', () => {
    const payload = { userId: '123', role: 'manager' };
    const token = AuthUtil.generateToken(payload);
    const decoded = AuthUtil.verifyToken(token);
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('manager');
  });

  test('should reject an expired/invalid token', () => {
    expect(() => AuthUtil.verifyToken('invalid.token.here'))
      .toThrow('Token invalide');
  });
});
```

---

## 3. Tests d'Intégration — Supertest

### Setup avec MongoDB en mémoire

```typescript
// src/__tests__/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

---

### Test 4 — Route Auth

**Fichier:** `src/__tests__/routes/auth.route.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/register', () => {
  
  it('should register a new user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'manager'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    // Register first time
    await request(app).post('/api/auth/register').send({
      name: 'User', email: 'dup@test.com', password: 'Pass123!'
    });
    // Register second time with same email
    const res = await request(app).post('/api/auth/register').send({
      name: 'User2', email: 'dup@test.com', password: 'Pass456!'
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  
  it('should return token with correct credentials', async () => {
    // Register user first
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login@test.com', password: 'Pass123!'
    });
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Pass123!' });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });
});
```

---

### Test 5 — Route Inventory

**Fichier:** `src/__tests__/routes/inventory.route.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';

let adminToken: string;
let branchId: string;

beforeEach(async () => {
  // Create admin & get token
  const authRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'Admin123!'
  });
  adminToken = authRes.body.token;
  branchId = authRes.body.user.branchId;
});

describe('GET /api/inventory/:branchId', () => {
  
  it('should return inventory for authenticated user', async () => {
    const res = await request(app)
      .get(`/api/inventory/${branchId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.inventory).toBeDefined();
    expect(Array.isArray(res.body.inventory)).toBe(true);
  });

  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get(`/api/inventory/${branchId}`);
    expect(res.status).toBe(401);
  });
});
```

---

## 4. Tests E2E — Cypress (Web)

### Installation
```bash
cd frontend
npm install --save-dev cypress
npx cypress open
```

### Test 6 — Parcours de vente complet

**Fichier:** `cypress/e2e/sale-flow.cy.ts`

```typescript
describe('Flux de vente complet', () => {
  
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('manager@test.com');
    cy.get('[data-testid="password"]').type('Pass123!');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should complete a sale and reduce inventory', () => {
    // Navigate to POS
    cy.get('[data-testid="nav-pos"]').click();
    
    // Search and add product
    cy.get('[data-testid="product-search"]').type('iPhone');
    cy.get('[data-testid="product-result-0"]').click();
    cy.get('[data-testid="qty-input"]').clear().type('2');
    cy.get('[data-testid="add-to-cart"]').click();
    
    // Verify cart
    cy.get('[data-testid="cart-total"]').should('contain', '1,300,000');
    
    // Confirm sale
    cy.get('[data-testid="confirm-sale"]').click();
    cy.get('[data-testid="payment-cash"]').click();
    cy.get('[data-testid="finalize-sale"]').click();
    
    // Verify success
    cy.get('[data-testid="sale-success-msg"]')
      .should('be.visible')
      .should('contain', 'Vente enregistrée');
    
    // Check inventory was reduced
    cy.visit('/inventory');
    cy.get('[data-testid="product-iphone-qty"]').should('contain', '48'); // was 50
  });

  it('should show low stock alert when inventory drops below threshold', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="alerts-badge"]').should('be.visible');
    cy.get('[data-testid="alerts-panel"]').click();
    cy.get('[data-testid="low-stock-alert"]').should('have.length.at.least', 1);
  });
});
```

---

### Test 7 — Transfert de stock

```typescript
describe('Transfert de stock', () => {
  
  it('should successfully transfer stock between branches', () => {
    cy.login('admin@test.com', 'Admin123!');
    cy.visit('/transfers/new');
    
    cy.get('[data-testid="from-branch"]').select('Magasin Centre');
    cy.get('[data-testid="to-branch"]').select('Magasin Nord');
    cy.get('[data-testid="product-select"]').type('iPhone');
    cy.get('[data-testid="transfer-qty"]').type('10');
    cy.get('[data-testid="submit-transfer"]').click();
    
    cy.get('[data-testid="transfer-success"]').should('contain', 'Transfert initié');
  });
});
```

---

## 5. Tests Flutter (Mobile)

**Fichier:** `test/widget_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:multistore/services/inventory_service.dart';

void main() {
  group('InventoryService Tests', () {
    
    test('should detect low stock', () {
      final status = InventoryService.getStatus(quantity: 3, minAlert: 10);
      expect(status, equals('low'));
    });

    test('should return correct stock status', () {
      expect(InventoryService.getStatus(quantity: 0, minAlert: 5), equals('out_of_stock'));
      expect(InventoryService.getStatus(quantity: 20, minAlert: 10), equals('ok'));
    });
  });
}
```

---

## 6. Commandes à exécuter

```bash
# Tests unitaires + couverture
cd backend && npm test -- --coverage

# Tests d'intégration
npm run test:integration

# E2E (avec serveur lancé)
cd frontend && npx cypress run

# Rapport de couverture HTML
open coverage/lcov-report/index.html
```

---

## 7. Résultats attendus

| Type | Outil | Couverture cible | Statut |
|------|-------|-----------------|--------|
| Unitaires | Jest | ≥ 80% | 🟡 À exécuter |
| Intégration | Supertest | ≥ 70% | 🟡 À exécuter |
| E2E Web | Cypress | Parcours critiques | 🟡 À exécuter |
| Mobile | Flutter Test | ≥ 60% | 🟡 À exécuter |

---

*Projet CS27 — Personne 5 — Mars 2026*
