# 📘 API Documentation — MultiStore Stock Management System

**Version:** 1.0.0  
**Base URL:** `https://api.multistore.app/api`  
**Auth:** Bearer JWT Token  
**Format:** JSON

---

## 🔐 Authentication

### `POST /auth/register`
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "SecurePass123!",
  "role": "manager",
  "branchId": "64a1b2c3d4e5f6789012"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "Jean Dupont", "role": "manager" }
}
```

**Errors:** `400` Email déjà utilisé | `422` Données invalides

---

### `POST /auth/login`
Connexion et obtention du token JWT.

**Body:**
```json
{ "email": "jean@example.com", "password": "SecurePass123!" }
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "user": { "_id": "...", "name": "Jean Dupont", "role": "manager", "branchId": "..." }
}
```

**Errors:** `401` Identifiants incorrects | `404` Utilisateur introuvable

---

### `GET /auth/me` 🔒
Récupérer le profil de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "_id": "64a1b2c3d4e5f6789012",
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "role": "manager",
  "branch": { "_id": "...", "name": "Magasin Centre-Ville" }
}
```

---

## 🏪 Branches

### `GET /branches` 🔒 (Admin)
Lister toutes les succursales.

**Query Params:** `?status=active&limit=10&page=1`

**Response 200:**
```json
{
  "success": true,
  "count": 3,
  "branches": [
    { "_id": "...", "name": "Magasin Centre", "location": "Ouagadougou", "status": "active", "manager": { "name": "..." } }
  ]
}
```

---

### `POST /branches` 🔒 (Admin)
Créer une nouvelle succursale.

**Body:**
```json
{
  "name": "Magasin Nord",
  "location": "Ouagadougou, Secteur 12",
  "phone": "+226 70 00 00 00",
  "managerId": "64a1b2c3d4e5f6789012"
}
```

**Response 201:**
```json
{ "success": true, "branch": { "_id": "...", "name": "Magasin Nord", ... } }
```

---

### `GET /branches/:id` 🔒
Détails d'une succursale.

**Response 200:**
```json
{
  "_id": "...", "name": "Magasin Nord",
  "manager": { "name": "...", "email": "..." },
  "inventoryCount": 42, "totalValue": 1500000
}
```

---

### `PUT /branches/:id` 🔒 (Admin)
Mettre à jour une succursale.

### `DELETE /branches/:id` 🔒 (Admin)
Désactiver une succursale.

---

## 📦 Products

### `GET /products` 🔒
Lister tous les produits.

**Query Params:** `?category=electronics&search=iphone&limit=20`

**Response 200:**
```json
{
  "products": [
    { "_id": "...", "name": "iPhone 14", "sku": "APL-IP14", "category": "Electronics", "unitPrice": 650000 }
  ],
  "total": 150, "page": 1, "pages": 8
}
```

---

### `POST /products` 🔒 (Admin)
Créer un nouveau produit.

**Body:**
```json
{
  "name": "iPhone 14",
  "sku": "APL-IP14",
  "category": "Electronics",
  "unitPrice": 650000,
  "description": "Smartphone Apple 128GB",
  "imageUrl": "https://cdn.example.com/iphone14.jpg"
}
```

---

### `PATCH /products/:id` 🔒 (Admin)
Mise à jour partielle d'un produit.

### `DELETE /products/:id` 🔒 (Admin)
Supprimer un produit.

---

## 🗄️ Inventory

### `GET /inventory/:branchId` 🔒
Stock d'une succursale.

**Query Params:** `?status=low&category=electronics`

**Response 200:**
```json
{
  "branch": { "_id": "...", "name": "Magasin Centre" },
  "inventory": [
    {
      "_id": "...",
      "product": { "name": "iPhone 14", "sku": "APL-IP14" },
      "quantity": 5,
      "minStockAlert": 10,
      "status": "low",
      "lastUpdated": "2026-03-09T12:00:00Z"
    }
  ],
  "lowStockCount": 3,
  "outOfStockCount": 1
}
```

---

### `PATCH /inventory/:id` 🔒
Mettre à jour la quantité en stock.

**Body:**
```json
{ "quantity": 50, "minStockAlert": 10 }
```

