import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../interfaces/products';
import { createTransaction } from '../services/transactions';
import { CreateTransactionRequest } from '../interfaces/transactions';

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
  installments: 1,
};

interface CheckoutState {
  isCheckoutOpen: boolean;
  product: Product | null;
  paymentStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  step: number;
  formData: typeof initialFormData;
  errors: Record<string, string>;
  cardType: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
  acceptance: { terms: boolean; provider: boolean };
  wompiTokens: { privacyPolicyToken: string; personalDataAuthToken: string } | null;
}

const initialState: CheckoutState = {
  isCheckoutOpen: false,
  product: null,
  paymentStatus: 'idle',
  step: 1,
  formData: initialFormData,
  errors: {},
  cardType: 'UNKNOWN',
  acceptance: { terms: false, provider: false },
  wompiTokens: null,
};

export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const { formData, product, wompiTokens } = state.checkout;

      console.log('--- Datos actuales del checkout ---');
      console.log('formData:', formData);
      console.log('product:', product);
      console.log('wompiTokens:', wompiTokens);

      if (!product) throw new Error('Producto no seleccionado.');

      // Dividimos expiryDate (MM/AA)
      const [expMonth, expYearShort] = formData.expiryDate.split('/');

      const payload: CreateTransactionRequest = {
        quantityPurchased: formData.quantity,
        state: 'Pending',
        productId: product.id,
        customer: {
          email: formData.email,
          fullname: formData.customerName,
        },
        deliveryDetails: {
          city: formData.city,
          address: formData.address,
          postal_code: Number(formData.postalCode),
        },
        cardDetails: {
          number: formData.cardNumber.replace(/\s/g, ''),
          cvc: formData.cvc,
          exp_month: expMonth,
          exp_year: expYearShort,
          card_holder: formData.cardName,
          quotes: formData.installments,
        },
        acceptance_token: wompiTokens?.privacyPolicyToken || '',
        accept_personal_data: wompiTokens?.personalDataAuthToken || '',
      };

      console.log('--- Payload que se enviará ---');
      console.log(payload);

      // Llamada al backend
      const response = await createTransaction(payload);

      console.log('--- Respuesta del backend ---');
      console.log(response);
      if (!response.success) {
        throw new Error(response.message || 'Error al procesar la transacción');
      }
      return response;
    } catch (err: any) {
      console.error('Error en processPayment:', err);
      return rejectWithValue(err.message || 'Error al procesar la transacción');
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    openCheckout: (state, action: PayloadAction<Product>) => {
      state.isCheckoutOpen = true;
      state.product = action.payload;
      // Resetear estado al abrir modal
      state.step = initialState.step;
      state.formData = { ...initialFormData };
      state.errors = {};
      state.paymentStatus = 'idle';
      state.cardType = 'UNKNOWN';
      state.acceptance = { terms: false, provider: false };
      state.wompiTokens = null;
    },

    closeCheckout: (state) => {
      state.isCheckoutOpen = false;
    },

    nextStep: (state) => {
      if (state.step < 5) state.step += 1;
    },
    prevStep: (state) => {
      if (state.step > 1) state.step -= 1;
    },

    updateField: (state, action: PayloadAction<{ field: keyof typeof initialFormData; value: any }>) => {
      const { field, value } = action.payload;

      if (field === 'installments') {
        state.formData.installments = Number(value);
      } else {
        (state.formData as any)[field] = value;
      }

      if (field === 'cardNumber') {
        const rawValue = String(value).replace(/\s/g, '');
        if (/^4/.test(rawValue)) state.cardType = 'VISA';
        else if (/^5[1-5]/.test(rawValue)) state.cardType = 'MASTERCARD';
        else state.cardType = 'UNKNOWN';
      }
    },

    setErrors: (state, action: PayloadAction<any>) => {
      state.errors = action.payload;
    },

    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },

    setAcceptance: (state, action: PayloadAction<{ field: 'terms' | 'provider'; value: boolean }>) => {
      state.acceptance[action.payload.field] = action.payload.value;
    },

    setWompiTokens: (state, action: PayloadAction<{ privacyPolicyToken: string; personalDataAuthToken: string }>) => {
      state.wompiTokens = action.payload;
    },
    clearWompiTokens: (state) => {
      state.wompiTokens = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.paymentStatus = 'loading';
        state.errors = {}; // Limpia errores anteriores
      })
      .addCase(processPayment.fulfilled, (state) => {
        state.paymentStatus = 'succeeded';
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.paymentStatus = 'failed';
        state.errors.general =
          (action.payload as string) || action.error.message || 'Error desconocido al procesar la transacción';
      });
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
  setAcceptance,
  setWompiTokens,
  clearWompiTokens,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
