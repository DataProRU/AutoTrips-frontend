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
import Comparisons from "./pages/Comparisons/Comparisons";
import Guide from "./pages/Guide/Guide";

function App() {
  const { authStore } = useContext(Context);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh");

    const refreshAuth = async () => {
      if (refreshToken) {
        try {
          await authStore.refresh(refreshToken);
        } catch (e) {
          console.error("Ошибка обновления токена:", e);
        }
      } else {
        console.log("Пользователь не был авторизован");
      }
    };

    refreshAuth();
  }, []);

  function getHomeComponent() {
    if (!authStore.isAuth) return <Main />;

    if (authStore.role === "user") {
      if (!authStore.approved) return <Regards />;
      if (!authStore.onboarded) return <Guide />;
      return <CarAcceptance />;
    }

    if (authStore.role === "admin") return <Comparisons />;

    return <Main />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={getHomeComponent()} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/camparisons" element={<Comparisons />} />
      </Routes>
    </Router>
  );
}

export default observer(App);
