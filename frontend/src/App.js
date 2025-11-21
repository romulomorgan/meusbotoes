import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Main Landing */}
          <Route index element={<LandingPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />

          {/* Auth Routes */}
          <Route path="login" element={<PlaceholderPage />} />
          <Route path="cadastro" element={<PlaceholderPage />} />

          {/* User Routes */}
          <Route path="painel" element={<PlaceholderPage />} />
          <Route path="meus-botoes" element={<PlaceholderPage />} />
          <Route path="configuracoes" element={<PlaceholderPage />} />

          {/* Billing Routes */}
          <Route path="pagamento" element={<PlaceholderPage />} />
          <Route path="planos" element={<PlaceholderPage />} />

          {/* Admin Routes */}
          <Route path="admin" element={<PlaceholderPage />} />
          <Route path="admin/pagamentos" element={<PlaceholderPage />} />
          <Route path="admin/usuarios" element={<PlaceholderPage />} />

          {/* Footer Routes */}
          <Route path="termos" element={<PlaceholderPage />} />
          <Route path="privacidade" element={<PlaceholderPage />} />
          <Route path="contato" element={<PlaceholderPage />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
