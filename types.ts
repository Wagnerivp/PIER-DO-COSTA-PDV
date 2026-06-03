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
  lastStockUpdate?: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
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

export interface DeletedItemLog {
  productId: string;
  productName: string;
  quantity: number;
  deletedAt: Date;
  deletedByUserId: string;
  deletedByUserName: string;
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  items: OrderItem[];
  deletedItems?: DeletedItemLog[];
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
  orderId?: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'PAID';
  type?: 'COMMISSION' | 'ADVANCE';
  description?: string;
}

export type PurchaseSupplier = 'COZINHA' | 'AMBEV' | 'HEINEKEN' | 'DEPOSITO' | 'OUTROS';

export interface Purchase {
  id: string;
  description: string;
  amount: number;
  supplier: PurchaseSupplier;
  date: Date;
  paymentDate: Date;
  status: 'PENDING' | 'PAID';
}

export type ExpenseCategory = 'MAINTENANCE' | 'CLEANING' | 'SALARY' | 'SUPPLIES' | 'OTHER';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
}