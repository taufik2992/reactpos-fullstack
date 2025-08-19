import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkShiftProvider } from "./context/WorkShiftContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { MenuManagement } from "./pages/admin/MenuManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { Reports } from "./pages/admin/Reports";
import { UserDashboard } from "./pages/user/UserDashboard";
import { Orders } from "./pages/user/Orders";
import { OrderHistory } from "./pages/user/OrderHistory";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkShiftProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--toast-bg)",
                    color: "var(--toast-color)",
                    border: "1px solid var(--toast-border)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10B981",
                      secondary: "#FFFFFF",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#EF4444",
                      secondary: "#FFFFFF",
                    },
                  },
                }}
              />

              <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/menu"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <MenuManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Cashier Routes */}
                <Route
                  path="/user/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <Layout>
                        <UserDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/orders"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <Layout>
                        <Orders />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/history"
                  element={
                    <ProtectedRoute requiredRole="cashier">
                      <Layout>
                        <OrderHistory />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </WorkShiftProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
