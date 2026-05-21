import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import GiftFinder from "../pages/GiftFinder";
import GiftResults from "../pages/GiftResults";
import ProductDetails from "../pages/ProductDetails";
import Wishlist from "../pages/Wishlist";
import Cart from "../pages/Cart";
import Chat from "../pages/Chat";
import Orders from "../pages/Orders";

import Login from "../pages/authPages/Login";
import RegisterBuyer from "../pages/authPages/RegisterBuyer";
import RegisterSeller from "../pages/authPages/RegisterSeller";

import SellerLayout from "../layouts/SellerLayout";
import SellerDashboard from "../pages/seller/SellerDashboard";
import SellerProducts from "../pages/seller/SellerProducts";
import SellerOrders from "../pages/seller/SellerOrders";
import SellerProfile from "../pages/seller/SellerProfile";
import AddProduct from "../pages/seller/AddProduct";
import SellerQuestions from "../pages/seller/SellerQuestions";
import SellerCoupons from "../pages/seller/SellerCoupons";
import ChangePassword from "../pages/authPages/ChangePassword";
import BuyerProfile from "../pages/buyer/BuyerProfile";
import About from "../pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "explore", element: <Explore /> },
      { path: "gift-finder", element: <GiftFinder /> },
      { path: "gift-results", element: <GiftResults /> },
      { path: "product/:slug", element: <ProductDetails /> },
      { path: "wishlist", element: <Wishlist /> },
      { path: "cart", element: <Cart /> },
      { path: "chat", element: <Chat /> },
      { path: "messages", element: <Chat /> },
      { path: "orders", element: <Orders /> },
      { path: "change-password", element: <ChangePassword /> },
      { path: "profile", element: <BuyerProfile/> },
      { path: "about", element: <About /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register-buyer", element: <RegisterBuyer /> },
  { path: "/register-seller", element: <RegisterSeller /> },
  {
    path: "/seller",
    element: <SellerLayout />,
    children: [
      { path: "profile", element: <SellerProfile /> },
      { path: "dashboard", element: <SellerDashboard /> },
      { path: "products", element: <SellerProducts /> },
      { path: "orders", element: <SellerOrders /> },
      { path: "messages", element: <Chat /> },
      { path: "add-product", element: <AddProduct /> },
      { path: "edit-product/:id", element: <AddProduct /> },
      { path: "questions", element: <SellerQuestions /> },
      { path: "coupons", element: <SellerCoupons /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },
]);