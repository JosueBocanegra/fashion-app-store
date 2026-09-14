const Header = () => {
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-gray-700">Panel Administrativo</h1>
      <span className="text-sm text-gray-600">👤 {user.nombre || "Invitado"}</span>
    </header>
  );
};

export default Header;

