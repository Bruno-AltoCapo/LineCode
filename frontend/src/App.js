// Importaciones básicas de React y React Router
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importación de componentes de las páginas
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import TaskDetail from './pages/TaskDetail';
import Loginv2 from './pages/Loginv2';

// Componente principal de la aplicación
function App() {
  return (
    // Configuración del enrutador
    <Router>
      <Routes>
        {/* Rutas principales de la aplicación */}
        <Route path="/" element={<Loginv2 />} />
        <Route path="/login" element={<Loginv2 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/courses/:courseId/tasks/:taskId" element={<TaskDetail />} />
      </Routes>
    </Router>
  );
}

export default App;