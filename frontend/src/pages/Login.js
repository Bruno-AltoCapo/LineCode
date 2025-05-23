// Importaciones básicas de React y Material-UI
import React from 'react';
import { Button, Container, Typography } from '@mui/material';

// Componente principal de Login
function Login() {
  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '5rem', textAlign: 'center' }}>
      {/* Título de la aplicación */}
      <Typography variant="h4" gutterBottom>
        LineCode
      </Typography>
      
      {/* Botón de inicio de sesión con Google */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleLogin}
        style={{ marginTop: '2rem' }}
      >
        Iniciar Sesión con Google
      </Button>
    </Container>
  );
}

export default Login;