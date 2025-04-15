import { useTranslation } from "react-i18next";
import CarAcceptanceData from "../../components/CarAcceptanceData/CarAcceptanceData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const CarAcceptance = () => {

  const { t } = useTranslation();
  authStore.page = t("carAcceptanceData.ui.pageTitle");

  return (
    <>
      <Header />
      <CarAcceptanceData />
    </>
  );
};

export default CarAcceptance;
