import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Pictures from "../../ui/Pictures/Pictures";
import { useTranslation } from "react-i18next";

const KeyPhotos = () => {
  const { t } = useTranslation();
  authStore.page = t("keyPhotos.ui.pageTitle");
  const { reportId } = useParams();

  if (authStore.role !== "admin") {
    return (
      <>
        <Header />
        <div className="documents">
          <p className="error-text">{t("keyPhotos.ui.noAccess")}</p>
          <Link to="/" className="link">
            {t("keyPhotos.ui.toMain")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="photos">
        <Pictures id={String(reportId)} type="key-photos" />
      </div>
    </>
  );
};

export default KeyPhotos;