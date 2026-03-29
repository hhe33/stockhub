# 🏪 MultiStore Stock Management System

> Système centralisé de gestion des stocks pour entreprises multi-succursales

![Stack](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green)
![Stack](https://img.shields.io/badge/Frontend-React.js-blue)
![Stack](https://img.shields.io/badge/Mobile-Flutter-cyan)
![Stack](https://img.shields.io/badge/DB-MongoDB-brightgreen)
![Stack](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📁 Structure du Projet

```
multistore-stock-system/
├── backend/                    # API Node.js / Express
│   ├── src/
│   │   ├── routes/             # Définition des routes API
│   │   ├── controllers/        # Logique métier
│   │   ├── models/             # Schémas MongoDB (Mongoose)
│   │   ├── middleware/         # Auth JWT, validation, rôles
│   │   ├── services/           # Couche service (inventory, transfer...)
│   │   └── utils/              # Fonctions utilitaires
│   ├── __tests__/              # Tests Jest + Supertest
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # Application React.js / Next.js
│   ├── src/
│   │   ├── pages/              # Pages (dashboard, inventory, transfers)
│   │   ├── components/         # Composants réutilisables
│   │   ├── hooks/              # React hooks personnalisés
│   │   └── api/                # Appels API (axios)
│   ├── cypress/                # Tests E2E Cypress
│   └── package.json
│
├── mobile/                     # Application Flutter
│   ├── lib/
│   │   ├── screens/            # Écrans de l'application
│   │   ├── widgets/            # Widgets réutilisables
│   │   ├── services/           # Services API
│   │   └── models/             # Modèles de données
│   └── test/                   # Tests Flutter
│
├── database/
│   ├── schemas/                # Schémas MongoDB documentés
│   ├── seeders/                # Données de test
│   └── migrations/             # Scripts de migration
│
├── documentation/
│   ├── ER_Diagram.svg          # Diagramme Entité-Relation
│   ├── API_Documentation.md    # Documentation API complète
│   ├── Test_Plan.md            # Plan et rapports de tests
│   └── presentation.pptx      # Présentation PowerPoint
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Pipeline CI/CD
│       └── deploy.yml          # Déploiement automatique
│
└── README.md
```

---

## 🚀 Installation rapide

### Prérequis
- Node.js v18+
- Flutter SDK 3.x
- MongoDB 6.x (ou compte MongoDB Atlas)
- Git

### Backend
```bash
cd backend
cp .env.example .env      # Configurer les variables d'environnement
npm install
npm run dev               # Port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # Port 3000
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🌿 Branches Git

| Branche | Usage |
|---------|-------|
| `main` | Production stable uniquement |
| `develop` | Intégration continue |
| `feature/nom-feature` | Nouvelles fonctionnalités |
| `hotfix/nom-fix` | Corrections urgentes en production |

**Convention commits:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`

---

## 🧪 Tests

```bash
# Backend — Tests unitaires + couverture
cd backend && npm test

# Backend — Tests d'intégration
npm run test:integration

# Frontend — Tests E2E Cypress
cd frontend && npx cypress run
```

**Objectif : couverture ≥ 80%**

---

## 👥 Équipe CS27

| Personne | Rôle |
|----------|------|
| Personne 1 | Backend API |
| Personne 2 | Frontend Web |
| Personne 3 | Mobile Flutter |
| Personne 4 | Base de données |
| **Personne 5** | **Documentation + Tests** |

---

## 📄 Licence

Projet académique — CS27 — 2026
