import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Pictures from "../../ui/Pictures/Pictures";
import { useTranslation } from "react-i18next";

const UserDocs = () => {
  const { t } = useTranslation();
  authStore.page = t("userDocs.ui.pageTitle");
  const { userId } = useParams();

  if (authStore.role !== "admin") {
    return (
      <>
        <Header />
        <div className="documents">
          <p className="error-text">{t("userDocs.ui.noAccess")}</p>
          <Link to="/" className="link">
            {t("userDocs.ui.toMain")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="photos">
        <Pictures id={String(userId)} type="docs" canBack={true} />
      </div>
    </>
  );
};

export default UserDocs;
