import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Pictures from "../../ui/Pictures/Pictures";

const DocsPhotos = () => {
  authStore.page = "Фотографии документов";
  const { reportId } = useParams();

  if (authStore.role !== "admin") {
    return (
      <>
        <Header />
        <div className="documents">
          <p className="error-text">У вас нет доступа к данной странице</p>
          <Link to="/" className="link">
            На главную
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="photos">
        <Pictures id={String(reportId)} type="doc-photos" />
      </div>
    </>
  );
};

export default DocsPhotos;
