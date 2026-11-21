
const AdminPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    totalPages
  );

  const firstPage = Math.max(
    1,
    Math.min(safeCurrentPage - 2, totalPages - 4)
  );

  const lastPage = Math.min(totalPages, firstPage + 4);

  const pages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );

  return (
    <nav
      className="admin-pagination"
      aria-label="Paginación de registros"
    >
      <div className="admin-pagination__size">
        <label htmlFor="admin-pagination-size">
          Mostrar
        </label>

        <select
          id="admin-pagination-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="admin-pagination__select"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span>por página</span>
      </div>

      <div className="admin-pagination__navigation">
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="admin-pagination__button"
          aria-label="Página anterior"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 18-6-6 6-6"
            />
          </svg>

          <span>Anterior</span>
        </button>

        {firstPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="admin-pagination__page"
            >
              1
            </button>

            {firstPage > 2 && (
              <span className="admin-pagination__ellipsis">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={safeCurrentPage === page ? "page" : undefined}
            className={`admin-pagination__page ${
              safeCurrentPage === page ? "is-active" : ""
            }`}
          >
            {page}
          </button>
        ))}

        {lastPage < totalPages && (
          <>
            {lastPage < totalPages - 1 && (
              <span className="admin-pagination__ellipsis">...</span>
            )}

            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="admin-pagination__page"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          className="admin-pagination__button"
          aria-label="Página siguiente"
        >
          <span>Siguiente</span>

          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </button>
      </div>

      <p className="admin-pagination__info">
        Página {safeCurrentPage} de {totalPages}
      </p>
    </nav>
  );
};

export default AdminPagination;


