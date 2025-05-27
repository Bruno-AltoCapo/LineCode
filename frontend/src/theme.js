import { extendTheme } from '@chakra-ui/react';

const chakraTheme = extendTheme({
  colors: {
    primary: {
      500: '#1976d2',
    },
    secondary: {
      500: '#dc004e',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
      },
    }),
  },
});

export default chakraTheme;