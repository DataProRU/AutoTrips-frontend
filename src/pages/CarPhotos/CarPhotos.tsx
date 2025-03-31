import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Pictures from "../../ui/Pictures/Pictures";
import "./CarPhotos.css";
import { useTranslation } from "react-i18next";

const CarPhotos = () => {
  const { t } = useTranslation();
  authStore.page = t("carPhotos.ui.pageTitle");
  const { reportId } = useParams();

  if (authStore.role !== "admin") {
    return (
      <>
        <Header />
        <div className="documents">
          <p className="error-text">{t("carPhotos.ui.noAccess")}</p>
          <Link to="/" className="link">
            {t("carPhotos.ui.toMain")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="photos">
        <Pictures id={String(reportId)} type="car-photos" />
      </div>
    </>
  );
};

export default CarPhotos;