// Importaciones de React y componentes de UI
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  VStack,
  HStack,
  Flex
} from '@chakra-ui/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { BsFillHouseDoorFill, BsFileEarmarkArrowUpFill } from "react-icons/bs";

// Componente para mostrar detalles de una tarea
function TaskDetail() {
  // Estados y hooks
  const { courseId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Efecto para cargar los datos de la tarea y curso
  useEffect(() => {
    const fetchTaskAndCourse = async () => {
      try {
        const taskRes = await fetch(`/api/courses/${courseId}/courseWork/${taskId}`);
        if (!taskRes.ok) throw new Error('Failed to fetch task');
        const taskData = await taskRes.json();
        setTask(taskData);

        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndCourse();
  }, [courseId, taskId]);

  // Funciones para formatear fechas y horas
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day) {
      return 'No due date';
    }
    const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
    return date.toLocaleDateString();
  };

  const formatTime = (timeObj, dateObj) => {
    if (!timeObj || !dateObj) return 'No time';
    const utcDate = new Date(Date.UTC(
      dateObj.year,
      dateObj.month - 1,
      dateObj.day,
      timeObj.hours,
      timeObj.minutes
    ));
    return utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Manejo de selección y subida de archivos
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Primero selecciona un archivo para subir');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('courseId', courseId);
    formData.append('taskId', taskId);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Archvio subido exitosamente');
        setSelectedFile(null);
      } else {
        throw new Error('Error a la hora de subir el archivo, intenta de nuevo');
      }
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      alert('Error subiendo el archivo');
    }
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <Box bgGradient="radial(gray.700, blackAlpha.800)" display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text fontSize="xl">Cargando...</Text>
        </VStack>
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

  // Mostrar mensaje si no se encuentra la tarea o curso
  if (!task || !course) {
    return (
      <Text fontSize="xl" textAlign="center" mt={8}>
        Task or Course not found
      </Text>
    );
  }

  // Renderizado principal del componente
  return (
    <Box p={4} bgGradient="radial(gray.700, blackAlpha.800)" minH="100vh">
      <Box m={12} ml={100} mr={100}>
      <Flex align="center" mb={6}>
            <BsFillHouseDoorFill />
            <Breadcrumb mb={0} ml={3}>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Asignaturas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/courses/${courseId}`}>{course.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>{task.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </Flex>

        <VStack align="start" spacing={3}>
          <Heading as="h1" size="xl">{task.title}</Heading>
          <Text fontWeight="medium" mb={4}>
            Fecha de entrega: {formatDate(task.dueDate)} a las {formatTime(task.dueTime, task.dueDate)}
          </Text>
          <Text mb={2}>{task.description}</Text>
          

          <Box mt={4} w="50%" p={3}
            bg="gray.600"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.400">
              <Flex align="center" mb={4}>
              <BsFileEarmarkArrowUpFill size={20} />
            <Heading as="h2" size="md" ml={2}>Entrega aquí tus archivos</Heading>
            </Flex>
            <HStack spacing={3}>
              <Input
                type="file"
                onChange={handleFileChange}
                id="file-upload"
                display="none"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" as="span" colorScheme="blue">
                  Seleccionar archivo
                </Button>
              </label>

              {selectedFile && (
                <Text>{selectedFile.name}</Text>
              )}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default TaskDetail;
