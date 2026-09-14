const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const hoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 mb-2">
          Resumen
        </p>
        <h2 className="text-3xl font-light text-neutral-900 tracking-tight">
          Hola, {user.nombre || "Administrador"}
        </h2>
        <p className="text-sm text-neutral-500 mt-1.5 capitalize">{hoy}</p>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-px w-10 bg-stone-300" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
            Panel administrativo
          </span>
        </div>

        <h3 className="text-xl font-light text-neutral-800 mb-3">
          Bienvenido al espacio interno de Fashion Store.
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          Desde aquí podrás gestionar la información de la tienda a medida que
          los distintos módulos del sistema se vayan habilitando.
        </p>
      </div>

      {/* Nota de módulos en camino */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Clientes", "Productos", "Usuarios", "Publicidad"].map((m) => (
          <div
            key={m}
            className="bg-white rounded-xl border border-dashed border-stone-300/80 p-5"
          >
            <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-400 mb-1">
              Módulo
            </p>
            <p className="text-sm text-neutral-600">{m}</p>
            <p className="text-[11px] text-neutral-400 mt-3">Próximamente</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


