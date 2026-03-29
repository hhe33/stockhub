# STOCKHUB - Multi-Store Management System

STOCKHUB is a premium, high-tech inventory and sales management ecosystem. It consists of a robust Node.js backend, a modern Next.js web dashboard, and a feature-rich Flutter mobile application.

---

## 🌐 Live Production Links   

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Backend API** | Render | [https://stockhub-a450.onrender.com/api](https://stockhub-a450.onrender.com/api) |
| **Web Dashboard** | Vercel | [https://stockhub-frontend-alpha.vercel.app](https://stockhub-frontend-alpha.vercel.app) |
| **Mobile App (Web)** | Netlify | [https://fabulous-fenglisu-4946e1.netlify.app](https://fabulous-fenglisu-4946e1.netlify.app) |
| **API Docs** | Render | [https://stockhub-a450.onrender.com/api-docs](https://stockhub-a450.onrender.com/api-docs) |

---

Follow these steps to get the entire ecosystem running on your machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or a remote Atlas URI)
- **Flutter SDK** (for the mobile application)
- **npm** or **pnpm**

---

## 🛠️ Installation & Setup

### A. Backend (API Server)
1. **Navigate and Install**:
   ```bash
   cd backend
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=mongodb://localhost:27017/stockhub
   JWT_SECRET=your_secure_jwt_secret_here
   ```
3. **Seed & Run**:
   ```bash
   npm run seed      # Initializes the admin account (Run once)
   npm run dev       # Starts the server on http://localhost:5000
   ```
   > 💡 **Swagger Docs**: View API documentation at `http://localhost:5000/api-docs`

---

### B. Frontend (Web Dashboard)
1. **Navigate and Install**:
   ```bash
   cd ../frontend
   npm install
   ```
2. **Run in Development**:
   ```bash
   npm run dev      # Dashboard available at http://localhost:3000
   ```

---

### C. Mobile App (Flutter)
1. **Navigate and Setup**:
   ```bash
   cd ../mobile
   flutter pub get
   ```
2. **Run the App**:
   Ensure you have an emulator running or a device connected:
   ```bash
   flutter run
   ```
   > ⚠️ **Backend Connection**: The mobile app is configured to connect to `10.0.2.2:5000` (standard for Android Emulators). Change `baseUrl` in `lib/api_service.dart` if using a physical device or different setup.

---

## 🔐 Test Credentials (Production)

Use these credentials to log in to the live version:

| Field | Value |
| :--- | :--- |
| **Email** | `test_persistence@stockhub.com` |
| **Password** | `Test@2026!` |

---

## 📂 Project Structure

- `/backend`: Node.js/Express API with MongoDB and JWT.
- `/frontend`: Next.js 16 dashboard with glassmorphic UI.
- `/mobile`: Flutter mobile application for cross-platform usage.

---

## 🛠️ Main Available Scripts

### Backend
- `npm run dev`: Start with nodemon (auto-reload).
- `npm start`: Start in production mode.
- `npm run seed`: Initialize database with test data.
- `npm run reset-db`: **⚠️ DANGER**: Wipes the database and re-seeds.

### Frontend
- `npm run dev`: Local development server.
- `npm run build`: Production build.
- `npm start`: Start production server.

---

## ✅ Post-Setup Checklist
1. [ ] Backend starts without errors (`Server running on port 5000`).
2. [ ] MongoDB is accessible.
3. [ ] `npm run seed` was executed successfully.
4. [ ] Frontend login page loads and accepts credentials.
5. [ ] Mobile app connects to the API.
