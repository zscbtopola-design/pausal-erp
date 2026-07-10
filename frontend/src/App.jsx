import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Incomes from "./pages/Incomes";
import Invoices from "./pages/Invoices";
import CompanySettings from "./pages/CompanySettings";
import Placeholder from "./pages/Placeholder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout title="Dashboard">
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/customers"
        element={
          <MainLayout title="Kupci">
            <Customers />
          </MainLayout>
        }
      />

      <Route
        path="/suppliers"
        element={
          <MainLayout title="Dobavljači">
            <Suppliers />
          </MainLayout>
        }
      />

      <Route
        path="/incomes"
        element={
          <MainLayout title="Prihodi">
            <Incomes />
          </MainLayout>
        }
      />

      <Route
        path="/invoices"
        element={
          <MainLayout title="Fakture">
            <Invoices />
          </MainLayout>
        }
      />

      <Route
        path="/expenses"
        element={
          <MainLayout title="Rashodi">
            <Placeholder title="Rashodi" />
          </MainLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <MainLayout title="Izveštaji">
            <Placeholder title="Izveštaji" />
          </MainLayout>
        }
      />

      <Route
        path="/company-settings"
        element={
          <MainLayout title="Podešavanja firme">
            <CompanySettings />
          </MainLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <MainLayout title="Podešavanja">
            <Placeholder title="Podešavanja" />
          </MainLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

    