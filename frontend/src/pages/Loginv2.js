// Importaciones de React y componentes de UI
import React from 'react';
import { Box, Button, Heading, Flex, VStack, Text } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc'; // Icono de Google
import SplitText from '../components/SplitText.js';
import { BsCodeSlash } from "react-icons/bs";

// Componente Loginv2 con diseño mejorado
function Loginv2() {
  return (
    // Contenedor principal con gradiente de fondo
    <Flex minH="100vh" align="center" justify="center" bgGradient="radial(gray.700, blackAlpha.800)"
    color="white">
      <Flex
        w="80%"
        maxW="1200px"
        justify="space-between"
        align="center"
        gap={8}
      >
        {/* Sección izquierda con logo y texto animado */}
        <VStack align="start" spacing={8} flex={1}>
          <Flex align="center" gap={4}>
            <BsCodeSlash size="70px" />
            <Heading as="h1" size="4xl">
              LineCode
            </Heading>
          </Flex>
          <Box>
            <SplitText />
          </Box>
        </VStack>

        {/* Sección derecha con botón de inicio de sesión */}
        <Box flex={1} textAlign="center">
          <Text fontSize="lg" mb={4}>
            Integrado con su habitual cuenta de Google.
          </Text>
          <Button
            leftIcon={<FcGoogle size={"28px"} />}
            variant="outline"
            colorScheme="blue"
            size="lg"
            onClick={() => {
              window.location.href = 'http://localhost:5000/auth/google';
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Loginv2;
