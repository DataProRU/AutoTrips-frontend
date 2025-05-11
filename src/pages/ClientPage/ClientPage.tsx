import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import { useEffect, useState } from "react";
import vehicleStore from "../../store/VehicleStore";
import Button from "../../ui/Button/Button";
import "./ClientPage.css";
import Loader from "../../ui/Loader/Loader";
import { observer } from "mobx-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditVehicleModal from "../../components/Vehicle/EditVehicleModal/EditVehicleModal";

const ClientPage = () => {
  const { t } = useTranslation();
  authStore.page = t("clientPage.ui.pageTitle");

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const { userId } = useParams();

  useEffect(() => {
    vehicleStore.fetchVehicles(Number(userId));
  }, []);

  const handleVehicleClick = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    vehicleStore.fetchVehicle(vehicleId).then(() => {
      setEditModalOpen(true);
    });
  };

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
              {vehicleStore.vehicles.length > 0 ? (
                vehicleStore.vehicles.map((vehicle, i) => (
                  <button
                    key={i}
                    className="client__vehicle"
                    onClick={() => handleVehicleClick(vehicle.id)}
                  >
                    {i + 1}. {vehicle.brand} {vehicle.model} {vehicle.vin}
                  </button>
                ))
              ) : (
                <p className="client__empty">
                  Список транспортных средств пуст
                </p>
              )}
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

        {isEditModalOpen && (
          <EditVehicleModal
            onClose={() => setEditModalOpen(false)}
            vehicleId={selectedVehicleId}
          />
        )}
      </div>
    </>
  );
};

export default observer(ClientPage);
