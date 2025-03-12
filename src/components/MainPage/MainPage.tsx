import React from "react";
import { useTranslation } from "react-i18next";
import "./MainPage.css";
import authStore from "../../store/AuthStore";
import { Link } from "react-router-dom";
import Button from "../../ui/Button/Button";

const MainPage: React.FC = () => {
  const { t } = useTranslation();

  authStore.page = "";

  return (
    <>
      <div className="main">
        <div className="container">
          <div className="main__content">
            <h2 className="main__header">{t("main.welcome")}</h2>
            <div className="main__links">
              <Button
                to="/register"
                text={t("main.register")}
                className="link"
              />

              <Button
                to="/auth"
                text={t("main.login")}
                className="link"
              />

              <Link to="#" className="main__forget">
                {t("main.forgot_password")}
              </Link>
            </div>
            
            <Button
              type="button"
              text={t("main.contact_manager")}
              className="link main__contact"
              onClick={() => {

                console.log("Связаться с менеджером");
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
