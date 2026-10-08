export type CityOption = 'Dewas' | 'Hatpipliya' | 'Bagli' | 'Indore';
export type StateOption = 'Madhya Pradesh';
export type PaymentMethod = 'cod' | 'online' | 'card';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentVerificationStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'Not Applicable';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
}

export interface PaymentSettings {
  upiId: string;
  upiQrImage: string;
  isOnlinePaymentEnabled: boolean;
  web3formsKey?: string;
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // 1 to 5 images supported
  thumbnailTag?: string; // Links to custom thumbnail
  isAvailable: boolean;
  createdAt: string;
}

export interface CustomThumbnail {
  id: string;
  title: string;
  image: string;
  order: number;
  tag: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
  order: number;
  tag?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  secondMobile?: string;
  pinCode: string;
  city: CityOption;
  state: StateOption;
  houseNo: string;
  roadArea: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  baseAmount: number;
  adjustmentAmount: number; // +50 for COD, -50 for Online, 0 for Card
  finalAmount: number;
  upiTransactionId?: string;
  paymentVerificationStatus: PaymentVerificationStatus;
  status: OrderStatus;
  createdAt: string;
  emailSent: boolean;
  emailError?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
