import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./pages/Main/Main";
import "./setup/i18next";
import Auth from "./pages/Auth/Auth";
import Register from "./pages/Register/Register";
import Regards from "./pages/Regards/Regards";
import { useContext, useEffect } from "react";
import { Context } from "./main";
import { observer } from "mobx-react";
import CarAcceptance from "./pages/CarAcceptance/CarAcceptance";


function App() {
  const { authStore } = useContext(Context);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh");
    if (refreshToken) {
      authStore.refresh(refreshToken);
    } else {
      authStore.refresh("test")
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={authStore.isAuth ? <CarAcceptance /> : <Main />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/regards" element={<Regards />} />
      </Routes>
    </Router>
  );
}

export default observer(App);
