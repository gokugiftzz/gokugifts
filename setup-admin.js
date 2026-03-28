const fs = require('fs');
const path = require('path');

const clientSrc = path.join(__dirname, 'client', 'src');
const adminSrc = path.join(__dirname, 'admin', 'src');

// Helper to copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// 1. Copy essential folders
copyDir(path.join(clientSrc, 'components'), path.join(adminSrc, 'components'));
copyDir(path.join(clientSrc, 'context'), path.join(adminSrc, 'context'));
copyDir(path.join(clientSrc, 'utils'), path.join(adminSrc, 'utils'));
copyDir(path.join(clientSrc, 'styles'), path.join(adminSrc, 'styles'));

// 2. Copy Pages (only Admin + Auth)
if (!fs.existsSync(path.join(adminSrc, 'pages', 'Admin'))) {
    fs.mkdirSync(path.join(adminSrc, 'pages', 'Admin'), { recursive: true });
}
copyDir(path.join(clientSrc, 'pages', 'Admin'), path.join(adminSrc, 'pages', 'Admin'));
fs.copyFileSync(path.join(clientSrc, 'pages', 'Login.jsx'), path.join(adminSrc, 'pages', 'Login.jsx'));
// Login.module.css was missing, let's touch it just in case
fs.writeFileSync(path.join(adminSrc, 'pages', 'Login.module.css'), `.page { padding: 100px 20px; }`);
fs.copyFileSync(path.join(clientSrc, 'pages', 'NotFound.jsx'), path.join(adminSrc, 'pages', 'NotFound.jsx'));

// 3. Write admin/src/App.jsx
const appJsx = `
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './styles/globals.css';

const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/Admin/AdminProducts'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<div>Orders (Coming Soon)</div>} />
            <Route path="users" element={<div>Users (Coming Soon)</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
`;
fs.writeFileSync(path.join(adminSrc, 'App.jsx'), appJsx.trim());

// 4. Write admin/src/main.jsx
const mainJsx = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;
fs.writeFileSync(path.join(adminSrc, 'main.jsx'), mainJsx.trim());

// 5. Update admin Vite config
const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Admin runs on 5174
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true
      }
    }
  }
})
`;
fs.writeFileSync(path.join(__dirname, 'admin', 'vite.config.js'), viteConfig.trim());

console.log("Admin setup complete!");
