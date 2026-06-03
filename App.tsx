import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './services/AppContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Tables } from './pages/Tables';
import { FastSale } from './pages/FastSale';
import { CashRegister } from './pages/CashRegister';
import { WaiterPanel } from './pages/WaiterPanel';
import { Products } from './pages/Products';
import { Finance } from './pages/Finance';
import { Team } from './pages/Team';
import { Customers } from './pages/Customers';

import { Purchases } from './pages/Purchases';

const AppRoutes = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/fast-sale" element={<FastSale />} />
        <Route path="/cash-register" element={<CashRegister />} />
        <Route path="/products" element={<Products />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/team" element={<Team />} />
        <Route path="/commissions" element={<WaiterPanel />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;