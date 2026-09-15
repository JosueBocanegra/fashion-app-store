import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("adminUser");
  return user ? children : <Navigate to="/admin/login" replace />;
};

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="clientes" element={<Clientes />} />
      {/*
          
          <Route path="productos"  element={<Productos />} />
          <Route path="usuarios"   element={<Usuarios />} />
          <Route path="publicidad" element={<Publicidad />} />
      */}
    </Route>
  </Routes>
);

export default AdminRoutes;