---

### `GET /inventory/alerts` 🔒
Récupérer toutes les alertes de stock bas.

**Response 200:**
```json
{
  "alerts": [
    {
      "_id": "...",
      "type": "low",
      "product": { "name": "iPhone 14" },
      "branch": { "name": "Magasin Centre" },
      "currentQty": 5,
      "minQty": 10,
      "createdAt": "2026-03-09T08:00:00Z"
    }
  ]
}
```

---

## 🔄 Transfers

### `POST /transfers` 🔒
Initier un transfert de stock.

**Body:**
```json
{
  "fromBranchId": "64a1b2c3d4e5f67890a1",
  "toBranchId":   "64a1b2c3d4e5f67890b2",
  "productId":    "64a1b2c3d4e5f67890c3",
  "quantity": 20,
  "note": "Réapprovisionnement urgent"
}
```

**Response 201:**
```json
{
  "success": true,
  "transfer": {
    "_id": "...",
    "status": "pending",
    "fromBranch": { "name": "Magasin Centre" },
    "toBranch":   { "name": "Magasin Nord" },
    "product":    { "name": "iPhone 14" },
    "quantity": 20,
    "createdAt": "2026-03-09T10:00:00Z"
  }
}
```

**Errors:** `400` Stock insuffisant | `404` Branche/Produit introuvable

---

### `GET /transfers` 🔒
Historique des transferts.

**Query Params:** `?branchId=...&status=pending&from=2026-01-01&to=2026-03-09`

---

### `PATCH /transfers/:id/status` 🔒
Valider ou annuler un transfert.

**Body:**
```json
{ "status": "completed" }
```

---

## 💰 Sales

### `POST /sales` 🔒
Enregistrer une vente (réduit automatiquement le stock).

**Body:**
```json
{
  "branchId": "64a1b2c3d4e5f67890a1",
  "items": [
    { "productId": "...", "quantity": 2, "unitPrice": 650000 },
    { "productId": "...", "quantity": 1, "unitPrice": 25000 }
  ],
  "paymentMethod": "cash",
  "discount": 0
}
```

**Response 201:**
```json
{
  "success": true,
  "sale": { "_id": "...", "totalAmount": 1325000, "itemsCount": 3 },
  "inventoryUpdated": true
}
```

---

### `GET /sales` 🔒
Historique des ventes.

**Query Params:** `?branchId=...&from=2026-01-01&to=2026-03-09&limit=50`

---

## 📊 Dashboard

### `GET /dashboard/overview` 🔒 (Admin)
Vue globale du système.

**Response 200:**
```json
{
  "totalBranches": 4,
  "totalProducts": 250,
  "totalStockValue": 45000000,
  "lowStockAlerts": 12,
  "outOfStockAlerts": 3,
  "todaySales": { "count": 45, "total": 8750000 },
  "pendingTransfers": 5,
  "topSellingProducts": [
    { "product": "iPhone 14", "quantitySold": 120, "revenue": 78000000 }
  ]
}
```

---

## ⚠️ Error Codes

| Code | Signification |
|------|--------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Données invalides |
| `401` | Non authentifié (token manquant/expiré) |
| `403` | Non autorisé (rôle insuffisant) |
| `404` | Ressource introuvable |
| `409` | Conflit (doublon) |
| `422` | Erreur de validation |
| `500` | Erreur serveur interne |

**Format d'erreur standard:**
```json
{
  "success": false,
  "error": { "code": 400, "message": "Stock insuffisant pour le transfert", "field": "quantity" }
}
```

---

## 🔑 Rôles & Permissions

| Endpoint | Admin | Manager | Cashier |
|----------|-------|---------|---------|
| Créer une branche | ✅ | ❌ | ❌ |
| Voir le stock | ✅ | ✅ (sa branche) | ❌ |
| Créer un transfert | ✅ | ✅ | ❌ |
| Enregistrer une vente | ✅ | ✅ | ✅ |
| Dashboard global | ✅ | ❌ | ❌ |
| Gérer les produits | ✅ | ❌ | ❌ |

---

*Généré le 09/03/2026 — Projet CS27 — Personne 5*
