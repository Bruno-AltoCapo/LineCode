// Importaciones necesarias
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  List,
  ListItem,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Flex
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { BsFillTerminalFill } from "react-icons/bs";

// Componente principal de tareas
function Tasks({ courseId }) {
  // Estados y hooks
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState({});

  // Efecto para cargar tareas y sus envíos
  useEffect(() => {
    const fetchTasksAndSubmissions = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/courseWork`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const taskList = data.courseWork || [];
        setTasks(taskList);

        // Obtener estado de envíos para cada tarea
        const submissionsMap = {};
        await Promise.all(
          taskList.map(async (task) => {
            try {
              const submissionRes = await fetch(`/api/courses/${courseId}/courseWork/${task.id}/submission`);
              if (submissionRes.ok) {
                const submissionData = await submissionRes.json();
                submissionsMap[task.id] = submissionData.postSubmissionState;
              }
            } catch (err) {
              console.error(`Error fetching submission for task ${task.id}:`, err);
            }
          })
        );

        setSubmissions(submissionsMap);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndSubmissions();
  }, [courseId]);

  // Función para formatear fechas
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day) {
      return 'Sin fecha';
    }
    const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
    return date.toLocaleDateString();
  };

  // Manejar clic en una tarea
  const handleTaskClick = (taskId) => {
    navigate(`/courses/${courseId}/tasks/${taskId}`);
  };

  // Formatear estado de envío
  const formatSubmissionState = (state) => {
    switch (state) {
      case 'NEW': return 'Sin abrir';
      case 'CREATED': return 'Creado';
      case 'TURNED_IN': return 'Entregado';
      case 'RETURNED': return 'Devuelto';
      case 'RECLAIMED_BY_STUDENT': return 'Anulado por el estudiante';
      default: return 'Desconocido';
    }
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Spinner size="lg" />
      </Box>
    );
  }

  // Mostrar error si ocurre
  if (error) {
    return (
      <Alert status="error" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Renderizado principal del componente
  return (
    <Box>
      <Flex align="center" mb={7}>
        <BsFillTerminalFill size={30} />
        <Heading as="h2" size="lg" ml={3} mb={1}>
          Tareas
        </Heading>
      </Flex>
      {tasks.length > 0 ? (
        <List spacing={3}>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ bg: 'gray.900', cursor: 'pointer' }}
              bg="gray.700"
            border="1px solid"
            borderColor="gray.400"
              onClick={() => handleTaskClick(task.id)}
            >
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{task.title || 'Sin título'}</Text>
                <Text fontSize="sm" color="gray.400">
                  Fecha de entrega: {formatDate(task.dueDate)}
                </Text>
              </VStack>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text>No hay tareas</Text>
      )}
    </Box>
  );
}

export default Tasks;
