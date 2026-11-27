import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LegalAgreement from './pages/public/LegalAgreement';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewRequest from './pages/customer/NewRequest';
import RequestDetails from './pages/customer/RequestDetails';
import Profile from './pages/customer/Profile';

// Technician Pages
import TechnicianJobs from './pages/technician/TechnicianJobs';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ExportReports from './pages/admin/ExportReports';
import ManageRequests from './pages/admin/ManageRequests';
import Customers from './pages/admin/Customers';
import Payments from './pages/admin/Payments';
import ManageInquiries from './pages/admin/ManageInquiries';
import ActivityLogs from './pages/admin/ActivityLogs';
import DeveloperContract from './pages/admin/DeveloperContract';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/legal" element={<LegalAgreement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/new-request" element={<NewRequest />} />
            <Route path="/customer/requests/:id" element={<RequestDetails />} />
            <Route path="/customer/profile" element={<Profile />} />
          </Route>

          {/* Technician Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
            <Route path="/technician/jobs" element={<TechnicianJobs />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/requests" element={<ManageRequests />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/inquiries" element={<ManageInquiries />} />
            <Route path="/admin/reports" element={<ExportReports />} />
            <Route path="/admin/activity-logs" element={<ActivityLogs />} />
            <Route path="/admin/developer-contract" element={<DeveloperContract />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;