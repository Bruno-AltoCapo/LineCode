# LineCode - Gestión de Cursos y Tareas

LineCode es una plataforma de gestión de cursos y tareas integrada con Google Classroom, diseñada para proporcionar una alternativa más personalizada y fácil de usar. Este proyecto está desarrollado con un backend en Node.js y Express, y un frontend en React con Chakra UI.

## Requisitos Previos

- Node.js (v16 o superior)
- npm (v8 o superior)
- Cuenta de Google con acceso a Google Classroom
- Credenciales de Google API (OAuth 2.0)

## Configuración del Proyecto

### 1. Clonar el Repositorio

```
git clone https://github.com/tu-usuario/LineCode.git
cd LineCode
```

### 2. Configurar las Variables de Entorno
Crear un archivo ``.env`` en la carpeta ``backend`` con el siguiente contenido:
```
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
SESSION_SECRET=tu-secreto-de-sesion
```

Obtener las credenciales de Google API:
- Ve a Google Cloud Console
- Crea un nuevo proyecto
- Habilita las APIs de Google Classroom y Google Drive
- Crea credenciales OAuth 2.0
- Configura los URIs de redirección:
  - ``http://localhost:5000/auth/google/callback``
  - ``http://localhost:3000``

### 3. Instalar Dependencias
```
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 4. Ejecutar el Proyecto
1. Iniciar el servidor backend:
```
cd ../backend
npm start
 ```

2. En otra terminal, iniciar el frontend:
```
cd ../frontend
npm start
 ```

### 5. Acceder a la Aplicación
Abre tu navegador y visita:

```
http://localhost:3000
 ```

## Estructura del Proyecto
```
LineCode/
├── backend/          # Código del servidor Node.js
├── frontend/         # Aplicación React
├── .gitignore        # Archivos ignorados por Git
└── README.md         # Este archivo
```
