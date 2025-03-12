import AuthData from "../../components/AuthData/AuthData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const Auth = () => {
  authStore.page = "Авторизация";
  
  return (
    <>
      <Header />
      <AuthData />
    </>
  );
};

export default Auth;
