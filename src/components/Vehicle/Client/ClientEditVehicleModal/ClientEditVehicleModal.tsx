import { observer } from "mobx-react";
import Modal from "react-modal";
import Select from "../../../../ui/Select/Select";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import InputField from "../../../../ui/Input/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import vehicleStore from "../../../../store/VehicleStore";
import DatePicker from "../../../../ui/DatePicker/Datepicker";
import Button from "../../../../ui/Button/Button";
import { VehicleResponce } from "../../../../models/response/Vehicle";
import dayjs from "dayjs";
import Loader from "../../../../ui/Loader/Loader";
import { AxiosError } from "../../../../models/response/AxiosError";
import ConfirmModal from "../../../../ui/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../ui/MessageBox/MessageBox";
import authStore from "../../../../store/AuthStore";

interface EditVehicleModalProps {
  onClose: () => void;
  vehicleId: number | null;
  onSuccess?: () => void;
}

const getSchema = (t: (key: string) => string) =>
  z.object({
    model: z.string().min(1, t("vehicleModal.errors.modelRequired")),
    brand: z.string().min(1, t("vehicleModal.errors.brandRequired")),
    type: z.string().min(1, t("vehicleModal.errors.typeRequired")),
    vin: z.string().min(1, t("vehicleModal.errors.vinRequired")),
    container: z.string().min(1, t("vehicleModal.errors.containerRequired")),
    date: z.date({
      required_error: t("vehicleModal.errors.dateRequired"),
    }),
    transporter: z
      .string()
      .min(1, t("vehicleModal.errors.transporterRequired")),
    recipient: z.string().min(1, t("vehicleModal.errors.recipientRequired")),
    comment: z.string().optional(),
  });

type EditVehicleFormData = z.infer<ReturnType<typeof getSchema>>;

const ClientEditVehicleModal = ({
  onClose,
  vehicleId,
  onSuccess,
}: EditVehicleModalProps) => {
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
        await Promise.all([vehicleStore.fetchVehicleTypes()]);

        if (vehicleId) {
          await vehicleStore.fetchVehicle(vehicleId);
          if (vehicleStore.currentRecord) {
            reset({
              brand: vehicleStore.currentRecord.brand,
              model: vehicleStore.currentRecord.model,
              type: vehicleStore.currentRecord.v_type.id.toString(),
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
              message:
                getVehicleError(errors.vin.error_type) ?? errors.vin.message,
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [vehicleId, reset]);

  const getVehicleError = (type: string) => {
    switch (type) {
      case "vin_exists":
        return t("vehicleModal.errors.invalidVin");
      default:
        return null;
    }
  };

  const onChangeSubmit = (data: EditVehicleFormData) => {
    ConfirmModal({
      title: t("common.ui.confirmTitle"),
      message: t("vehicleModal.ui.editConfirmModal"),
      onConfirm: () => onSubmit(data),
      onCancel: () => console.log("Изменение отменено"),
      confirmLabel: t("common.ui.yes"),
      cancelLabel: t("common.ui.no"),
    });
  };

  const onSubmit = async (data: EditVehicleFormData) => {
    if (!vehicleId) return;

    try {
      const updatedVehicle: VehicleResponce = {
        client: Number(authStore.userId),
        brand: data.brand,
        model: data.model,
        v_type: parseInt(data.type),
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
        onClose: () => {
          onClose();
          if (onSuccess) onSuccess();
        },
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
            message:
              getVehicleError(errors.vin.error_type) ?? errors.vin.message,
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
        className="modal-content vehicle"
        overlayClassName="modal-overlay vehicle-overlay"
        ariaHideApp={false}
      >
        {isLoading ? (
          <div className="loader">
            <Loader />
          </div>
        ) : (
          <>
            <h2 className="vehicle__title">
              {t("vehicleModal.ui.editPageTitle")}
            </h2>
            <form onSubmit={handleSubmit(onChangeSubmit)}>
              <div className="vehicle-group">
                <InputField
                  type="text"
                  placeholder={t("vehicleModal.ui.brand")}
                  name="brand"
                  register={register}
                  error={errors.brand}
                  className="input vehicle__input"
                  value={vehicleStore.currentRecord?.brand || ""}
                />
                <InputField
                  type="text"
                  placeholder={t("vehicleModal.ui.model")}
                  name="model"
                  register={register}
                  error={errors.model}
                  className="input vehicle__input"
                  value={vehicleStore.currentRecord?.model || ""}
                />
              </div>
              <Select
                name="type"
                control={control}
                options={vehicleStore.vehicleTypesOptions}
                error={errors.type}
                placeholder={
                  <>
                    {t("vehicleModal.ui.type")}{" "}
                    <span className="vehicle__red">*</span>
                  </>
                }
              />
              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.vin")}
                name="vin"
                register={register}
                error={errors.vin}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.vin || ""}
              />
              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.container")}
                name="container"
                register={register}
                error={errors.container}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.container_number || ""}
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date: Date) => field.onChange(date)}
                    placeholderText={t("vehicleModal.ui.date")}
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
                placeholder={t("vehicleModal.ui.transporter")}
                name="transporter"
                register={register}
                error={errors.container}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.transporter || ""}
              />

              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.recipient")}
                name="recipient"
                register={register}
                error={errors.container}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.recipient || ""}
              />

              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.comment")}
                name="comment"
                register={register}
                error={errors.comment}
                className="input vehicle__input"
                required={false}
                value={vehicleStore.currentRecord?.comment || ""}
              />

              <Button
                type="submit"
                text={t("common.ui.change")}
                className="link vehicle__change"
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

export default observer(ClientEditVehicleModal);
