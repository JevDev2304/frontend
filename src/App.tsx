import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './app/store';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CheckoutModal from './components/CheckoutModal'; // 👈 PASO 1: Importa el modal
import { fetchProducts } from './services/products';

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { products, status } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Available Products
          </h2>
        </div>

        {status === 'loading' && <p className="text-center text-lg">Loading Products...</p>}
        
        {status === 'succeeded' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <CheckoutModal />
    </div>
  );
}

export default App;