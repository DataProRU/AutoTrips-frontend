import AuthData from "../../components/AuthData/AuthData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import { useTranslation } from "react-i18next";

const Auth = () => {
  const { t } = useTranslation();
  authStore.page = t("auth.ui.pageTitle");

  return (
    <>
      <Header />
      <AuthData />
    </>
  );
};

export default Auth;