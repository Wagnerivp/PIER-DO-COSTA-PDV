import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, PropsWithChildren } from 'react';
import { User, Product, Table, Order, CommissionLog, OrderItem, Expense, DeletedItemLog, Customer } from '../types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TABLES } from '../constants';
import { supabase } from './supabase';

interface AppContextData {
  currentUser: User | null;
  login: (pin: string) => boolean;
  directLogin: (user: User) => void;
  logout: () => void;
  users: User[];
  products: Product[];
  tables: Table[];
  orders: Order[];
  customers: Customer[];
  commissionLogs: CommissionLog[];
  expenses: Expense[];
  isRegisterOpen: boolean;
  registerBalance: number;
  
  // Actions
  openRegister: (amount: number) => void;
  closeRegister: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  openTable: (tableId: string, waiterId: string, clientName?: string) => void;
  cancelOrder: (tableId: string) => void; // Reset Table
  updateTableName: (tableId: string, newName: string) => void;
  requestCheckout: (tableId: string) => void;
  addToOrder: (tableId: string, product: Product, quantity: number) => void;
  removeFromOrder: (tableId: string, productId: string, removeAll?: boolean) => void;
  closeAccount: (tableId: string, paymentMethod: any, includeServiceFee: boolean) => void;
  payCommission: (logId: string) => void;
  processDirectSale: (items: {product: Product, quantity: number, total: number}[], paymentMethod: string) => void;
  deleteOrder: (orderId: string, pin: string) => boolean;
  addExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;
  
  // User Management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (userId: string) => void;
  
  // Customers
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: string) => void;
}

const AppContext = createContext<AppContextData | undefined>(undefined);

