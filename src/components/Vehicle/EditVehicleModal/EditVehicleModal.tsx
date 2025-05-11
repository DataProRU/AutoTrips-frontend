import { observer } from "mobx-react";
import "./EditVehicleModal.css";
import Modal from "react-modal";
import Select from "../../../ui/Select/Select";
import { Controller, useForm } from "react-hook-form";
import userStore from "../../../store/UserStore";
import { useEffect, useState } from "react";
import InputField from "../../../ui/Input/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import vehicleStore from "../../../store/VehicleStore";
import DatePicker from "../../../ui/DatePicker/Datepicker";
import Button from "../../../ui/Button/Button";
import { VehicleUpdate } from "../../../models/response/Vehicle";
import dayjs from "dayjs";
import Loader from "../../../ui/Loader/Loader";
import { AxiosError } from "../../../models/response/AxiosError";
import ConfirmModal from "../../../ui/ConfirmModal/ConfirmModal";
import MessageBox from "../../../ui/MessageBox/MessageBox";

interface EditVehicleModalProps {
  onClose: () => void;
  vehicleId: number | null;
}

const getSchema = (t: (key: string) => string) =>
  z.object({
    client: z.string().min(1, t("editVehicleModal.errors.clientRequired")),
    model: z.string().min(1, t("editVehicleModal.errors.modelRequired")),
    brand: z.string().min(1, t("editVehicleModal.errors.brandRequired")),
    type: z.string().min(1, t("editVehicleModal.errors.typeRequired")),
    vin: z.string().min(1, t("editVehicleModal.errors.vinRequired")),
    container: z
      .string()
      .min(1, t("editVehicleModal.errors.containerRequired")),
    date: z.date({
      required_error: t("editVehicleModal.errors.dateRequired"),
    }),
    transporter: z
      .string()
      .min(1, t("editVehicleModal.errors.transporterRequired")),
    recipient: z
      .string()
      .min(1, t("editVehicleModal.errors.recipientRequired")),
    comment: z.string().optional(),
  });

type EditVehicleFormData = z.infer<ReturnType<typeof getSchema>>;

