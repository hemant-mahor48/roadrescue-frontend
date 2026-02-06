import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import ProfilePage from './pages/ProfilePage';
import RequestPage from './pages/RequestPage';
import MechanicRegistrationPage from './pages/MechanicRegistrationPage';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-900 to-gray-900">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1c23',
              color: '#fff',
              border: '1px solid #f95d13',
            },
            success: {
              iconTheme: {
                primary: '#f95d13',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={user?.role === 'MECHANIC' ? '/mechanic/dashboard' : '/dashboard'} /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to={user?.role === 'MECHANIC' ? '/mechanic/dashboard' : '/dashboard'} /> : <RegisterPage />
          } />

          {/* Protected Customer Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          } />
          <Route path="/request/new" element={
            <PrivateRoute>
              <RequestPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/become-mechanic" element={
            <PrivateRoute>
              <MechanicRegistrationPage />
            </PrivateRoute>
          } />

          {/* Protected Mechanic Routes */}
          <Route path="/mechanic/dashboard" element={
            <PrivateRoute>
              <MechanicDashboard />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
