import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import { useEffect } from "react";
import vehicleStore from "../../store/VehicleStore";
import Button from "../../ui/Button/Button";
import "./ClientPage.css";
import Loader from "../../ui/Loader/Loader";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ClientPage = () => {
  const { t } = useTranslation();
  authStore.page = t("clientPage.ui.pageTitle");

  useEffect(() => {
    vehicleStore.fetchVehicles();
  }, []);

  return (
    <>
      <Header />
      <div className="client">
        <h2 className="client__title">{t("clientPage.ui.clientTitle")}</h2>
        <div className="client__scroll-container">
          {vehicleStore.isLoading ? (
            <div className="client__loader">
              <Loader />
            </div>
          ) : (
            <div className="client__vehicles">
              {vehicleStore.vehicles.map((vehicle, i) => (
                <button key={i} className="client__vehicle">
                  {i + 1}. {vehicle.brand} {vehicle.model} {vehicle.vin}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="client__footer">
          <Button className="link" text={t("clientPage.ui.addVehicleBtn")} />
          {authStore.role === "admin" ? (
            <Link to="/clients" className="link warning">
              {t("common.ui.back")}
            </Link>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default observer(ClientPage);
