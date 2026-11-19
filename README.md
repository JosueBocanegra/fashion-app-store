# Fashion Store

Aplicación web tipo e-commerce desarrollada con React y Vite para la gestión y compra de prendas de moda.

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 19, React Router DOM 7, Tailwind CSS 4
- **Iconografía:** Lucide React
- **Gráficos y Reportes:** Recharts, jsPDF
- **Backend Simulado:** JSON Server (REST API en puerto 3001)
- **Testing:** Vitest
- **Herramienta de Construcción:** Vite 8

## ✨ Características Principales

- **Catálogo de Productos:** Exploración, filtrado y vista previa de prendas.
- **Carrito de Compras:** Gestión reactiva del carrito con cálculo automático de totales.
- **Autenticación:**
  - Registro e inicio de sesión para clientes (`/login-cliente`, `/registro-cliente`).
  - Panel administrativo privado con control de acceso (`/admin/login`).
- **Sección "Mis Pedidos" para Clientes (`/mis-pedidos` - Issue #13):**
  - Consulta de compras históricas filtradas automáticamente por el cliente en sesión.
  - Seguimiento del ciclo de vida del pedido con los 4 estados oficiales: **Pendiente**, **En preparación**, **Enviado** y **Entregado**.
  - Modal interactivo con línea de tiempo (stepper) horizontal compacta y desglose detallado de prendas (precios unitarios, cantidades, subtotales y total pagado).
  - Sincronización en tiempo real con las actualizaciones realizadas desde el panel administrativo de ventas.
- **Panel Administrativo:**
  - Métricas y analíticas en Dashboard.
  - Gestión de productos, clientes, usuarios y publicidad.
  - Módulo de ventas con visualización y cambio de estados de pedidos en vivo.

## 🛠️ Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JosueBocanegra/fashion-app-store
   cd fashion-app-store
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar la base de datos (JSON Server en puerto 3001):**
   ```bash
   npm run server
   ```

4. **Iniciar la aplicación (Vite en puerto 5173):**
   ```bash
   npm run dev
   ```

   *O ejecutar ambos a la vez:*
   ```bash
   npm run dev:full
   ```

## 🧪 Pruebas Unitarias

Para ejecutar la suite de pruebas automatizadas:

```bash
npm run test:run
```
