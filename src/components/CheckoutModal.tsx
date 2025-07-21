import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchWompiPermalinks } from '../services/wompi';
import {
  closeCheckout,
  processPayment,
  nextStep,
  prevStep,
  updateField,
  setErrors,
  clearError,
  setAcceptance,
  setWompiTokens,
  clearWompiTokens,
} from '../features/checkoutSlice';
import Swal from 'sweetalert2';

const VisaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1A1F71"><path d="M22.583 6.432a2.016 2.016 0 0 0-1.74-1.12c-2.43-.414-5.462-.63-8.381-.63-4.434 0-7.398.533-9.062 1.597a.784.784 0 0 0-.323.655L1.42 16.32a.782.782 0 0 0 .782.84h2.176a.782.782 0 0 0 .773-.67l.792-3.805c.16-.763.648-1.22 1.48-1.22h3.047c.75 0 1.258.38 1.432 1.135l.84 4.56a.782.782 0 0 0 .772.67h2.24c.78 0 1.05-.533 1.156-1.07l2.8-11.41a.783.783 0 0 0-.153-.743z"/></svg>;
const MasterCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="10" cy="12" r="7" fill="#EA001B"/><circle cx="14" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"/></svg>;
const GenericCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z"/></svg>;

const isLuhnValid = (cardNumber: string): boolean => {
  if (!/^\d+$/.test(cardNumber)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
};

const CheckoutModal: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { 
    isCheckoutOpen, 
    product, 
    paymentStatus, 
    step, 
    formData, 
    errors, 
    cardType,
    acceptance,
    wompiTokens
  } = useSelector((state: RootState) => state.checkout);

  const [permalinks, setPermalinks] = useState<{ privacyPolicy: string; personalDataAuth: string } | null>(null);

  useEffect(() => {
    const getAndStoreTokens = async () => {
      if (isCheckoutOpen) {
        const data = await fetchWompiPermalinks();
        if (data) {
          dispatch(setWompiTokens({
            privacyPolicyToken: data.privacyPolicyToken,
            personalDataAuthToken: data.personalDataAuthToken,
          }));
          setPermalinks({
            privacyPolicy: data.privacyPolicy,
            personalDataAuth: data.personalDataAuth
          });
        }
      } else {
        dispatch(clearWompiTokens());
      }
    };
    getAndStoreTokens();
  }, [isCheckoutOpen, dispatch]);

useEffect(() => {
  if (paymentStatus === 'succeeded') {
    dispatch(closeCheckout());
    Swal.fire({
      title: 'Payment Successful!',
      text: 'Your payment was processed successfully.',
      icon: 'success',
      confirmButtonColor: '#b0f2ae',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'px-4 py-2 rounded bg-[#b0f2ae] hover:bg-green-400'
      }
    }).then(() => window.location.reload());
  } else if (paymentStatus === 'failed') {
    Swal.fire({
      title: 'Payment Error',
      text: errors.general || 'There was a problem processing your payment. Please try again.',
      icon: 'error',
      confirmButtonColor: '#f87171',
      confirmButtonText: 'Understood',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'px-4 py-2 rounded bg-red-400 hover:bg-red-500'
      }
    });
  }
}, [paymentStatus, dispatch, errors.general]);

  const handleClose = () => dispatch(closeCheckout());
  
  const handleAcceptanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    dispatch(setAcceptance({ field: name as 'terms' | 'provider', value: checked }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    if (name === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').slice(0, 5);
    } else if (name === 'cvc') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'quantity') {
      const numValue = parseInt(value, 10);
      processedValue = Math.max(1, Math.min(product?.quantity || 1, isNaN(numValue) ? 1 : numValue));
    }
    dispatch(updateField({ field: name as any, value: processedValue }));
    if (errors[name]) {
      dispatch(clearError(name));
    }
  };

  const validateAndProceed = () => {
    if (step === 1) {
      if (acceptance.terms && acceptance.provider) {
        dispatch(nextStep());
      }
      return;
    }

    const newErrors: any = {};
    if (step === 3) {
      if (!formData.customerName) newErrors.customerName = 'Name is required.';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email.';
      if (!formData.address) newErrors.address = 'Address is required.';
      if (!formData.city) newErrors.city = 'City is required.';
      if (!/^\d{5,6}$/.test(formData.postalCode)) newErrors.postalCode = 'Invalid postal code.';
    }
    if (step === 4) {
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required.';
      const cardNumberRaw = formData.cardNumber.replace(/\s/g, '');
      if (!isLuhnValid(cardNumberRaw)) newErrors.cardNumber = 'Invalid card number.';
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
  newErrors.expiryDate = 'Invalid date (MM/YY).';
} else {
  const [monthStr, yearStr] = formData.expiryDate.split('/');
  const expMonth = parseInt(monthStr, 10);
  const expYear = 2000 + parseInt(yearStr, 10);

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 0-indexed
  const currentYear = today.getFullYear();

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    newErrors.expiryDate = 'Card has expired.';
  }
}
      if (!/^\d{3,4}$/.test(formData.cvc)) newErrors.cvc = 'Invalid CVC.';
    }
    if (Object.keys(newErrors).length > 0) {
      dispatch(setErrors(newErrors));
    } else {
      dispatch(nextStep());
    }
  };

  if (!isCheckoutOpen || !product) return null;

  const steps = ['Terms & Conditions', 'Select Quantity', 'Delivery Address', 'Payment', 'Summary'];
  const isProcessing = paymentStatus === 'loading';
  const canProceedFromTerms = acceptance.terms && acceptance.provider;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b relative">
          <button type="button" onClick={handleClose} className="absolute top-2 right-3 text-3xl text-gray-400 hover:text-gray-700">&times;</button>
          <h2 className="text-xl font-bold text-center mb-2">{steps[step - 1]}</h2>
          <div className="flex items-center">
            {steps.map((s, index) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 <= step ? 'bg-[#b0f2ae] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 ${index + 1 < step ? 'bg-[#b0f2ae]' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
            {/* Step 1 - Terms */}
            <div className="w-full flex-shrink-0 p-6 space-y-6">
              <p className="text-sm text-gray-600 text-center">To proceed with your purchase, please read and accept our terms and our payment provider's policies.</p>
              <div className="flex items-start">
                <input type="checkbox" id="terms" name="terms" checked={acceptance.terms} onChange={handleAcceptanceChange} className="h-4 w-4 mt-1 text-[#b0f2ae] border-gray-300 rounded" disabled={!permalinks}/>
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-900">I accept that I have read the regulations and the <a href={permalinks?.privacyPolicy} target="_blank" rel="noopener noreferrer" className="font-medium text-[#b0f2ae] hover:underline">privacy policy </a> to make this payment.</label>
              </div>
              <div className="flex items-start">
                <input type="checkbox" id="provider" name="provider" checked={acceptance.provider} onChange={handleAcceptanceChange} className="h-4 w-4 mt-1 text-[#b0f2ae] border-gray-300 rounded" disabled={!permalinks}/>
                <label htmlFor="provider" className="ml-3 block text-sm text-gray-900">I accept the <a href={permalinks?.personalDataAuth} target="_blank" rel="noopener noreferrer" className="font-medium text-[#b0f2ae] hover:underline">authorization for the management of personal data</a>.</label>
              </div>
            </div>

            {/* Step 2 - Quantity */}
            <div className="w-full flex-shrink-0 p-6 space-y-4">
              <div className='flex flex-row justify-center'><img src={product.image} alt={product.name} className="w-48 h-32 object-cover mb-4 rounded-md" /></div>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p>Price Per Unit: <span className="font-bold">${product.price}</span></p>
              <div><label>Quantity:</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" max={product.quantity} className="border p-2 rounded w-full mt-1"/></div>
              <p className="text-xl font-bold text-right">Total: ${(formData.quantity * product.price)}</p>
            </div>

            {/* Step 3 - Delivery */}
            <div className="w-full flex-shrink-0 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label>Full name:</label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}/>{errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}</div>
              <div className="md:col-span-2"><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}/>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
              <div className="md:col-span-2"><label>Address:</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}/>{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}</div>
              <div><label>City:</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}/>{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}</div>
              <div><label>Postal Code:</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}/>{errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}</div>
            </div>

            {/* Step 4 - Payment */}
            <div className="w-full flex-shrink-0 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label>Name on card:</label><input type="text" name="cardName" value={formData.cardName} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}/>{errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}</div>
              <div className="md:col-span-2 relative"><label>Card number:</label><input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className={`w-full p-2 border rounded mt-1 pr-10 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}/><span className="absolute right-3 top-8">{cardType === 'VISA' ? <VisaIcon /> : cardType === 'MASTERCARD' ? <MasterCardIcon /> : <GenericCardIcon />}</span>{errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}</div>
              <div><label>Expiry (MM/YY):</label><input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}/>{errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}</div>
              <div><label>CVC:</label><input type="text" name="cvc" value={formData.cvc} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}/>{errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}</div>
              <div className="md:col-span-2"><label>Installments:</label><select name="installments" value={formData.installments} onChange={handleChange} className="w-full p-2 border rounded mt-1">{[...Array(24).keys()].map(i => <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'installment' : 'installments'}</option>)}</select></div>
            </div>

            {/* Step 5 - Summary */}
            <div className="w-full flex-shrink-0 p-6 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <p>Product: {product.name}</p>
            <p>Quantity: {formData.quantity}</p>
            <p>Delivery: <span className="font-bold">$10,000</span></p>
            <p>
                Total: 
                <span className="font-bold">
                ${formData.quantity * product.price + 10000}
                </span>
            </p>
            <p className="text-sm text-gray-600">Cardholder: {formData.cardName} ({cardType})</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between">
  <button 
    type="button" 
    onClick={() => dispatch(prevStep())} 
    disabled={step === 1 || isProcessing} 
    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Back
  </button>

  {step < 5 ? (
    <button 
      type="button" 
      onClick={validateAndProceed} 
      disabled={step === 1 && !canProceedFromTerms} 
      className={`px-4 py-2 rounded ${step === 1 && !canProceedFromTerms ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#b0f2ae] hover:bg-green-400'}`}
    >
      Continue
    </button>
  ) : (
    <button 
      type="button" 
      onClick={() => dispatch(processPayment())} 
      disabled={isProcessing} 
      className="px-4 py-2 rounded bg-[#b0f2ae] hover:bg-green-400 flex items-center justify-center"
    >
      {isProcessing && (
        <span className="loader mr-2"></span> // <-- Spinner
      )}
      {isProcessing ? 'Processing...' : 'Pay'}
    </button>   
  )}
</div>

      </div>
    </div>
  );
};

export default CheckoutModal;
