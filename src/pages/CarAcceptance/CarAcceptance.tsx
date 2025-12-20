import Header from "../../components/Header/Header";
import CarAcceptanceData from "../../components/CarAcceptanceData/CarAcceptanceData";
import { observer } from "mobx-react";

const CarAcceptance = observer(() => {
  return (
    <>
      <Header />
      <CarAcceptanceData />
    </>
  );
});

export default CarAcceptance;
