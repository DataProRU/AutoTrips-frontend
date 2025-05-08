import { observer } from "mobx-react";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import "./Documents.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import userStore from "../../store/UserStore";
import { useTranslation } from "react-i18next";

const Documents = () => {
  const { t } = useTranslation();
  authStore.page = t("documents.ui.pageTitle");

  useEffect(() => {
    userStore.fetchUsers();
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
      <div className="documents">
        <h2 className="documents__title">{t("documents.ui.usersListTitle")}</h2>

        <div className="documents__scroll-container">
          <div className="documents__users">
            {userStore.users.map((user) => (
              <Link key={user.id} to={`/docs/${user.id}`} className="link">
                {user.full_name}
              </Link>
            ))}
          </div>
        </div>

        <div className="documents__footer">
          <Link to="/" className="link">
            {t("common.ui.back")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default observer(Documents);
