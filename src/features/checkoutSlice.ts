import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from './productSlice'; // Asegúrate de que esta ruta sea correcta

// --- Definimos la forma y el valor inicial del formulario ---
const initialFormData = {
    quantity: 1,
    customerName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
};

// --- Definimos la estructura completa del estado de este slice ---
interface CheckoutState {
  isCheckoutOpen: boolean;
  product: Product | null;
  paymentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  step: number;
  formData: typeof initialFormData;
  errors: any;
  cardType: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
}

// --- Estado inicial completo ---
const initialState: CheckoutState = {
  isCheckoutOpen: false,
  product: null,
  paymentStatus: 'idle',
  step: 1,
  formData: initialFormData,
  errors: {},
  cardType: 'UNKNOWN',
};

// --- Acción asíncrona para simular el pago ---
export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async () => {
    const promise = new Promise<{ success: boolean }>(resolve => {
      setTimeout(() => resolve({ success: true }), 2000); // Simula 2 segundos de carga
    });
    return promise;
  }
);

// --- Creación del Slice con toda la lógica de estado ---
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    // Acción para abrir el modal. Resetea todo a su estado inicial para una sesión limpia.
    openCheckout: (state, action: PayloadAction<Product>) => {
      state.isCheckoutOpen = true;
      state.product = action.payload;
      state.step = initialState.step;
      state.formData = initialState.formData;
      state.errors = initialState.errors;
      state.paymentStatus = initialState.paymentStatus;
      state.cardType = initialState.cardType;
    },
    // Acción para cerrar el modal
    closeCheckout: (state) => {
      state.isCheckoutOpen = false;
    },
    // Acciones para la navegación entre pasos
    nextStep: (state) => {
      if (state.step < 4) state.step += 1;
    },
    prevStep: (state) => {
      if (state.step > 1) state.step -= 1;
    },
    // Acción genérica para actualizar cualquier campo del formulario
    updateField: (state, action: PayloadAction<{ field: keyof typeof initialFormData; value: any }>) => {
      const { field, value } = action.payload;
      // 'as any' es un truco para satisfacer a TypeScript en este reducer genérico
      (state.formData as any)[field] = value;

      // La lógica para detectar el tipo de tarjeta vive aquí, junto al estado que modifica
      if (field === 'cardNumber') {
        const rawValue = String(value).replace(/\s/g, '');
        if (/^4/.test(rawValue)) state.cardType = 'VISA';
        else if (/^5[1-5]/.test(rawValue)) state.cardType = 'MASTERCARD';
        else state.cardType = 'UNKNOWN';
      }
    },
    // Acción para guardar los errores de validación en el estado
    setErrors: (state, action: PayloadAction<any>) => {
      state.errors = action.payload;
    },
    // Acción para limpiar un error específico (útil al corregir un campo)
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    }
  },
  // Maneja los estados de la acción asíncrona `processPayment`
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => { state.paymentStatus = 'loading'; })
      .addCase(processPayment.fulfilled, (state) => { state.paymentStatus = 'succeeded'; })
      .addCase(processPayment.rejected, (state) => { state.paymentStatus = 'failed'; });
  },
});

export const {
  openCheckout,
  closeCheckout,
  nextStep,
  prevStep,
  updateField,
  setErrors,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;