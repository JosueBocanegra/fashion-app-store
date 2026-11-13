import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CarritoProvider } from './context/CarritoContext.jsx'
import { AuthClienteProvider } from './context/AuthClienteContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CarritoProvider>
      <AuthClienteProvider>
        <App />
      </AuthClienteProvider>
    </CarritoProvider>
  </React.StrictMode>,
)
