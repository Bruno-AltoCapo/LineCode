// Importaciones de React y componentes de UI
import React, { useEffect, useState } from 'react';
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
import { BsChatLeftDotsFill } from "react-icons/bs";

// Componente principal de anuncios
function Announcements({ courseId }) {
  // Estados para manejar los datos y el estado de carga
  const [announcements, setAnnouncements] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el nombre de usuario
  const fetchUserName = async (userId) => {
    try {
      const response = await fetch(`/api/userProfiles/${userId}`);
      const data = await response.json();
      return data.name || 'Unknown User';
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Unknown User';
    }
  };

  // Efecto para cargar los anuncios cuando cambia el courseId
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/announcements`);
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        const data = await response.json();
        const announcementsArray = data.announcements || [];
        setAnnouncements(announcementsArray.slice(0, 3));

        // Obtener nombres de los creadores de los anuncios
        const names = {};
        for (const announcement of announcementsArray) {
          if (!names[announcement.creatorUserId]) {
            names[announcement.creatorUserId] = await fetchUserName(announcement.creatorUserId);
          }
        }
        setUserNames(names);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseId]);

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
      <Flex align="center" mb={6}>
        <BsChatLeftDotsFill size={30} />
        <Heading as="h2" size="lg" mb={2} ml={3}>
          Tablón de anuncios
        </Heading>
      </Flex>
      {announcements.length > 0 ? (
        <List spacing={3}>
          {announcements.map((announcement) => (
            <ListItem key={announcement.id} p={3} borderWidth="1px" borderRadius="md" bg="gray.700"
            border="1px solid"
            borderColor="gray.400">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{announcement.text || 'No title'}</Text>
                <Text fontSize="sm" color="gray.400">
                  {userNames[announcement.creatorUserId] || 'Loading...'}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {new Date(announcement.creationTime).toLocaleDateString()}
                </Text>
              </VStack>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text>No hay anuncios disponibles</Text>
      )}
    </Box>
  );
}

export default Announcements;