let pendingSyncCount = 0;

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerBalance, setRegisterBalance] = useState(0);
  
  // "Database" States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [commissionLogs, setCommissionLogs] = useState<CommissionLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const lastProcessedStateRef = useRef<string | null>(null);

  // Helper para aplicar state
  const applyState = (parsed: any, isLocal: boolean) => {
      let isExpired = false;
      if (parsed.lastSavedAt) {
           const lastSaved = new Date(parsed.lastSavedAt);
           const now = new Date();
           if ((now.getTime() - lastSaved.getTime()) > 24 * 60 * 60 * 1000) {
               isExpired = true;
           }
      }

      if (parsed.users) {
          setUsers(prev => JSON.stringify(prev) === JSON.stringify(parsed.users) ? prev : parsed.users);
      }
      if (parsed.products) {
          setProducts(prev => JSON.stringify(prev) === JSON.stringify(parsed.products) ? prev : parsed.products);
      }
      if (parsed.tables) {
          setTables(prev => JSON.stringify(prev) === JSON.stringify(parsed.tables) ? prev : parsed.tables);
      }
      if (parsed.customers) {
          setCustomers(prev => JSON.stringify(prev) === JSON.stringify(parsed.customers) ? prev : parsed.customers);
      }
      if (parsed.commissionLogs) {
          const mappedLogs = parsed.commissionLogs.map((l: any) => ({...l, date: new Date(l.date)}));
          setCommissionLogs(prev => JSON.stringify(prev) === JSON.stringify(mappedLogs) ? prev : mappedLogs);
      }
      if (parsed.expenses) {
          const mappedExpenses = parsed.expenses.map((e: any) => ({...e, date: new Date(e.date)}));
          setExpenses(prev => JSON.stringify(prev) === JSON.stringify(mappedExpenses) ? prev : mappedExpenses);
      }
      if (parsed.orders) {
          const mappedOrders = parsed.orders.map((o: any) => ({
              ...o,
              openedAt: new Date(o.openedAt),
              closedAt: o.closedAt ? new Date(o.closedAt) : undefined
          }));
          setOrders(prev => JSON.stringify(prev) === JSON.stringify(mappedOrders) ? prev : mappedOrders);
      }

      // Estado local do device (caixa e user logado) só puxamos se vier do localStorage 
      // ou se ainda não tiver ninguém logado e quisermos sincronizar
      if (isLocal) {
          if (!isExpired) {
              if (parsed.currentUser) setCurrentUser(parsed.currentUser);
              if (parsed.isRegisterOpen !== undefined) setIsRegisterOpen(parsed.isRegisterOpen);
              if (parsed.registerBalance) setRegisterBalance(parsed.registerBalance);
          } else {
              setIsRegisterOpen(false);
              setRegisterBalance(0);
              setCurrentUser(null);
          }
      } else {
          // Syncs vindos do Cloud para Caixa
          if (parsed.isRegisterOpen !== undefined) setIsRegisterOpen(parsed.isRegisterOpen);
          if (parsed.registerBalance) setRegisterBalance(parsed.registerBalance);
      }
      // Track the signature of what we just applied so we don't reflect it back
      if (!isLocal && parsed) {
          const stripped = {
              isRegisterOpen: parsed.isRegisterOpen,
              registerBalance: parsed.registerBalance,
              users: parsed.users,
              products: parsed.products,
              tables: parsed.tables,
              orders: parsed.orders,
              customers: parsed.customers,
              commissionLogs: parsed.commissionLogs,
              expenses: parsed.expenses,
          };
          lastProcessedStateRef.current = JSON.stringify(stripped);
      }
  };

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Cloud / LocalStorage
  useEffect(() => {
    let lastCloudSyncDate = 0;

    const loadState = async () => {
        let parsedCloud: any = null;
        let parsedLocal: any = null;
        
        const savedData = localStorage.getItem('pier_pdv_data');
        if (savedData) {
            try {
                parsedLocal = JSON.parse(savedData);
                applyState(parsedLocal, true);
            } catch(e) { console.error(e) }
        }
        
        try {
            // 1. Try Cloud Sync
            const { data, error } = await supabase.from('app_state').select('data').eq('id', 1).maybeSingle();
            if (data && data.data) {
                parsedCloud = data.data;
                lastCloudSyncDate = new Date(parsedCloud.lastSavedAt || 0).getTime();
                applyState(parsedCloud, false);
            }
        } catch (e) {
            console.error("Failed to load from cloud", e);
        } finally {
            setIsLoaded(true);
        }
    };
    
    loadState();

    // Polling Real-Time Simples para manter devices Sincronizados
    const interval = setInterval(async () => {
        if (pendingSyncCount > 0) return; // Não faz poll se o device tiver edições pendentes
        try {
            const { data, error } = await supabase.from('app_state').select('data').eq('id', 1).maybeSingle();
            if (data && data.data) {
                const cloudTime = new Date(data.data.lastSavedAt || 0).getTime();
                // Apenas aplica se for state novo
                if (cloudTime > lastCloudSyncDate) {
                    lastCloudSyncDate = cloudTime;
                    applyState(data.data, false);
                }
            }
        } catch(e) {}
    }, 5000); // Poll a cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Save to LocalStorage and Supabase (Cloud Sync)
  useEffect(() => {
    if (!isLoaded) return;
    
    const stripped = {
      isRegisterOpen,
      registerBalance,
      users,
      products,
      tables,
      orders,
      customers,
      commissionLogs,
      expenses
    };
    
    const signature = JSON.stringify(stripped);
    if (signature === lastProcessedStateRef.current) {
        // This state change was just synced from the cloud, don't ping-pong it back
        return;
    }
    
    const payload = {
      ...stripped,
      lastSavedAt: new Date().toISOString()
    };
    
    // Update ref so we don't save the exact same state twice locally either
    lastProcessedStateRef.current = signature;
    
    // Local Save (inclui currentUser para manter o login neste device)
    const localPayload = {
       ...payload,
       currentUser
    };
    localStorage.setItem('pier_pdv_data', JSON.stringify(localPayload));
    
    pendingSyncCount++;
    
    // Cloud Sync (Debounced to avoid rate limits)
    const timeout = setTimeout(async () => {
        try {
            await supabase.from('app_state').upsert({ id: 1, data: payload, updated_at: new Date().toISOString() });
        } catch (e) {
            console.error("Cloud sync failed", e);
        } finally {
            pendingSyncCount = Math.max(0, pendingSyncCount - 1);
        }
    }, 2000);

    return () => {
        clearTimeout(timeout);
        pendingSyncCount = Math.max(0, pendingSyncCount - 1);
    };
  }, [currentUser, isRegisterOpen, registerBalance, users, products, tables, orders, commissionLogs, expenses]);


  const login = (pin: string) => {
    const user = users.find(u => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const directLogin = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  const openRegister = (amount: number) => {
      setRegisterBalance(amount);
      setIsRegisterOpen(true);
  };

  const closeRegister = () => {
      setIsRegisterOpen(false);
      setRegisterBalance(0);
  };

  // User Management
  const addUser = (user: User) => {
      setUsers(prev => [...prev, user]);
  };
  
  const updateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const removeUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Customer Management
  const addCustomer = (customer: Customer) => {
      setCustomers(prev => {
          if (prev.find(c => c.phone === customer.phone)) return prev;
          return [...prev, customer];
      });
  };

  const updateCustomer = (updatedCustomer: Customer) => {
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const removeCustomer = (customerId: string) => {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  // Product Management
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const openTable = (tableId: string, waiterId: string, clientName?: string) => {
    if (!isRegisterOpen && currentUser?.role !== 'ADMIN') {
        return;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tableId,
      waiterId,
      status: 'OPEN',
      items: [],
      subtotal: 0,
      serviceFee: 0,
      discount: 0,
      total: 0,
      openedAt: new Date(),
    };

    setOrders(prev => [...prev, newOrder]);
    setTables(prev => prev.map(t => 
      t.id === tableId ? { 
          ...t, 
          status: 'OCCUPIED', 
          currentOrderId: newOrder.id, 
          waiterId,
          customName: clientName || t.customName 
      } : t
    ));
  };

  const cancelOrder = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Set order to cancelled if it exists
    if (table.currentOrderId) {
        setOrders(prev => prev.map(o => o.id === table.currentOrderId ? { ...o, status: 'CANCELLED', closedAt: new Date() } : o));
    }
    
    // Free table completely (Force reset)
    setTables(prev => prev.map(t => t.id === tableId ? { 
        ...t, 
        status: 'AVAILABLE', 
        currentOrderId: undefined, 
        waiterId: undefined, 
        customName: undefined 
    } : t));
  };

  const updateTableName = (tableId: string, newName: string) => {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, customName: newName } : t));
  };

  const requestCheckout = (tableId: string) => {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'PAYMENT_PENDING' } : t));
  };

  const addToOrder = (tableId: string, product: Product, quantity: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrderId) return;

    setOrders(prev => prev.map(order => {
      if (order.id !== table.currentOrderId) return order;

      const existingItem = order.items.find(i => i.productId === product.id);
      let newItems;
      if (existingItem) {
        newItems = order.items.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.price } 
            : i
        );
      } else {
        newItems = [...order.items, {
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          total: product.price * quantity
        }];
      }

      const subtotal = newItems.reduce((acc, item) => acc + item.total, 0);
      const serviceFee = subtotal * 0.10;
      
      return {
        ...order,
        items: newItems,
        subtotal,
        serviceFee,
        total: subtotal + serviceFee - order.discount
      };
    }));
  };

  const removeFromOrder = (tableId: string, productId: string, removeAll: boolean = false) => {
      const table = tables.find(t => t.id === tableId);
      if (!table || !table.currentOrderId) return;

      setOrders(prev => prev.map(order => {
          if (order.id !== table.currentOrderId) return order;

          const existingItem = order.items.find(i => i.productId === productId);
          if (!existingItem) return order;

          let newItems;
          let quantityRemoved = 0;
          if (existingItem.quantity > 1 && !removeAll) {
              // Decrease quantity
              newItems = order.items.map(i => 
                  i.productId === productId 
                  ? { ...i, quantity: i.quantity - 1, total: (i.quantity - 1) * i.price }
                  : i
              );
              quantityRemoved = 1;
          } else {
              // Remove item
              newItems = order.items.filter(i => i.productId !== productId);
              quantityRemoved = existingItem.quantity;
          }

          const deletedLog: DeletedItemLog = {
              productId: existingItem.productId,
              productName: existingItem.productName,
              quantity: quantityRemoved,
              deletedAt: new Date(),
              deletedByUserId: currentUser?.id || 'unknown',
              deletedByUserName: currentUser?.name || 'Sistema'
          };

          const newDeletedItems = [...(order.deletedItems || []), deletedLog];

          const subtotal = newItems.reduce((acc, item) => acc + item.total, 0);
          const serviceFee = subtotal * 0.10;

          return {
              ...order,
              items: newItems,
              deletedItems: newDeletedItems,
              subtotal,
              serviceFee,
              total: subtotal + serviceFee - order.discount
          };
      }));
  };

  const closeAccount = (tableId: string, paymentMethod: any, includeServiceFee: boolean) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrderId) return;

    const currentOrder = orders.find(o => o.id === table.currentOrderId);
    if (!currentOrder) return;

    // Finalize amounts
    const finalServiceFee = includeServiceFee ? currentOrder.subtotal * 0.10 : 0;
    const finalTotal = currentOrder.subtotal + finalServiceFee - currentOrder.discount;

    // Update Order
    setOrders(prev => prev.map(o => 
      o.id === currentOrder.id 
        ? { ...o, status: 'CLOSED', closedAt: new Date(), serviceFee: finalServiceFee, total: finalTotal, paymentMethod } 
        : o
    ));

    // Update Table
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: 'AVAILABLE', currentOrderId: undefined, waiterId: undefined, customName: undefined } : t
    ));

    // Deduct Stock
    setProducts(prevProducts => prevProducts.map(p => {
        const orderItem = currentOrder.items.find(i => i.productId === p.id);
        if (orderItem) {
            return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
    }));

    // Process Commission if fee included
    if (includeServiceFee && finalServiceFee > 0) {
      const commissionLog: CommissionLog = {
        id: `com-${Date.now()}`,
        waiterId: currentOrder.waiterId,
        orderId: currentOrder.id,
        amount: finalServiceFee,
        date: new Date(),
        status: 'PAID'
      };
      setCommissionLogs(prev => [...prev, commissionLog]);
      
      setUsers(prev => prev.map(u => 
        u.id === currentOrder.waiterId 
          ? { ...u, commissionBalance: u.commissionBalance + finalServiceFee } 
          : u
      ));
    }
  };

  const payCommission = (logId: string) => {
    const log = commissionLogs.find(l => l.id === logId);
    if (!log || log.status === 'PAID') return;

    setCommissionLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'PAID' } : l));
  };

  const processDirectSale = (items: {product: Product, quantity: number, total: number}[], paymentMethod: string) => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const orderItems: OrderItem[] = items.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
      total: i.total
    }));

    const newOrder: Order = {
      id: `dir-${Date.now()}`,
      tableId: 'fast-sale', // Special ID or fallback
      waiterId: currentUser?.id || '',
      status: 'CLOSED',
      items: orderItems,
      subtotal,
      serviceFee: 0,
      discount: 0,
      total: subtotal,
      openedAt: new Date(),
      closedAt: new Date(),
      paymentMethod: paymentMethod as any
    };

    setOrders(prev => [...prev, newOrder]);

    // Deduct stock
    setProducts(prevProducts => prevProducts.map(p => {
        const orderItem = orderItems.find(i => i.productId === p.id);
        if (orderItem) {
            return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
    }));
  };

  const deleteOrder = (orderId: string, pin: string) => {
    if (pin === '0508') {
      const order = orders.find(o => o.id === orderId);
      if (order && order.status === 'CLOSED') {
        // Revert stock
        setProducts(prevProducts => prevProducts.map(p => {
            const orderItem = order.items.find(i => i.productId === p.id);
            if (orderItem) {
                return { ...p, stock: p.stock + orderItem.quantity };
            }
            return p;
        }));
      }
      setOrders(prev => prev.filter(o => o.id !== orderId));
      return true;
    }
    return false;
  };

  // Expense Management
  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };
  
  const removeExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, directLogin, logout, users, products, tables, orders, customers, commissionLogs, expenses, isRegisterOpen, registerBalance,
      openRegister, closeRegister, addProduct, updateProduct, removeProduct, openTable, cancelOrder, updateTableName, requestCheckout, addToOrder, removeFromOrder, closeAccount, payCommission, processDirectSale, deleteOrder,
      addUser, updateUser, removeUser, addExpense, removeExpense, addCustomer, updateCustomer, removeCustomer
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
