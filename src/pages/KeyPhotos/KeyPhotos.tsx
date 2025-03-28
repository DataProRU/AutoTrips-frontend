import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Pictures from "../../ui/Pictures/Pictures";

const KeyPhotos = () => {
  authStore.page = "Фотографии ключей";
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
        <Pictures id={String(reportId)} type="key-photos" />
      </div>
    </>
  );
};

export default KeyPhotos;
