// Importaciones básicas de React y Chakra UI
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App';
import chakraTheme from './theme';

// Creación del root de la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizado de la aplicación
root.render(
  <React.StrictMode>
    {/* Configuración del modo de color */}
    <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
    
    {/* Proveedor de Chakra UI con el tema personalizado */}
    <ChakraProvider theme={chakraTheme} resetCSS>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);