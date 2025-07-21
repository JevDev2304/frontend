# Frontend para Prueba Técnica - Wompi

Este repositorio contiene el código fuente del frontend para la prueba técnica de Wompi. La aplicación está desarrollada con React y Vite, y consume la API del backend para mostrar productos y procesar pagos.

## 📜 Tabla de Contenidos

* [Características Principales](#-características-principales)
* [Tecnologías Utilizadas](#-tecnologías-utilizadas)
* [Requisitos Previos](#-requisitos-previos)
* [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
* [Scripts Disponibles](#-scripts-disponibles)
* [Notas Adicionales](#-notas-adicionales)
* [Despliegue](#-despliegue)
* [Autor](#️-autor)

## ✨ Características Principales

* **Visualización de Productos:** Muestra una galería de productos obtenidos desde el backend, con su nombre, precio e imagen.
* **Formulario de Pago Dinámico:** Un formulario completo que permite al usuario ingresar sus datos personales, de entrega y de tarjeta de crédito.
* **Flujo de Transacción:** Guía al usuario a través del proceso de pago, mostrando estados de carga y respuestas de la transacción (aprobada o denegada).
* **Diseño Responsivo:** Interfaz adaptable para una correcta visualización en dispositivos móviles y de escritorio.

## 💻 Tecnologías Utilizadas

* **Librería:** React
* **Herramienta de Build:** Vite
* **Lenguaje:** TypeScript
* **Manejo de Estado:** Redux Toolkit
* **Peticiones HTTP:** Axios
* **Estilos:** Tailwind CSS

## 📋 Requisitos Previos

* Node.js (v20.x o superior)
* NPM o Yarn

## 🚀 Instalación y Puesta en Marcha (Local)

Sigue estos pasos para levantar el proyecto en tu entorno local.

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/JevDev2304/frontend.git](https://github.com/JevDev2304/frontend.git)
    cd frontend
    ```

2.  **Configura las variables de entorno:**
    Copia el archivo `.env.example` y renómbralo a `.env.local`. Luego, rellena la variable apuntando a la URL de tu backend (ya sea local o el desplegado en Render).
    ```bash
    cp .env.example .env.local
    ```
    Tu archivo `.env.local` debería lucir así:
    ```env
    # URL del Backend (Apunta a tu backend local o a Render)
    VITE_API_URL=http://localhost:3000

    # Llave pública de Wompi (si la usas en el frontend)
    VITE_WOMPI_PUBLIC_KEY=pub_stagtest_...
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Ejecuta la aplicación:**
    Este comando iniciará el servidor de desarrollo.
    ```bash
    npm run dev
    ```
    La aplicación estará corriendo en `http://localhost:5173` (o el puerto que indique Vite).

## ⚙️ Scripts Disponibles

En el archivo `package.json` encontrarás los siguientes scripts:

* **`npm run dev`**: Inicia el servidor de desarrollo.
* **`npm run build`**: Compila la aplicación para producción.
* **`npm run preview`**: Sirve la versión de producción localmente para previsualización.

## 📝 Notas Adicionales

* No se implementaron pruebas automatizadas para el frontend debido a limitaciones de tiempo significativas, incluyendo compromisos laborales de tiempo completo y un viaje internacional. Por este motivo, el enfoque principal se centró en la funcionalidad y la correcta integración con el backend.

## ☁️ Despliegue

El frontend de esta aplicación está desplegado en **Vercel**, aprovechando su integración continua y su red global para un rendimiento óptimo.

* **URL de la Aplicación:** [https://frontend-murex-one-49.vercel.app/](https://frontend-murex-one-49.vercel.app/)

## ✍️ Autor

**Juan Esteban Valdés Ospina**

* **LinkedIn:** [linkedin.com/in/juanesvaldesospina](https://www.linkedin.com/in/juanesvaldesospina/)
* **GitHub:** [github.com/jevdev2304](https://github.com/jevdev2304)
