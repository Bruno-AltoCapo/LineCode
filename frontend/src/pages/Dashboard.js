import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Heading, Grid, Card, CardBody, Text, Spinner,
  Alert, AlertIcon, AlertTitle, AlertDescription, VStack, Flex
} from '@chakra-ui/react';
import { BsChatLeftDotsFill } from "react-icons/bs";
import { BsClockFill } from "react-icons/bs";
import { BsEasel2Fill } from "react-icons/bs";  // icono para tarea próxima
import { BsFillMegaphoneFill } from "react-icons/bs";
import { Button } from '@chakra-ui/react';

function Dashboard() {
  // Estados para manejar los datos de cursos, anuncios, tareas, carga y errores
  const [courses, setCourses] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState({});
  const [nextTasks, setNextTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar los datos cuando el componente se monta
  useEffect(() => {
    const fetchCoursesAndData = async () => {
      try {
        // Obtener la lista de cursos
        const response = await fetch('/api/courses');
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned unexpected response');
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data);

        // Obtener el último anuncio de cada curso
        const announcementPromises = data.map(async (course) => {
          try {
            const res = await fetch(`/api/courses/${course.id}/announcements`);
            if (!res.ok) throw new Error();
            const announcementsData = await res.json();
            const first = announcementsData.announcements?.[0]?.text || null;
            return [course.id, first];
          } catch {
            return [course.id, null];
          }
        });

        const resolvedAnnouncements = await Promise.all(announcementPromises);
        const announcementMap = Object.fromEntries(resolvedAnnouncements);
        setLatestAnnouncements(announcementMap);

        // Obtener la próxima tarea de cada curso
        const tasksPromises = data.map(async (course) => {
          try {
            const res = await fetch(`/api/courses/${course.id}/courseWork`);
            if (!res.ok) throw new Error();
            const tasksData = await res.json();
            const courseWork = tasksData.courseWork || [];

            // Filtrar tareas con fecha de entrega futura o hoy
            const now = new Date();
            const validTasks = courseWork.filter(task => {
              if (!task.dueDate) return false;
              const dueDate = new Date(task.dueDate.year, task.dueDate.month - 1, task.dueDate.day);
              return dueDate >= now;
            });

            if (validTasks.length === 0) return [course.id, null];

            // Encontrar tarea con fecha más próxima
            const nextTask = validTasks.reduce((prev, curr) => {
              const prevDate = new Date(prev.dueDate.year, prev.dueDate.month - 1, prev.dueDate.day);
              const currDate = new Date(curr.dueDate.year, curr.dueDate.month - 1, curr.dueDate.day);
              return currDate < prevDate ? curr : prev;
            });

            return [course.id, nextTask];
          } catch {
            return [course.id, null];
          }
        });

        const resolvedTasks = await Promise.all(tasksPromises);
        const tasksMap = Object.fromEntries(resolvedTasks);
        setNextTasks(tasksMap);

      } catch (error) {
        setError(error.message || 'Failed to fetch courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndData();
  }, []);

  // Función para formatear fechas
  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day) {
      return 'Sin fecha';
    }
    const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
    return date.toLocaleDateString();
  };

  // Mostrar spinner mientras se cargan los datos
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

  // Mostrar error si ocurre algún problema
  if (error) {
    return (
      <Alert status="error" m={4}>
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Renderizado principal del componente
  return (
    <Box p={4} bgGradient="radial(gray.700, blackAlpha.800)" minH="100vh">
      <Box m={12}>
        {/* Encabezado y botón de cerrar sesión */}
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" mb={8}>
            <BsEasel2Fill size={50}/>
            <Heading as="h1" size="xl" ml={4} >Asignaturas</Heading>
          </Flex>
          <Button variant={'outline'} colorScheme={'red'} onClick={() => window.location.href = 'http://localhost:5000/logout'}>
            Cerrar sesión
          </Button>
        </Flex>

        {/* Grid de cursos */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {courses.length > 0 ? (
            courses.map(course => (
              <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none' }}>
                <Card _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}>
                  <CardBody>
                    {/* Nombre del curso */}
                    <Heading as="h2" size="lg" mb={4}>{course.name}</Heading>

                    {/* Información del profesor */}
                    <Box display="flex" alignItems="center" mt={2}>
                      {course.teacherPhoto && (
                        <img
                          src={course.teacherPhoto.startsWith('//') ? 'https:' + course.teacherPhoto : course.teacherPhoto}
                          alt={`Foto de ${course.teacher}`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            marginRight: '8px',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <Text fontSize="s">Profesor: {course.teacher}</Text>
                    </Box>

                    {/* Último anuncio */}
                    {latestAnnouncements[course.id] && (
                      <Box
                        mt={4}
                        p={3}
                        bg="gray.600"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.400"
                      >
                        <Flex align="start">
                          <Box mt={0.5}>
                            <BsFillMegaphoneFill size={24} />
                          </Box>
                          <Box ml={3}>
                            <Text fontSize="sm" color="gray.100" noOfLines={3}>
                              {latestAnnouncements[course.id].length > 200
                                ? `${latestAnnouncements[course.id].slice(0, 200)}...`
                                : latestAnnouncements[course.id]}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    )}

                    {/* Próxima tarea */}
                    {nextTasks[course.id] && (
                      <Box
                        mt={4}
                        p={3}
                        bg="gray.600"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.400"
                      >
                        <Flex align="center">
                          <BsClockFill size={20} />
                          <Box ml={3}>
                            <Text fontWeight="bold" fontSize="sm" color="gray.100" noOfLines={1}>
                              Tarea próxima: {nextTasks[course.id].title || 'Sin título'}
                            </Text>
                            <Text fontSize="xs" color="gray.300">
                              Fecha entrega: {formatDate(nextTasks[course.id].dueDate)}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    )}

                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            <Text fontSize="lg" m={4}>
              You are not enrolled in any courses
            </Text>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
