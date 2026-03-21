import { useState } from "react";
import Login from "./Login";
import Home from "./Home";
import './App.css'

function App() {
  const [user, setUser] = useState(
    localStorage.getItem("user")
  );

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Home />;
}

export default App;