export interface CreateTransactionRequest {
  quantityPurchased: number;
  state: 'Pending' | 'Approved' | 'Denied' | string;
  productId: number;
  customer: {
    email: string;
    fullname: string;
  };
  deliveryDetails: {
    city: string;
    address: string;
    postal_code: number;
  };
  cardDetails: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
    quotes: number;
  };
  acceptance_token: string;
  accept_personal_data: string;
}


export interface CreateTransactionResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    state: string;
    price: number;
    email: string;
    wompiId: string;
    status: string;
  };
}