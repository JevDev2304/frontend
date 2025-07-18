import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

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


export const fetchProducts = createAsyncThunk<Product[]>( // Specify the fulfilled value type
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching products from backend API...");
      const response = await axios.get<Product[]>('http://localhost:3000/products'); // Make the GET request
      return response.data;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch products');
    }
  }
);


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