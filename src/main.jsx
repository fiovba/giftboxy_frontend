import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(

      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
            <Toaster position="top-right" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
   
);