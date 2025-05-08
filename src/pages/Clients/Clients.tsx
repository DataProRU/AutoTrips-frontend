import { useTranslation } from "react-i18next";
import authStore from "../../store/AuthStore";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import userStore from "../../store/UserStore";
import "./Clients.css";
import { observer } from "mobx-react";
import Loader from "../../ui/Loader/Loader";

const Clients = () => {
  const { t } = useTranslation();
  authStore.page = "Клиенты";

  useEffect(() => {
    userStore.fetchСlients();
  }, []);

  if (authStore.role !== "admin") {
    return (
      <>
        <Header />
        <div className="documents">
          <p className="error-text">{t("documents.ui.noAccess")}</p>
          <Link to="/" className="link">
            {t("documents.ui.toMain")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="clients">
        <h2 className="clients__title">Список клиентов</h2>

        <div className="clients__scroll-container">
          {userStore.isLoading ? (
            <div className="clients__loader">
              <Loader />
            </div>
          ) : (
            <div className="clients__users">
              {userStore.users.map((user) => (
                <Link key={user.id} to={`/clients/${user.id}`} className="link">
                  {user.full_name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="clients__footer">
          <Link to="/" className="link">
            {t("common.ui.back")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default observer(Clients);
