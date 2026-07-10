import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleProtectedRoute } from "./auth/RoleProtectedRoute";

import { LoginPage } from "./pages/login/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";

import { KartotekiPage } from "./pages/kartoteki/KartotekiPage";
import { KartotekiHome } from "./pages/kartoteki/KartotekiHome";

import { ProductsPage } from "./pages/products/ProductsPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { PrintersPage } from "./pages/printers/PrintersPage";
import { LabelTemplatesPage } from "./pages/label-templates/LabelTemplatesPage";
import { ConfigurationPage } from "./pages/configuration/ConfigurationPage";

import { OperationsPage } from "./pages/operations/OperationsPage";
import { PrintEanPage } from "./pages/operations/print-ean/PrintEanPage";

import { PrintJobsPage } from "./pages/operations/print-jobs/PrintJobsPage";
import { PrintJobDetailsPage } from "./pages/operations/printJobsDetails/printJobsDetailsPage";

import { ProductionOrdersPage } from "./pages/operations/production-orders/ProductionOrdersPage";
import { ProductionOrderLotsPage } from "./pages/operations/production-order-lots/ProductionOrderLotsPage";

import { WarehouseReceiptsPage } from "./pages/operations/stock-movements/WarehouseReceiptsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "users",
        element: (
          <RoleProtectedRoute allowedRoles={["SuperAdmin"]}>
            <UsersPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "kartoteki",
        element: <KartotekiPage />,
        children: [
          {
            index: true,
            element: <KartotekiHome />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
          },
        ],
      },
      {
        path: "configuration",
        element: <ConfigurationPage />,
        children: [
          {
            index: true,
            element: <Navigate to="printers" replace />,
          },
          {
            path: "printers",
            element: <PrintersPage />,
          },
          {
            path: "label-templates",
            element: (
              <RoleProtectedRoute
                allowedRoles={["SuperAdmin", "Admin", "Manager"]}
              >
                <LabelTemplatesPage />
              </RoleProtectedRoute>
            ),
          },
        ],
      },
      {
        path: "operations",
        element: <OperationsPage />,
        children: [
          {
            index: true,
            element: <Navigate to="print-ean" replace />,
          },
          {
            path: "print-ean",
            element: <PrintEanPage />,
          },
          {
            path: "print-jobs",
            element: <PrintJobsPage />,
          },
          {
            path: "warehouse-receipts",
            element: <WarehouseReceiptsPage />,
          },
          {
            path: "print-jobs/:printJobId",
            element: <PrintJobDetailsPage />,
          },
          {
            path: "production-orders",
            element: <ProductionOrdersPage />,
          },
          {
            path: "production-orders/:productionOrderId/lots",
            element: <ProductionOrderLotsPage />,
          },
        ],
      },
    ],
  },
]);
