import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product,ProductState} from '../interfaces/products';
import { fetchProducts } from '../services/products';



// Estado inicial del slice
const initialState: ProductState = {
  products: [],
  status: 'idle',
};





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