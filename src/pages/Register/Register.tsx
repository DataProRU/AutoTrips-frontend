import { useState } from "react";
import Header from "../../components/Header/Header";
import RecieverRegister from "../../components/RecieverRegister/RecieverRegister";
import Button from "../../ui/Button/Button";
import "./Register.css";
import ClientRegister from "../../components/ClientRegister/ClientRegister";
import { useTranslation } from "react-i18next";
import authStore from "../../store/AuthStore";

const Register = () => {
  const { t } = useTranslation();
  authStore.page = t("register.page.pageTitle");
  const [registerType, setRegisterType] = useState<string | null>(null);

  const handleRecieverClick = () => {
    setRegisterType("reciever");
  };

  const handleClientClick = () => {
    setRegisterType("client");
  };

  return (
    <>
      <Header />
      {registerType === "reciever" ? (
        <RecieverRegister />
      ) : registerType === "client" ? (
        <ClientRegister />
      ) : (
        <div className="register">
          <h2 className="register__heading">{t("register.page.heading")}</h2>
          <Button
            type="button"
            text={t("register.page.recieverBtn")}
            className="link register__link"
            onClick={() => handleRecieverClick()}
          />
          <Button
            type="button"
            text={t("register.page.clientBtn")}
            className="link register__link"
            onClick={() => handleClientClick()}
          />
        </div>
      )}
    </>
  );
};

export default Register;
