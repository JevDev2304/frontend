import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo de dato para un producto
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

// Define cómo se verá el estado de este slice
interface ProductState {
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// Estado inicial del slice
const initialState: ProductState = {
  products: [],
  status: 'idle',
};

//  मॉक: Tus datos de productos como si vinieran de una API
const mockProducts: Product[] = [
    { id: 1, name: "iPhone 15 Pro", description: "El último iPhone con chip A17 Pro.", price: 4000000, quantity: 1, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop" },
    { id: 2, name: "MacBook Air M2", description: "Portátil ultraligero con chip M2.", price: 3800000, quantity: 1, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" },
    { id: 3, name: "AirPods Pro", description: "Auriculares con cancelación activa de ruido.", price: 900000, quantity: 3, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop" },
    { id: 4, name: "iPad Air", description: "Tablet versátil con chip M1.", price: 2200000, quantity:7, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop" }
];

// Acción asíncrona para simular la obtención de productos
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  console.log("Fetching products from mock API...");
  // 🚀 SIMULACIÓN DE API
  // Creamos una promesa que se resuelve después de 1 segundo con los datos mock.
  const promise = new Promise<Product[]>((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 1000); // Simula 1 segundo de espera de red
  });

  // Cuando tengas la API real, solo reemplazarás la promesa de arriba por algo como:
  // const response = await axios.get('https://tu-api.com/products');
  // return response.data;

  return promise;
});

// Creación del slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded'; 
        state.products = action.payload; 
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = 'failed'; 
      });
  },
});

export default productSlice.reducer;