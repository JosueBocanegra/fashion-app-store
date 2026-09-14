const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Sobre Nosotros</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Historia</h2>
            <p className="text-gray-600 leading-relaxed">
              Fashion Store nació en 2024 con la misión de ofrecer ropa de calidad a precios accesibles. 
              Desde entonces, nos hemos convertido en la tienda de moda favorita de miles de clientes 
              en todo el país.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Misión</h2>
            <p className="text-gray-600 leading-relaxed">
              Proporcionar a nuestros clientes las mejores prendas de vestir, combinando calidad, 
              estilo y precios competitivos, para que siempre luzcan y se sientan bien.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nuestra Visión</h2>
            <p className="text-gray-600 leading-relaxed">
              Ser la tienda de moda líder en el mercado peruano, reconocida por nuestra calidad, 
              innovación y excelente servicio al cliente.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Valores</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-center">
                <span className="text-purple-600 mr-2">✓</span>
                <span className="text-gray-600">Calidad en cada prenda</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-600 mr-2">✓</span>
                <span className="text-gray-600">Innovación constante</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-600 mr-2">✓</span>
                <span className="text-gray-600">Compromiso con el cliente</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-600 mr-2">✓</span>
                <span className="text-gray-600">Responsabilidad social</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;


