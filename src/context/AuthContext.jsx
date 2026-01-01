import { createContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { analytics } from "../utils/analytics";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("usschats_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("usschats_token") || "");

  useEffect(() => {
    if (user) {
      analytics.setUser(user._id, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt
      });
    }
  }, [user]);

  const signin = async ({ email, phone, identifier, password, ...rest }) => {
    // Support both old format (email/phone) and new format (identifier)
    const loginPayload = identifier 
      ? { identifier, password, ...rest }
      : email 
        ? { email, password, ...rest }
        : { phone, password, ...rest };
    
    const { data } = await apiLogin(loginPayload);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("usschats_user", JSON.stringify(data.user));
    localStorage.setItem("usschats_token", data.token);
  };

  const signup = async ({ name, email, phone, password, securityQuestions }) => {
    const { data } = await apiRegister({ name, email, phone, password, securityQuestions });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("usschats_user", JSON.stringify(data.user));
    localStorage.setItem("usschats_token", data.token);
  };

  const signout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("usschats_user");
    localStorage.removeItem("usschats_token");
  };

  const value = useMemo(() => ({ user, token, signin, signup, signout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
