import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import LoadingScreen from "./components/LoadingScreen";
import LoginPage from "./components/LoginPage";
import AuthCallback from "./components/AuthCallback";
import ClientDashboard from "./components/ClientDashboard";
import AdminDashboard from "./components/AdminDashboard";

const router = createBrowserRouter([
  { path: "/", element: <LoadingScreen /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/dashboard", element: <ClientDashboard /> },
  { path: "/admin", element: <AdminDashboard /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
