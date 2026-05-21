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
            <Toaster
              position="top-center"
              gutter={10}
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#ffffff",
                  color: "#1E1B1B",
                  borderRadius: "999px",
                  padding: "12px 22px",
                  boxShadow: "0 8px 32px rgba(217,4,82,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #EFE4DF",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: "700",
                  fontSize: "14px",
                  maxWidth: "360px",
                },
                success: { iconTheme: { primary: "#D90452", secondary: "#fff" } },
                error:   { iconTheme: { primary: "#D90452", secondary: "#fff" } },
              }}
            />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
   
);