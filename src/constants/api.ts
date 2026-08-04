import { Platform } from 'react-native';

/**
 * URL base del API. En dispositivo físico, define EXPO_PUBLIC_API_URL
 * con la IP de tu máquina (ej. http://192.168.1.10:3000).
 */
const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL = ("https://regenesis-back.vercel.app").replace(
  /\/$/,
  '',
);
