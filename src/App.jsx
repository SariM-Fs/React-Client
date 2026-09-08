import { useState } from "react";
import { LoginScreen } from "./screens/LoginScreen.jsx";
import { Shell } from "./screens/Shell.jsx";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("ev_token"));
  const [name, setName] = useState(localStorage.getItem("ev_name"));
  const [role, setRole] = useState(localStorage.getItem("ev_role"));

  if (!token) {
    return <LoginScreen onLoggedIn={(t, n, r) => { setToken(t); setName(n); setRole(r); }} />;
  }
  return (
    <Shell
      token={token}
      name={name}
      role={role}
      onLogout={() => {
        localStorage.removeItem("ev_token");
        localStorage.removeItem("ev_name");
        localStorage.removeItem("ev_role");
        setToken(null);
      }}
    />
  );
}