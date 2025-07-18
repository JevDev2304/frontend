import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  closeCheckout,
  processPayment,
  nextStep,
  prevStep,
  updateField,
  setErrors,
  clearError,
} from '../features/checkoutSlice';

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
        cardType 
    } = useSelector((state: RootState) => state.checkout);
    useEffect(() => {
        if (paymentStatus === 'succeeded') {
            alert('¡Pago realizado con éxito!');
            dispatch(closeCheckout());
        }
    }, [paymentStatus, dispatch]);
    const handleClose = () => dispatch(closeCheckout());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const newErrors: any = {};
        if (step === 2) {
            if (!formData.customerName) newErrors.customerName = 'Nombre es requerido.';
            if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido.';
            if (!formData.address) newErrors.address = 'Dirección es requerida.';
            if (!formData.city) newErrors.city = 'Ciudad es requerida.';
            if (!/^\d{5,6}$/.test(formData.postalCode)) newErrors.postalCode = 'Código postal inválido.';
        }
        if (step === 3) {
            if (!formData.cardName) newErrors.cardName = 'Nombre en tarjeta es requerido.';
            const cardNumberRaw = formData.cardNumber.replace(/\s/g, '');
            if (!isLuhnValid(cardNumberRaw)) newErrors.cardNumber = 'Número de tarjeta inválido.';
            if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) newErrors.expiryDate = 'Fecha inválida (MM/AA).';
            if (!/^\d{3,4}$/.test(formData.cvc)) newErrors.cvc = 'CVC inválido.';
        }
        if (Object.keys(newErrors).length > 0) {
            dispatch(setErrors(newErrors));
        } else {
            dispatch(nextStep());
        }
    };
    
    if (!isCheckoutOpen || !product) return null;

    const steps = ['Select Quantity', 'Delivery Address', 'Payment', 'Summary'];
    const isProcessing = paymentStatus === 'loading';

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
                               {index < steps.length - 1 && <div className={`flex-1 h-1 ${index + 1 < step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                           </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="overflow-hidden">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
                        <div className="w-full flex-shrink-0 p-6 space-y-4">
                            <div className='flex flex-row justify-center'><img src={product.image} alt={product.name} className="w-48 h-32 object-cover mb-4 rounded-md" /></div>
                            
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p>Price Per Unit: <span className="font-bold">${product.price}</span></p>
                            <div>
                            </div>
                            <div>
                                <label>Quantity:</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" max={product.quantity} className="border p-2 rounded w-full mt-1"/>
                            </div>
                            <p className="text-xl font-bold text-right">Total: ${(formData.quantity * product.price)}</p>
                        </div>

                        <div className="w-full flex-shrink-0 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label>Full name:</label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}/>{errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}</div>
                            <div className="md:col-span-2"><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}/>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</div>
                            <div className="md:col-span-2"><label>Address:</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}/>{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}</div>
                            <div><label>City:</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}/>{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}</div>
                            <div><label>Postal Code:</label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}/>{errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}</div>
                        </div>
                        
                        <div className="w-full flex-shrink-0 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="md:col-span-2"><label>Name in Card:</label><input type="text" name="cardName" value={formData.cardName} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}/>{errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}</div>
                             <div className="relative md:col-span-2"><label>Number:</label><input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} maxLength={19} className={`w-full p-2 border rounded mt-1 pr-10 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}/><div className="absolute top-9 right-2">{cardType === 'VISA' ? <VisaIcon/> : cardType === 'MASTERCARD' ? <MasterCardIcon/> : <GenericCardIcon/>}</div>{errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}</div>
                             <div><label>Expiry Date. (MM/AA):</label><input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}/>{errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}</div>
                             <div><label>CVC:</label><input type="text" name="cvc" value={formData.cvc} onChange={handleChange} className={`w-full p-2 border rounded mt-1 ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}/>{errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}</div>
                        </div>

<div className="w-full flex-shrink-0 p-6 space-y-4">
    <div className='flex flex-row justify-center'>
        <img src={product.image} alt={product.name} className="w-48 h-32 object-cover mb-4 rounded-md" />
    </div>

    <h3 className="font-bold text-lg">{product.name}</h3>
    <p>Price: <span className="font-bold">${product.price}</span></p>
    <p>Quantity: <span className="font-bold">{formData.quantity}</span></p>
    <p>Address: <span className="font-bold">{formData.customerName}, {formData.address}, {formData.city}</span></p>
    <p>Last 4 digits: <span className="font-bold">{formData.cardNumber.slice(-4)}</span></p>
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
        <div className="flex justify-between">
            <p>Delivery price:</p>
            <p className="font-semibold">$5.00</p>
        </div>
        <div className="flex justify-between items-baseline">
            <p className="text-xl font-bold">Total:</p>
            <p className="text-2xl font-bold">
                ${((formData.quantity * product.price) + 5).toFixed(2)}
            </p>
        </div>
    </div>
</div>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 border-t mt-auto flex justify-between">
                    <button onClick={() => dispatch(prevStep())} disabled={step === 1 || isProcessing} className="bg-gray-300 text-gray-800 py-2 px-6 rounded disabled:opacity-50">Back</button>
                    {step < 4 && <button onClick={validateAndProceed} className="bg-[#b0f2ae] text-white py-2 px-6 rounded">Next</button>}
                    {step === 4 && (
                        <button onClick={() => dispatch(processPayment())} disabled={isProcessing} className="bg-green-600 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400">
                           {isProcessing ? 'Processing...' : 'Buy now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;