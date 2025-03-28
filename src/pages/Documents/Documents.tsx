import { observer } from "mobx-react";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import "./Documents.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import userStore from "../../store/UserStore";

const Documents = () => {
  authStore.page = "Документы";

  useEffect(() => {
    userStore.fetchUsers();
  }, []);

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
      <div className="documents">
        <h2 className="documents__title">Список пользователей</h2>

        <div className="documents__scroll-container">
          <div className="documents__users">
            {userStore.users.map((user) => (
              <Link to={`/docs/${user.id}`} className="link">
                {user.full_name}
              </Link>
            ))}
          </div>
        </div>

        <div className="documents__footer">
          <Link to="/" className="link">
            Назад
          </Link>
        </div>
      </div>
    </>
  );
};

export default observer(Documents);
