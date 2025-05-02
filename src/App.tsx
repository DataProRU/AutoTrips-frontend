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
import Guide from "./pages/Guide/Guide";
import AdminPage from "./pages/AdminPage/AdminPage";
import Documents from "./pages/Documents/Documents";
import CarPhotos from "./pages/CarPhotos/CarPhotos";
import KeyPhotos from "./pages/KeyPhotos/KeyPhotos";
import DocsPhotos from "./pages/DocsPhotos/DocsPhotos";
import UserDocs from "./pages/UserDocs/UserDocs";
import ClientPage from "./pages/ClientPage/ClientPage";

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

    if (authStore.role === "admin") return <AdminPage />;

    if (authStore.role === "client") return <ClientPage/>;

    return <Main />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={getHomeComponent()} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/reports/:reportId/car-photos" element={<CarPhotos />} />
        <Route path="/reports/:reportId/key-photos" element={<KeyPhotos />} />
        <Route path="/reports/:reportId/doc-photos" element={<DocsPhotos />} />
        <Route path="/docs/:userId" element={<UserDocs />} />
      </Routes>
    </Router>
  );
}

export default observer(App);
