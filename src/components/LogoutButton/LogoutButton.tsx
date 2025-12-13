import React from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authStore from "../../store/AuthStore";
import "./LogoutButton.css";
import Button from "../../ui/Button/Button";

const LogoutButton: React.FC = observer(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await authStore.logout();
    navigate("/");
  };

  if (!authStore.isAuth) {
    return null;
  }

  return (
    <Button
      text={t("common.ui.logout")}
      className="logout-button"
      onClick={handleLogout}
    />
  );
});

export default LogoutButton;

