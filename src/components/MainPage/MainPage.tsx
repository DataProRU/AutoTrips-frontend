import React from "react";
import { useTranslation } from "react-i18next";
import "./MainPage.css";
import { Link } from "react-router-dom";

const MainPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="main">
        <div className="container">
          <div className="main__content">
            <h2 className="main__header">{t("main.welcome")}</h2>
            <div className="main__links">
              <Link to="/auth" className="main__link">
                {t("main.login")}
              </Link>
              <Link to="#" className="main__forget">
                {t("main.forgot_password")}
              </Link>
              <a href="/register" className="main__link">
                {t("main.register")}
              </a>
            </div>
            <a href="#" className="main__contact">
              {t("main.contact_manager")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
