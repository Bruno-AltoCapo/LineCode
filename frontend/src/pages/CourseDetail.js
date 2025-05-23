import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  VStack,
  Flex
} from '@chakra-ui/react';
import Announcements from '../components/Announcements';
import Tasks from '../components/Tasks';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { BsFillHouseDoorFill } from "react-icons/bs";
import { BsFillHexagonFill } from "react-icons/bs";
import { BsEnvelopeAtFill, BsExclamationCircleFill, BsFillPersonVcardFill, BsAsterisk } from "react-icons/bs";

function CourseDetail() {
  // Obtener el courseId de los parámetros de la URL
  const { courseId } = useParams();
  
  // Estados para manejar los datos del curso, carga y errores
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar los datos del curso cuando cambia el courseId
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
        {error}
      </Alert>
    );
  }

  // Mostrar mensaje si no se encuentra el curso
  if (!course) {
    return (
      <Text fontSize="xl" textAlign="center" mt={8}>
        Course not found
      </Text>
    );
  }

  // Renderizado principal del componente
  return (
    <Box p={4} bgGradient="radial(gray.700, blackAlpha.800)" minH="100vh">
      <Box m={12}>
        {/* Breadcrumb para navegación */}
        <Flex align="center" mb={6} ml={-5}>
          <BsFillHouseDoorFill />
          <Breadcrumb mb={0} ml={3}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Asignaturas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{course.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Flex>

        {/* Encabezado del curso */}
        <Flex align="center" mb={5}>
          <BsFillHexagonFill size={50} />
          <Box ml={3} flex={1}>
            <Heading as="h1" size="xl" mb={0}>
              {course.name}
            </Heading>
            <Text fontSize="md" mb={0}>
              {course.section} - {course.room}
            </Text>
          </Box>
          
          {/* Información del profesor */}
          <Box p={3}
            borderWidth="1px"
            borderRadius="md"
            _hover={{ bg: 'gray.900', cursor: 'pointer' }}
            bg="gray.700"
            border="1px solid"
            borderColor="gray.400">
            <VStack align="start" spacing={1}>
              <Flex align="center">
                <BsExclamationCircleFill />
                <Text fontSize="lg" fontWeight={'bold'} ml={2}>Profesor</Text>
              </Flex>
              <Flex align="center">
              <BsFillPersonVcardFill />
                <Text fontSize="md" ml={2}>
                  {course.teachers?.[0]?.profile?.name?.fullName || 'Profesor no disponible'}
                </Text>
              </Flex>
            </VStack>
          </Box>
        </Flex>

        {/* Descripción del curso */}
        <Text mb={10}>{course.description}</Text>

        {/* Grid para los componentes de anuncios y tareas */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem>
            <Announcements courseId={courseId} />
          </GridItem>
          <GridItem>
            <Tasks courseId={courseId} />
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
}

export default CourseDetail;