import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import "./AdminPage.css";
import { useState } from "react";
import ComparisonsData from "../../components/ComparisonsData/ComparisonsData";
import Button from "../../ui/Button/Button";

const AdminPage = () => {
  authStore.page = "Панель управления";
  const [showComparison, setShowComparison] = useState(false);

  if (showComparison) {
    authStore.page = "Сравнения";
    return (
      <>
        <Header />
        <ComparisonsData onBack={() => setShowComparison(false)} />;
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="admin">
        <Button
          type="button"
          text="Сравнения"
          className="link acceptance__comparison"
          onClick={() => setShowComparison(true)}
        />
        <Link to="/documents" className="link">
          Документы
        </Link>
      </div>
    </>
  );
};

export default AdminPage;
