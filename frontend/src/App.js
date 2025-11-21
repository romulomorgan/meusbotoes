import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Layouts
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import Overview from "./pages/dashboard/Overview";
import MyButtons from "./pages/dashboard/MyButtons";
import UserList from "./pages/admin/UserList";
import InstructionsPage from "./pages/InstructionsPage";
import PlansPage from "./pages/dashboard/PlansPage";
import MyPlanPage from "./pages/dashboard/MyPlanPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            
            <Route path="login" element={<LoginPage />} />
            <Route path="cadastro" element={<RegisterPage />} />
            <Route path="recuperar-senha" element={<ForgotPasswordPage />} />

            <Route path="termos" element={<PlaceholderPage />} />
            <Route path="privacidade" element={<PlaceholderPage />} />
            <Route path="contato" element={<PlaceholderPage />} />
            
            <Route path="instrucoes" element={<InstructionsPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="painel" element={<Overview />} />
            <Route path="meus-botoes" element={<MyButtons />} />
            <Route path="planos" element={<PlansPage />} />
            <Route path="meus-planos" element={<MyPlanPage />} />
            <Route path="pagamento" element={<PlaceholderPage />} />
            <Route path="configuracoes" element={<PlaceholderPage />} />
            
            {/* Admin Routes */}
            <Route path="admin/usuarios" element={<ProtectedRoute adminOnly><UserList /></ProtectedRoute>} />
            <Route path="admin/pagamentos" element={<ProtectedRoute adminOnly><PlaceholderPage /></ProtectedRoute>} />
            <Route path="admin" element={<Navigate to="/admin/usuarios" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
