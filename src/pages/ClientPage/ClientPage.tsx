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
import AdminEditVehicleModal from "../../components/Vehicle/Admin/AdminEditVehicleModal/AdminEditVehicleModal";
import AdminAddVehicleModal from "../../components/Vehicle/Admin/AdminAddVehicleModal/AdminAddVehicleModal";
import dayjs from "dayjs";
import ClientEditVehicleModal from "../../components/Vehicle/Client/ClientEditVehicleModal/ClientEditVehicleModal";
import ClientAddVehicleModal from "../../components/Vehicle/Client/ClientAddVehicleModal/ClientAddVehicleModal";
import MassAddVehicleModal from "../../components/Vehicle/MassAddVehicleModal/MassAddVehicleModal";

const ClientPage = () => {
  const { t } = useTranslation();
  authStore.page = t("clientPage.ui.pageTitle");

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [addModalState, setAddModalState] = useState<
    "none" | "choice" | "mass" | "manual"
  >("none");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const { userId } = useParams();

  useEffect(() => {
    vehicleStore.fetchVehicles(Number(userId ?? authStore.userId));
  }, []);

  const refreshVehicles = () => {
    vehicleStore.fetchVehicles(Number(userId ?? authStore.userId));
  };

  const handleEditehicleClick = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    vehicleStore.fetchVehicle(vehicleId).then(() => {
      setEditModalOpen(true);
    });
  };

  const closeAddModal = () => {
    setAddModalState("none");
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
                    onClick={() => handleEditehicleClick(vehicle.id)}
                  >
                    {i + 1}. {vehicle.year_brand_model} {vehicle.vin}{" "}
                    {vehicle.container_number}
                    {vehicle.arrival_date
                      ? dayjs(vehicle.arrival_date).format("DD.MM.YYYY")
                      : ""}
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
          <Button
            className="light"
            onClick={() => {
              setAddModalState("mass");
            }}
            text={t("clientPage.ui.massAddVehicleBtn")}
          />
          <Button
            className="link"
            onClick={() => {
              setAddModalState("manual");
            }}
            text={t("clientPage.ui.addVehicleBtn")}
          />
          {authStore.role === "admin" ? (
            <Link to="/clients" className="link warning">
              {t("common.ui.back")}
            </Link>
          ) : (
            <></>
          )}
        </div>

        {isEditModalOpen &&
          (authStore.role === "admin" ? (
            <AdminEditVehicleModal
              onClose={() => setEditModalOpen(false)}
              vehicleId={selectedVehicleId}
              onSuccess={refreshVehicles}
            />
          ) : authStore.role === "client" ? (
            <ClientEditVehicleModal
              onClose={() => setEditModalOpen(false)}
              vehicleId={selectedVehicleId}
              onSuccess={refreshVehicles}
            />
          ) : null)}

        {addModalState === "mass" && (
          <MassAddVehicleModal
            onClose={closeAddModal}
            userId={Number(userId ?? authStore.userId)}
            onSuccess={refreshVehicles}
          />
        )}

        {addModalState === "manual" &&
          (authStore.role === "admin" ? (
            <AdminAddVehicleModal
              onClose={closeAddModal}
              userId={Number(userId)}
              vehicleId={null}
              onSuccess={refreshVehicles}
            />
          ) : authStore.role === "client" ? (
            <ClientAddVehicleModal
              onClose={closeAddModal}
              userId={Number(userId ?? authStore.userId)}
              vehicleId={null}
              onSuccess={refreshVehicles}
            />
          ) : null)}
      </div>
    </>
  );
};

export default observer(ClientPage);
