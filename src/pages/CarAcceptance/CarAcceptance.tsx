import CarAcceptanceData from "../../components/CarAcceptanceData/CarAcceptanceData";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";

const CarAcceptance = () => {
  authStore.page = "Принятие авто";

  return (
    <>
      <Header />
      <CarAcceptanceData />
    </>
  );
};

export default CarAcceptance;
