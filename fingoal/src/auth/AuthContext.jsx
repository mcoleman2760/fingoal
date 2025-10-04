import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // restore on refresh
  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
    if (username && token) setUser({ username, token });
  }, []);

  function signIn({ username, token = "fake-token" }) {
    localStorage.setItem("username", username);
    localStorage.setItem("authToken", token);
    setUser({ username, token });
  }

  function signOut() {
    localStorage.removeItem("username");
    localStorage.removeItem("authToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
