import axios from 'axios';
import {createAsyncThunk} from '@reduxjs/toolkit';
import { Product } from '../interfaces/products';

export const fetchProducts = createAsyncThunk<Product[]>( // Specify the fulfilled value type
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching products from backend API...");
      const response = await axios.get<Product[]>('https://backend-2cko.onrender.com/products'); // Make the GET request
      return response.data.filter(product => product.quantity > 0); // Filter out products with quantity 0
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch products');
    }
  }
);