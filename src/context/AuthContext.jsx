import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);

  const saveAuth = (data, userRole) => {
    // Backend token field adı: token və ya accessToken
    const token = data.token || data.accessToken;
    const refreshToken = data.refreshToken;

    if (token) {
      localStorage.setItem("token", token);
    }

    localStorage.setItem("role", userRole);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // user obyektini tap: data.user, data.buyer, data.seller, ya da data özü
    const userObj = data.user || data.buyer || data.seller || data;
    setUser(userObj);
    setRole(userRole);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const buyerLogin = async (form) => {
    const res = await authService.buyerLogin(form);
    saveAuth(res.data, "buyer");
    return res.data;
  };

  const sellerLogin = async (form) => {
    const res = await authService.sellerLogin(form);
    saveAuth(res.data, "seller");
    return res.data;
  };

 const buyerRegister = async (form) => {
  const res = await authService.buyerRegister(form);
  saveAuth(res.data, "buyer");
  return res.data;
};

 const sellerRegister = async (form) => {
  const res = await authService.sellerRegister(form);
  saveAuth(res.data, "seller");
  return res.data;
};

  const getMe = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
      }
      // Network/timeout errors: keep existing cached user and role
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await authService.logout();
      }
    } catch {
      // logout request failure is non-critical
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
        isBuyer: role === "buyer",
        isSeller: role === "seller",
        buyerLogin,
        sellerLogin,
        buyerRegister,
        sellerRegister,
        getMe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
