import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import "./AdminPage.css";
import { useState } from "react";
import ComparisonsData from "../../components/ComparisonsData/ComparisonsData";
import Button from "../../ui/Button/Button";
import { useTranslation } from "react-i18next";

const AdminPage = () => {
  const { t } = useTranslation();
  authStore.page = t("adminPage.ui.pageTitle");
  const [showComparison, setShowComparison] = useState(false);

  if (showComparison) {
    authStore.page = t("adminPage.ui.comparisonsTitle");
    return (
      <>
        <Header />
        <ComparisonsData onBack={() => setShowComparison(false)} />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin">
        <Button
          type="button"
          text={t("adminPage.ui.comparisonsButton")}
          className="admin__link link"
          onClick={() => setShowComparison(true)}
        />
        <Link to="/documents" className="link">
          {t("adminPage.ui.documentsLink")}
        </Link>
        <Link to="/clients" className="admin__link link">
          {t("adminPage.ui.clientsLink")}
        </Link>
      </div>
    </>
  );
};

export default AdminPage;
