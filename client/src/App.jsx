import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';
import AIChatbot from './components/AIChatbot/AIChatbot';
import { useAuth } from './context/AuthContext';

// Lazy-load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Support Pages
const ReturnsRefunds = lazy(() => import('./pages/Support/ReturnsRefunds'));
const ShippingPolicy = lazy(() => import('./pages/Support/ShippingPolicy'));
const FAQ = lazy(() => import('./pages/Support/FAQ'));
const BulkOrders = lazy(() => import('./pages/Support/BulkOrders'));
const VendorProgram = lazy(() => import('./pages/Support/VendorProgram'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <div className="app">
      <Navbar />
      
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            
            {/* Support Routes */}
            <Route path="/returns-refunds" element={<ReturnsRefunds />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/bulk-orders" element={<BulkOrders />} />
            <Route path="/vendor-program" element={<VendorProgram />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}

export default App;
