import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleProtectedRoute } from "./auth/RoleProtectedRoute";
import { LoginPage } from "./pages/login/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { PrintersPage } from "./pages/printers/PrintersPage";
import { LabelTemplatesPage } from "./pages/label-templates/LabelTemplatesPage";

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
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "printers",
        element: <PrintersPage />,
      },
      {
        path: "label-templates",
        element: <LabelTemplatesPage />,
      },
    ],
  },
]);
