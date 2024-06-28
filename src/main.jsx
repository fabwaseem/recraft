import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auto, Explore, Home, Settings } from "./pages";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/auto",
        element: <Auto />,
      },
      {
        path: "/hunt",
        element: <Explore />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
