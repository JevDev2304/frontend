export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

// Define cómo se verá el estado de este slice
export interface ProductState {
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}