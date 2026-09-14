import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Productos from "./pages/Productos";
import Contacto from "./pages/Contacto";
import NotFound from "./pages/NotFound";
import Login from "./admin/pages/Login";
import AdminRoutes from "./admin/routes/AdminRoutes";

// público
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Selección de rutas según el tipo de usuario (público o admin)
function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    );
  }

  return <PublicLayout />;
}

// ---------- App ----------
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


