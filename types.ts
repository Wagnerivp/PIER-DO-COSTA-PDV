export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAITER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // Simplified login
  commissionBalance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  image?: string;
  description?: string;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_PENDING';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  currentOrderId?: string;
  waiterId?: string;
  customName?: string; // Replaced seats with optional custom name (Client name)
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  items: OrderItem[];
  subtotal: number; // Sum of items
  serviceFee: number; // 10%
  discount: number;
  total: number; // Final to pay
  paymentMethod?: 'CASH' | 'CARD_CREDIT' | 'CARD_DEBIT' | 'PIX' | 'MIXED';
  openedAt: Date;
  closedAt?: Date;
}

export interface CommissionLog {
  id: string;
  waiterId: string;
  orderId: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'PAID';
}