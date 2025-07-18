import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import { openCheckout } from '../features/checkoutSlice';
import { useState } from 'react';
import { Product } from '../features/productSlice';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch: AppDispatch = useDispatch();
    const handleStartCheckout = () => {
    dispatch(openCheckout(product));
  };
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transform: isHovered ? 'translateY(-4px)' : 'translateY(0)' }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            <span className="text-gray-600 text-md font-bold">{product.quantity} available</span>
          </div>
        </div>

        <button
        onClick={handleStartCheckout}
          className="w-full mt-auto bg-[#b0f2ae] text-black py-2 px-4 rounded-md hover:bg-[#a0e09e] transition-colors duration-200 font-medium"
        >
          Pay with Credit Card
        </button>
      </div>
    </div>
  );
};

export default ProductCard;