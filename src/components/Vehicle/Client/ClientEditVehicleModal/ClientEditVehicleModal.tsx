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
import { VehicleRequest } from "../../../../models/response/Vehicle";
import dayjs from "dayjs";
import Loader from "../../../../ui/Loader/Loader";
import { AxiosError } from "../../../../models/response/AxiosError";
import ConfirmModal from "../../../../ui/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../ui/MessageBox/MessageBox";
import authStore from "../../../../store/AuthStore";
import ProgressBar from "../../../../ui/ProgressBar/ProgressBar";
import ImageSlider from "../../../../ui/ImageSlider/ImageSlider";

interface EditVehicleModalProps {
  onClose: () => void;
  vehicleId: number | null;
  onSuccess?: () => void;
}

const getSchema = (t: (key: string) => string) =>
  z.object({
    year_brand_model: z
      .string()
      .min(1, t("vehicleModal.errors.yearBrandModelRequired")),
    type: z.string().optional(),
    vin: z.string().min(1, t("vehicleModal.errors.vinRequired")),
    price: z
      .string()
      .optional()
      .refine((val) => !val || val === "" || /^\d+(\.\d{1,2})?$/.test(val), {
        message: t("vehicleModal.errors.priceInvalid"),
      }),
    container: z.string().optional(),
    date: z.date().optional().nullable(),
    transporter: z.string().optional(),
    recipient: z.string().optional(),
    document_photos: z
      .array(z.instanceof(File))
      .optional()
      .refine(
        (files) =>
          !files || files.every((file) => file.size <= 10 * 1024 * 1024),
        t("carAcceptanceData.errors.fileSizeLimit")
      )
      .refine(
        (files) =>
          !files ||
          files.every(
            (file) =>
              [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/heic",
                "image/heif",
              ].includes(file.type) ||
              file.name.toLowerCase().endsWith(".heic") ||
              file.name.toLowerCase().endsWith(".heif")
          ),
        t("carAcceptanceData.errors.fileFormatLimit")
      ),
    comment: z.string().min(1, t("vehicleModal.errors.commentRequired")),
  });

type EditVehicleFormData = z.infer<ReturnType<typeof getSchema>>;

const ClientEditVehicleModal = ({
  onClose,
  vehicleId,
  onSuccess,
}: EditVehicleModalProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<Array<{ id: number; image: string }>>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

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
            const photos =
              vehicleStore.currentRecord.document_photos?.map(
                (photo) => ({ id: photo.id, image: photo.image })
              ) || [];
            setExistingPhotos(photos);

            reset({
              year_brand_model: vehicleStore.currentRecord.year_brand_model,
              type: vehicleStore.currentRecord.v_type?.id?.toString() || "",
              vin: vehicleStore.currentRecord.vin,
              price: vehicleStore.currentRecord.price
                ? String(vehicleStore.currentRecord.price)
                : "",
              container: vehicleStore.currentRecord.container_number || "",
              date: vehicleStore.currentRecord.arrival_date
                ? new Date(vehicleStore.currentRecord.arrival_date)
                : null,
              transporter: vehicleStore.currentRecord.transporter || "",
              recipient: vehicleStore.currentRecord.recipient || "",
              document_photos: [],
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

    setIsPending(true);
    try {
      const updatedVehicle: VehicleRequest = {
        client: Number(authStore.userId),
        year_brand_model: data.year_brand_model,
        vin: data.vin,
        price: data.price ? Number(data.price) : 0,
        container_number: data.container || "",
        transporter: data.transporter || "",
        recipient: data.recipient || "",
        comment: data.comment || null,
      };

      if (data.type) {
        updatedVehicle.v_type = parseInt(data.type);
      }

      if (data.date) {
        updatedVehicle.arrival_date = dayjs(data.date).format("YYYY-MM-DD");
      }

      await vehicleStore.updateVehicle(vehicleId, updatedVehicle);
      setIsPending(false);
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
      setIsPending(false);
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
        if (errors?.arrival_date) {
          setError("date", {
            type: "manual",
            message: Array.isArray(errors.arrival_date)
              ? errors.arrival_date[0]
              : errors.arrival_date,
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
            {isPending && <ProgressBar />}
            <form onSubmit={handleSubmit(onChangeSubmit)}>
              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.yearBrandModel")}
                name="year_brand_model"
                register={register}
                error={errors.year_brand_model}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.year_brand_model || ""}
              />
              <Select
                name="type"
                control={control}
                options={vehicleStore.vehicleTypesOptions}
                error={errors.type}
                placeholder={t("vehicleModal.ui.type")}
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
                placeholder={t("vehicleModal.ui.price")}
                name="price"
                register={register}
                error={errors.price}
                className="input vehicle__input"
                value={String(vehicleStore.currentRecord?.price) || ""}
                required={false}
              />
              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.container")}
                name="container"
                register={register}
                error={errors.container}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.container_number || ""}
                required={false}
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
                    required={false}
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
                required={false}
              />

              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.recipient")}
                name="recipient"
                register={register}
                error={errors.recipient}
                className="input vehicle__input"
                value={vehicleStore.currentRecord?.recipient || ""}
                required={false}
              />

              <div>
                {existingPhotos.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <ImageSlider
                      imagePreviews={existingPhotos.map((photo) => photo.image)}
                      currentSlide={currentSlide}
                      onSlideChange={setCurrentSlide}
                      onDeleteImage={() => {}}
                      isDeletable={false}
                    />
                  </div>
                )}
              </div>

              <InputField
                type="text"
                placeholder={t("vehicleModal.ui.comment")}
                name="comment"
                register={register}
                error={errors.comment}
                className="input vehicle__input"
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
