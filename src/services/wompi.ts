
import axios from 'axios';

// Accedemos a la llave pública, esto no cambia.
const WOMPI_PUBLIC_KEY: string | undefined = import.meta.env.VITE_WOMPI_PUBLIC_KEY;


export const fetchWompiPermalinks = async (): Promise<{
  privacyPolicy: string;
  privacyPolicyToken: string;
  personalDataAuth: string;
  personalDataAuthToken: string;
} | null> => {
  if (!WOMPI_PUBLIC_KEY) {
    console.error("Error: VITE_WOMPI_PUBLIC_KEY not defined. Check your .env file.");
    return null;
  }

  // UPDATED: La URL ahora apunta a tu proxy local.
  // Empieza con '/api', el prefijo que definiste en vite.config.js.
  const WOMPI_API_URL = `/api/v1/merchants/${WOMPI_PUBLIC_KEY}`;

  try {
    // Esta llamada ahora va a 'http://localhost:5173/api/...'
    // y Vite la redirige a Wompi por ti.
    const response = await axios.get(WOMPI_API_URL);
    const { data } = response.data;
    console.log("Wompi acceptance data fetched successfully:", data);

    return {
      privacyPolicy: data.presigned_acceptance.permalink,
      privacyPolicyToken: data.presigned_acceptance.acceptance_token,
      personalDataAuth: data.presigned_personal_data_auth.permalink,
      personalDataAuthToken: data.presigned_personal_data_auth.acceptance_token,
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios Error fetching Wompi acceptance data:", err.message, err.response?.data);
    } else {
      console.error("Unknown Error fetching Wompi acceptance data:", err);
    }
    return null;
  }
};