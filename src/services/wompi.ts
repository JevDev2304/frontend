import axios from 'axios';

// La función ahora es mucho más simple
export const fetchWompiPermalinks = async (): Promise<{
  privacyPolicy: string;
  privacyPolicyToken: string;
  personalDataAuth: string;
  personalDataAuthToken: string;
} | null> => {

  // 1. Obtiene la URL de tu propio backend desde las variables de entorno
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  if (!BACKEND_URL) {
    console.error("Error: VITE_API_URL not defined. Check your .env file.");
    return null;
  }

  // 2. Construye la URL hacia tu nuevo endpoint
  const API_ENDPOINT = `${BACKEND_URL}/wompi/acceptance-details`;

  try {
    // 3. Llama a tu backend
    const response = await axios.get(API_ENDPOINT);
    console.log("Acceptance data fetched successfully from backend:", response.data);
    return response.data; // El backend ya nos da los datos formateados
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios Error fetching acceptance data from backend:", err.message, err.response?.data);
    } else {
      console.error("Unknown Error fetching acceptance data from backend:", err);
    }
    return null;
  }
};