const EditVehicleModal = ({ onClose, vehicleId }: EditVehicleModalProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<EditVehicleFormData>({
    resolver: zodResolver(getSchema(t)),
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          userStore.fetchСlients(),
          vehicleStore.fetchVehicleTypes(),
        ]);

        if (vehicleId) {
          await vehicleStore.fetchVehicle(vehicleId);
          if (vehicleStore.currentRecord) {
            reset({
              client:
                userStore.usersOptions.find(
                  (u) => u.label === vehicleStore.currentRecord?.client_name
                )?.value || "",
              brand: vehicleStore.currentRecord.brand,
              model: vehicleStore.currentRecord.model,
              type:
                vehicleStore.vehicleTypesOptions.find(
                  (v) => v.label === vehicleStore.currentRecord?.v_type_name
                )?.value || "",
              vin: vehicleStore.currentRecord.vin,
              container: vehicleStore.currentRecord.container_number,
              date: new Date(vehicleStore.currentRecord.arrival_date),
              transporter: vehicleStore.currentRecord.transporter,
              recipient: vehicleStore.currentRecord.recipient,
              comment: vehicleStore.currentRecord.comment || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          const errors = axiosError.response.data;
          if (errors?.vin) {
            setError("vin", {
              type: "manual",
              message: errors.vin[0],
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [vehicleId, reset]);

  const onChangeSubmit = (data: EditVehicleFormData) => {
    ConfirmModal({
      title: t("common.ui.confirmTitle"),
      message: t("editVehicleModal.ui.editConfirmModal"),
      onConfirm: () => onSubmit(data),
      onCancel: () => console.log("Изменение отменено"),
      confirmLabel: t("common.ui.yes"),
      cancelLabel: t("common.ui.no"),
    });
  };

  const onSubmit = async (data: EditVehicleFormData) => {
    if (!vehicleId) return;

    try {
      const updatedVehicle: VehicleUpdate = {
        client_id: parseInt(data.client),
        brand: data.brand,
        model: data.model,
        v_type_id: parseInt(data.type),
        vin: data.vin,
        container_number: data.container,
        arrival_date: dayjs(data.date).format("YYYY-MM-DD"),
        transporter: data.transporter,
        recipient: data.recipient,
        comment: data.comment || null,
      };

      await vehicleStore.updateVehicle(vehicleId, updatedVehicle);
      MessageBox({
        title: t("common.ui.successTitle"),
        message: t("common.ui.successMessage"),
        onClose: () => {},
        buttonText: t("common.ui.okButton"),
      });
      onClose();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        const errors = axiosError.response.data;

        if (errors?.vin) {
          setError("vin", {
            type: "manual",
            message: t("editVehicleModal.errors.invalidVin"),
          });
        }
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onRequestClose={onClose}
        className="modal-content edit-vehicle"
        overlayClassName="modal-overlay edit-vehicle-overlay"
        ariaHideApp={false}
      >
        {isLoading ? (
          <div className="edit-vehicle__loader">
            <Loader />
          </div>
        ) : (
          <>
            <h2 className="edit-vehicle__title">
              {t("editVehicleModal.ui.pageTitle")}
            </h2>
            <form onSubmit={handleSubmit(onChangeSubmit)}>
              <Select
                name="client"
                control={control}
                options={userStore.usersOptions}
                placeholder={
                  <>
                    {t("editVehicleModal.ui.client")}{" "}
                    <span className="edit-vehicle__red">*</span>
                  </>
                }
                error={errors.client}
              />
              <div className="edit-vehicle-group">
                <InputField
                  type="text"
                  placeholder={t("editVehicleModal.ui.brand")}
                  name="brand"
                  register={register}
                  error={errors.brand}
                  className="input edit-vehicle__input"
                  defaultValue={vehicleStore.currentRecord?.brand || ""}
                />
                <InputField
                  type="text"
                  placeholder={t("editVehicleModal.ui.model")}
                  name="model"
                  register={register}
                  error={errors.model}
                  className="input edit-vehicle__input"
                  defaultValue={vehicleStore.currentRecord?.model || ""}
                />
              </div>
              <Select
                name="type"
                control={control}
                options={vehicleStore.vehicleTypesOptions}
                error={errors.type}
                placeholder={
                  <>
                    {t("editVehicleModal.ui.type")}{" "}
                    <span className="edit-vehicle__red">*</span>
                  </>
                }
              />
              <InputField
                type="text"
                placeholder={t("editVehicleModal.ui.vin")}
                name="vin"
                register={register}
                error={errors.vin}
                className="input edit-vehicle__input"
                defaultValue={vehicleStore.currentRecord?.vin || ""}
              />
              <InputField
                type="text"
                placeholder={t("editVehicleModal.ui.container")}
                name="container"
                register={register}
                error={errors.container}
                className="input edit-vehicle__input"
                defaultValue={
                  vehicleStore.currentRecord?.container_number || ""
                }
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    placeholderText={t("editVehicleModal.ui.date")}
                    value={
                      field.value ? field.value.toLocaleDateString("ru-RU") : ""
                    }
                    required={true}
                    control={control}
                    error={errors.date}
                  />
                )}
              />

              <InputField
                type="text"
                placeholder={t("editVehicleModal.ui.transporter")}
                name="transporter"
                register={register}
                error={errors.container}
                className="input edit-vehicle__input"
                defaultValue={vehicleStore.currentRecord?.transporter || ""}
              />

              <InputField
                type="text"
                placeholder={t("editVehicleModal.ui.recipient")}
                name="recipient"
                register={register}
                error={errors.container}
                className="input edit-vehicle__input"
                defaultValue={vehicleStore.currentRecord?.recipient || ""}
              />

              <InputField
                type="text"
                placeholder={t("editVehicleModal.ui.comment")}
                name="comment"
                register={register}
                error={errors.comment}
                className="input edit-vehicle__input"
                required={false}
                defaultValue={vehicleStore.currentRecord?.comment || ""}
              />

              <Button
                type="submit"
                text={t("common.ui.change")}
                className="link edit-vehicle__change"
              />

              <Button
                type="button"
                text={t("common.ui.back")}
                className="link warning"
                onClick={onClose}
              />
            </form>
          </>
        )}
      </Modal>
    </>
  );
};

export default observer(EditVehicleModal);
