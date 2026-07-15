import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Incomes from "./pages/Incomes";
import Invoices from "./pages/Invoices";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import Expenses from "./pages/Expenses/index.jsx";
import CompanySettings from "./pages/CompanySettings";
import Placeholder from "./pages/Placeholder";
import Kpo from "./pages/Kpo/index.jsx";

const ALL_ROLES = ["admin", "operator", "accountant"];
const FINANCE_ROLES = ["admin", "accountant"];
const ADMIN_ROLES = ["admin"];

function ProtectedPage({ title, allowedRoles, children }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={allowedRoles}>
        <MainLayout title={title}>
          {children}
        </MainLayout>
      </RoleRoute>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedPage
            title="Dashboard"
            allowedRoles={ALL_ROLES}
          >
            <Dashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedPage
            title="Kupci"
            allowedRoles={ALL_ROLES}
          >
            <Customers />
          </ProtectedPage>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedPage
            title="Dobavljači"
            allowedRoles={ALL_ROLES}
          >
            <Suppliers />
          </ProtectedPage>
        }
      />

      <Route
        path="/incomes"
        element={
          <ProtectedPage
            title="Prihodi"
            allowedRoles={ALL_ROLES}
          >
            <Incomes />
          </ProtectedPage>
        }
/>
<Route
  path="/kpo"
  element={
    <ProtectedPage
      title="KPO – Knjiga prihoda"
      allowedRoles={FINANCE_ROLES}
    >
      <Kpo />
    </ProtectedPage>
  }

      />

      <Route
        path="/invoices"
        element={
          <ProtectedPage
            title="Fakture"
            allowedRoles={ALL_ROLES}
          >
            <Invoices />
          </ProtectedPage>
        }
      />

      <Route
        path="/purchase-invoices"
        element={
          <ProtectedPage
            title="Ulazne fakture"
            allowedRoles={ALL_ROLES}
          >
            <PurchaseInvoices />
          </ProtectedPage>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedPage
            title="Rashodi"
            allowedRoles={FINANCE_ROLES}
          >
            <Expenses />
          </ProtectedPage>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedPage
            title="Izveštaji"
            allowedRoles={FINANCE_ROLES}
          >
            <Placeholder title="Izveštaji" />
          </ProtectedPage>
        }
      />

      <Route
        path="/company-settings"
        element={
          <ProtectedPage
            title="Podešavanja firme"
            allowedRoles={ADMIN_ROLES}
          >
            <CompanySettings />
          </ProtectedPage>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedPage
            title="Podešavanja"
            allowedRoles={ADMIN_ROLES}
          >
            <Placeholder title="Podešavanja" />
          </ProtectedPage>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;