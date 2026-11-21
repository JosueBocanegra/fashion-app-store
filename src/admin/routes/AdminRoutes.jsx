import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Usuarios from "../pages/Usuarios";
import Publicidad from "../pages/Publicidad";
import Productos from "../pages/Productos";
import Ventas from "../pages/Ventas";

import {
  esAdministrador,
  obtenerUsuarioSesion,
  obtenerRutaInicial,
  tieneAccesoModulo,
} from "../utils/permisos";

/* =====================================================
   PROTECCIÓN DE SESIÓN
   ===================================================== */

const ProtectedRoute = ({ children }) => {
  const usuario = obtenerUsuarioSesion();

  return usuario
    ? children
    : <Navigate to="/admin/login" replace />;
};

/* =====================================================
   PROTECCIÓN POR MÓDULO
   ===================================================== */

const ModuloProtegido = ({ modulo, children }) => {
  const usuario = obtenerUsuarioSesion();

  if (!usuario) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!tieneAccesoModulo(usuario, modulo)) {
    return (
      <Navigate
        to={obtenerRutaInicial(usuario)}
        replace
      />
    );
  }

  return children;
};

/* =====================================================
   SOLO ADMINISTRADOR
   ===================================================== */

const SoloAdministrador = ({ children }) => {
  const usuario = obtenerUsuarioSesion();

  if (!esAdministrador(usuario)) {
    return (
      <Navigate
        to={obtenerRutaInicial(usuario)}
        replace
      />
    );
  }

  return children;
};

/* =====================================================
   SIN MÓDULOS ASIGNADOS
   ===================================================== */

const SinAcceso = () => {
  const usuario = obtenerUsuarioSesion();

  if (esAdministrador(usuario)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="admin-module-page">
      <section className="admin-table-card">
        <div className="admin-empty-state">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EEF0] text-[#702D40]">
            <span className="text-2xl">!</span>
          </div>

          <h2 className="admin-empty-state__title">
            No tienes módulos asignados
          </h2>

          <p className="mx-auto max-w-md">
            Tu cuenta todavía no tiene permisos para acceder a los módulos
            del sistema. Comunícate con el administrador para solicitar
            acceso.
          </p>
        </div>
      </section>
    </div>
  );
};

/* =====================================================
   REDIRECCIÓN INICIAL
   ===================================================== */

const RedireccionInicio = () => {
  const usuario = obtenerUsuarioSesion();

  return (
    <Navigate
      to={obtenerRutaInicial(usuario)}
      replace
    />
  );
};

/* =====================================================
   RUTAS ADMINISTRATIVAS
   ===================================================== */

const AdminRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<RedireccionInicio />} />

      <Route
        path="dashboard"
        element={
          <ModuloProtegido modulo="dashboard">
            <Dashboard />
          </ModuloProtegido>
        }
      />

      <Route
        path="productos"
        element={
          <ModuloProtegido modulo="productos">
            <Productos />
          </ModuloProtegido>
        }
      />

      <Route
        path="clientes"
        element={
          <ModuloProtegido modulo="clientes">
            <Clientes />
          </ModuloProtegido>
        }
      />

      <Route
        path="ventas"
        element={
          <ModuloProtegido modulo="ventas">
            <Ventas />
          </ModuloProtegido>
        }
      />

      <Route
        path="publicidad"
        element={
          <ModuloProtegido modulo="publicidad">
            <Publicidad />
          </ModuloProtegido>
        }
      />

      <Route
        path="usuarios"
        element={
          <SoloAdministrador>
            <Usuarios />
          </SoloAdministrador>
        }
      />

      <Route
        path="sin-acceso"
        element={<SinAcceso />}
      />

      <Route
        path="*"
        element={<RedireccionInicio />}
      />
    </Route>
  </Routes>
);

export default AdminRoutes;


