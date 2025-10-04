# Prashikshan Web Panel

A complete React-based web application for the Prashikshan Internship Management System.

## 🚀 Quick Start

```bash
cd frontend-web
npm install
npm run dev
```

The app will run at `http://localhost:3000`

## 🛠️ Tech Stack

- **React 18 + TypeScript** - Modern UI with type safety
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Axios** - API client
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons

## ✨ Features

### Complete Feature Parity with Mobile App

- ✅ **Authentication** - Login, Register, Forgot Password
- ✅ **Role-Based Dashboards** - Student, Faculty, Industry, Admin
- ✅ **Applications Management** - Create, view, approve/reject
- ✅ **Internships** - Post, browse, apply
- ✅ **Logbook System** - Create entries, faculty approval
- ✅ **Analytics** - Comprehensive dashboards with charts
- ✅ **Credits Tracking** - NEP credit management
- ✅ **Notifications** - Real-time notifications
- ✅ **Profile Management** - View and edit profiles
- ✅ **Settings** - App preferences
- ✅ **Skill Readiness** - Training modules

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (all features)
├── layouts/          # Layout components
├── hooks/            # Custom React hooks for API calls
├── store/            # Zustand state management
├── lib/              # Utilities, types, API client
├── App.tsx           # Main app with routing
└── main.tsx          # Entry point
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:8000`

### Setup

```powershell
# Navigate to frontend-web directory
cd frontend-web

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

## 🔑 Default Credentials

Use any credentials created in the mobile app or backend.

## 📦 Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🎨 UI/UX Features

- **Responsive Design** - Works on all screen sizes
- **Modern Interface** - Clean, professional look
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time validation
- **Interactive Charts** - Data visualization
- **Role-Based Navigation** - Customized per user role

## 📄 API Integration

Connects to FastAPI backend. All requests use JWT authentication via Axios interceptors.

## 🐛 Troubleshooting

**Port in use?** Change port in `vite.config.ts`

**API errors?** Ensure backend is running at `http://localhost:8000`

**Build fails?** Try: `rm -rf node_modules && npm install`

## 👥 Team

Prashikshan Team - Smart India Hackathon 2024

---

**Status**: ✅ Fully functional web panel with all mobile app features
