//UserProvider.jsx

import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {

  const initialUser = {
    isLoggedIn: false,
    name: '',
    email: ''
  };

  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(() => {
    const savedSession = localStorage.getItem("session");
    return savedSession ? JSON.parse(savedSession) : initialUser;
  });

  const login = async (email, password) => {
    //TODO: Implement your login mechanism here.
    try {
      const result = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: "include"
      });
      console.log(result)
      if (result.status != 200) {
        console.log("Login Exception: ", error);
        return false;
      }
      else {
        console.log("result: ", result);
        const body = await result.json();
        console.log("Body:", body)
        const newUser = { isLoggedIn: true, name: '', email: email, role: body.data.role || "user", id:body.data._id };
        setUser(newUser);
        localStorage.setItem("session", JSON.stringify(newUser));
      }
    }
    catch (error) {
      console.log("Login Exception: ", error);
      return false;
    }
  }

  const logout = async () => {
    const result = await fetch(`${API_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include"
    });
    const newUser = { isLoggedIn: false, name: '', email: '' };
    setUser(newUser);
    localStorage.setItem("session", JSON.stringify(newUser));
    return true
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}