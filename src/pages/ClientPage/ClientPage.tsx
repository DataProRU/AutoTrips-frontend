import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const ClientPage = () => {
  authStore.page = "Личный кабинет";

  return (
    <>
      <Header />
    </>
  );
};

export default ClientPage;
