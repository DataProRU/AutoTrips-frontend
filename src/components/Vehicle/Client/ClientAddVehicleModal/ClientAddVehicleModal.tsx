import { observer } from "mobx-react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import Select from "../../../../ui/Select/Select";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import InputField from "../../../../ui/Input/Input";
import Button from "../../../../ui/Button/Button";
import vehicleStore from "../../../../store/VehicleStore";
import DatePicker from "../../../../ui/DatePicker/Datepicker";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Loader from "../../../../ui/Loader/Loader";
import dayjs from "dayjs";
import MessageBox from "../../../../ui/MessageBox/MessageBox";
import { AxiosError } from "../../../../models/response/AxiosError";
import { Vehicle, VehicleRequest } from "../../../../models/response/Vehicle";
import ConfirmModal from "../../../../ui/ConfirmModal/ConfirmModal";
import FileUploader from "../../../../ui/FileUploader/FileUploader";
import ProgressBar from "../../../../ui/ProgressBar/ProgressBar";
import ImageSlider from "../../../../ui/ImageSlider/ImageSlider";

interface AddVehicleModalProps {
  onClose: () => void;
  vehicleId: number | null;
  userId: number;
  onSuccess?: () => void;
}

const ClientAddVehicleModal = observer(
  ({ onClose, vehicleId, userId, onSuccess }: AddVehicleModalProps) => {
    const getVehicleSchema = useCallback(
      (t: (key: string) => string) =>
        z.object({
          year_brand_model: z
            .string()
            .min(1, t("vehicleModal.errors.yearBrandModelRequired")),
          type: z.string().optional(),
          vin: z.string().min(1, t("vehicleModal.errors.vinRequired")),
          price: z
            .string()
            .optional()
            .refine(
              (val) => !val || val === "" || /^\d+(\.\d{1,2})?$/.test(val),
              {
                message: t("vehicleModal.errors.priceInvalid"),
              }
            )
            .transform((val) => (val && val !== "" ? parseFloat(val) : 0)),
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
          comment: z.string().optional(),
        }),
      []
    );

    type VehiclesFormData = z.infer<ReturnType<typeof getVehicleSchema>>[];

    const { t } = useTranslation();
    const [tabIndex, setTabIndex] = useState(0);
    const [vehiclesCount, setVehiclesCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<{
      [key: number]: string[];
    }>({});
    const [currentSlides, setCurrentSlides] = useState<{
      [key: number]: number;
    }>({});
    const schema = useMemo(
      () =>
        z.object({
          vehicles: z.array(getVehicleSchema(t)),
        }),
      [t]
    );

    useEffect(() => {
      return () => {
        Object.values(imagePreviews).forEach((previews) => {
          previews.forEach((preview) => URL.revokeObjectURL(preview));
        });
      };
    }, [imagePreviews]);

    useEffect(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([vehicleStore.fetchVehicleTypes()]);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [vehicleId]);

    const {
      control,
      handleSubmit,
      register,
      formState: { errors },
      trigger,
      setFocus,
      setValue,
      setError,
    } = useForm<{
      vehicles: VehiclesFormData;
    }>({
      defaultValues: {
        vehicles: Array(vehiclesCount).fill({
          year_brand_model: "",
          type: "",
          vin: "",
          price: "",
          container: "",
          date: undefined,
          transporter: "",
          recipient: "",
          document_photos: [],
          comment: "",
        }),
      },
      resolver: zodResolver(schema),
    });

    const addNewVehicle = async () => {
      if (vehiclesCount === 1) {
        const isValid = await trigger("vehicles");

        if (!isValid) {
          const errorIndex = findFirstErrorIndex(errors);
          if (errorIndex !== -1) {
            setTabIndex(errorIndex);
            focusFirstErrorField(errorIndex);
          }
          return;
        }
      }

      const currentVehicles = control._formValues.vehicles;

      const sourceVehicle = currentVehicles[0];
      const newVehicle = {
        ...sourceVehicle,
        year_brand_model: "",
        type: "",
        vin: "",
        price: "",
        date: sourceVehicle?.date,
        container: sourceVehicle?.container,
        transporter: sourceVehicle?.transporter,
        recipient: "",
        document_photos: [],
        comment: "",
      };

      setValue("vehicles", [...currentVehicles, newVehicle]);

      setVehiclesCount((prev) => prev + 1);
      setTabIndex(vehiclesCount);
    };

    const removeVehicle = (index: number) => {
      if (vehiclesCount <= 1) return;

      const currentVehicles = control._formValues.vehicles;

      const newVehicles = currentVehicles.filter(
        (_: unknown, i: number) => i !== index
      );

      setValue("vehicles", newVehicles);

      setVehiclesCount((prev) => prev - 1);
      setTabIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
    };

    const handleFormSubmit = async () => {
      const currentVins = control._formValues.vehicles.map(
        (v: Vehicle) => v.vin
      );
      if (new Set(currentVins).size !== currentVins.length) {
        const duplicateIndex = currentVins.findIndex(
          (vin: string, i: number) => currentVins.indexOf(vin) !== i
        );

        setTabIndex(duplicateIndex);
        setError(`vehicles.${duplicateIndex}.vin`, {
          type: "manual",
          message: t("vehicleModal.errors.duplicateVin"),
        });
        setFocus(`vehicles.${duplicateIndex}.vin`);
        return;
      }

      const isValid = await trigger("vehicles");
      if (!isValid) {
        const errorIndex = findFirstErrorIndex(errors);
        if (errorIndex !== -1) {
          setTabIndex(errorIndex);
          focusFirstErrorField(errorIndex);
        }
        return;
      }

      ConfirmModal({
        title: t("common.ui.confirmTitle"),
        message: t("vehicleModal.ui.editConfirmModal"),
        onConfirm: () => handleSubmit(onValidSubmit)(),
        onCancel: () => console.log("Изменение отменено"),
        confirmLabel: t("common.ui.yes"),
        cancelLabel: t("common.ui.no"),
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findFirstErrorIndex = (errors: any): number => {
      for (let i = 0; i < vehiclesCount; i++) {
        if (errors.vehicles?.[i]) return i;
      }
      return -1;
    };

    const focusFirstErrorField = (tabIndex: number) => {
      const vehicleErrors = errors.vehicles?.[tabIndex];
      if (!vehicleErrors) return;

      const errorField = Object.keys(
        vehicleErrors
      )[0] as keyof VehiclesFormData[number];
      setFocus(`vehicles.${tabIndex}.${errorField}`);
    };

    const handleFileChange = (
      files: FileList,
      fieldName: "document_photos",
      field: { onChange: (value: File[]) => void },
      index: number
    ) => {
      const fileArray = Array.from(files);
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      const currentFiles =
        control._formValues.vehicles[index]?.[fieldName] || [];
      const updatedFiles = [...currentFiles, ...fileArray];
      setImagePreviews((prev) => ({
        ...prev,
        [index]: [...(prev[index] || []), ...newPreviews],
      }));
      setValue(`vehicles.${index}.${fieldName}`, updatedFiles, {
        shouldValidate: true,
      });
      field.onChange(updatedFiles);
    };

    const handleDeleteFiles = (
      updatedFiles: File[],
      fieldName: "document_photos",
      field: { onChange: (value: File[]) => void },
      index: number
    ) => {
      const currentFiles =
        control._formValues.vehicles[index]?.[fieldName] || [];
      const deletedIndices: number[] = [];
      currentFiles.forEach((file: File, fileIndex: number) => {
        if (!updatedFiles.includes(file)) {
          deletedIndices.push(fileIndex);
        }
      });

      deletedIndices.reverse().forEach((fileIndex) => {
        const deletedPreview = imagePreviews[index]?.[fileIndex];
        if (deletedPreview) {
          URL.revokeObjectURL(deletedPreview);
        }
      });

      const updatedPreviews = (imagePreviews[index] || []).filter(
        (_: string, fileIndex: number) => !deletedIndices.includes(fileIndex)
      );
      setImagePreviews((prev) => ({
        ...prev,
        [index]: updatedPreviews,
      }));

      setValue(`vehicles.${index}.${fieldName}`, updatedFiles, {
        shouldValidate: true,
      });
      field.onChange(updatedFiles);
    };

    const handleDeleteImage = (index: number, imageIndex: number) => {
      ConfirmModal({
        title: t("register.ui.deleteImageTitle") || "Удалить фото",
        message:
          t("register.ui.deleteImageMessage") ||
          "Вы уверены, что хотите удалить это фото?",
        confirmLabel: t("common.ui.yes"),
        cancelLabel: t("common.ui.no"),
        onConfirm: () => {
          const deletedPreview = imagePreviews[index]?.[imageIndex];
          if (deletedPreview) {
            URL.revokeObjectURL(deletedPreview);
          }
          const updatedPreviews = (imagePreviews[index] || []).filter(
            (_, i) => i !== imageIndex
          );
          setImagePreviews((prev) => ({
            ...prev,
            [index]: updatedPreviews,
          }));

          const currentFiles =
            control._formValues.vehicles[index]?.document_photos || [];
          const updatedFiles = currentFiles.filter(
            (_: File, i: number) => i !== imageIndex
          );
          setValue(`vehicles.${index}.document_photos`, updatedFiles, {
            shouldValidate: true,
          });
        },
        onCancel: () => {},
      });
    };

    const onValidSubmit = async (data: { vehicles: VehiclesFormData }) => {
      setIsPending(true);
      try {
        const transformedData = data.vehicles.map((vehicle): VehicleRequest => {
          const baseData: VehicleRequest = {
            client: userId,
            year_brand_model: vehicle.year_brand_model,
            vin: vehicle.vin,
            price: vehicle.price || 0,
            container_number: vehicle.container || "",
            transporter: vehicle.transporter || "",
            recipient: vehicle.recipient || "",
            comment: vehicle.comment || "",
            document_photos: vehicle.document_photos || [],
          };

          if (vehicle.type) {
            baseData.v_type = Number(vehicle.type);
          }

          if (vehicle.date) {
            baseData.arrival_date = dayjs(vehicle.date).format("YYYY-MM-DD");
          }

          return baseData;
        });
        await vehicleStore.addVehicles(transformedData);
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
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 400) {
          const errors = axiosError.response.data;
          if (Array.isArray(errors)) {
            for (let i = 0; i < errors.length; i++) {
              if (errors[i].vin) {
                setError(`vehicles.${i}.vin`, {
                  type: "manual",
                  message: t("vehicleModal.errors.invalidVin"),
                });

                setTabIndex(i);
                setFocus(`vehicles.${i}.vin`);
              }
              if (errors[i].arrival_date) {
                setError(`vehicles.${i}.date`, {
                  type: "manual",
                  message: Array.isArray(errors[i].arrival_date)
                    ? errors[i].arrival_date[0]
                    : errors[i].arrival_date,
                });

                setTabIndex(i);
                setFocus(`vehicles.${i}.date`);
              }
            }
          }
        }
      }
    };

    return (
      <Modal
        isOpen={true}
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
              {t("vehicleModal.ui.addPageTitle")}
            </h2>
            {isPending && <ProgressBar />}
            <form onSubmit={handleSubmit(onValidSubmit)}>
              <Tabs
                selectedIndex={tabIndex}
                onSelect={(index) => setTabIndex(index)}
              >
                <TabList>
                  {Array.from({ length: vehiclesCount }).map((_, i) => (
                    <Tab key={i}>{i + 1}</Tab>
                  ))}
                  <button
                    type="button"
                    onClick={addNewVehicle}
                    className="react-tabs__tab-add-button"
                  >
                    +
                  </button>
                </TabList>

                {Array.from({ length: vehiclesCount }).map((_, i) => (
                  <TabPanel key={i}>
                    {vehiclesCount > 1 && (
                      <Button
                        type="button"
                        text={t("common.ui.delete")}
                        className="link warning react-tabs__tab-remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVehicle(i);
                          trigger("vehicles");
                        }}
                      />
                    )}

                    <div className="vehicle-group">
                      <InputField
                        type="text"
                        placeholder={t("vehicleModal.ui.yearBrandModel")}
                        name={`vehicles.${i}.year_brand_model`}
                        register={register}
                        error={errors.vehicles?.[i]?.year_brand_model}
                        className="input vehicle__input"
                        value={
                          control._formValues.vehicles[i]?.year_brand_model ||
                          ""
                        }
                      />
                    </div>

                    <Controller
                      name={`vehicles.${i}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          name={`vehicles.${i}.type`}
                          control={control}
                          options={vehicleStore.vehicleTypesOptions}
                          error={errors.vehicles?.[i]?.type}
                          placeholder={t("vehicleModal.ui.type")}
                        />
                      )}
                    />

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.vin")}
                      name={`vehicles.${i}.vin`}
                      register={register}
                      error={errors.vehicles?.[i]?.vin}
                      className="input vehicle__input"
                      value={control._formValues.vehicles[i]?.vin || ""}
                    />

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.price")}
                      name={`vehicles.${i}.price`}
                      register={register}
                      error={errors.vehicles?.[i]?.price}
                      className="input vehicle__input"
                      value={control._formValues.vehicles[i]?.price || ""}
                      required={false}
                    />

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.container")}
                      name={`vehicles.${i}.container`}
                      register={register}
                      error={errors.vehicles?.[i]?.container}
                      className="input vehicle__input"
                      value={control._formValues.vehicles[i]?.container || ""}
                      required={false}
                    />

                    <Controller
                      name={`vehicles.${i}.date`}
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={(date: Date) => field.onChange(date)}
                          placeholderText={t("vehicleModal.ui.date")}
                          value={
                            field.value
                              ? field.value.toLocaleDateString("ru-RU")
                              : ""
                          }
                          required={false}
                          control={control}
                          error={errors.vehicles?.[i]?.date}
                        />
                      )}
                    />

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.transporter")}
                      name={`vehicles.${i}.transporter`}
                      register={register}
                      error={errors.vehicles?.[i]?.transporter}
                      className="input vehicle__input"
                      value={control._formValues.vehicles[i]?.transporter || ""}
                      required={false}
                    />

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.recipient")}
                      name={`vehicles.${i}.recipient`}
                      register={register}
                      error={errors.vehicles?.[i]?.recipient}
                      className="input vehicle__input"
                      value={control._formValues.vehicles[i]?.recipient || ""}
                      required={false}
                    />

                    <div>
                      <label className="label">
                        {t("vehicleModal.ui.documents")}
                      </label>
                      <Controller
                        name={`vehicles.${i}.document_photos`}
                        control={control}
                        render={({ field }) => (
                          <FileUploader
                            key={`document_photos-${i}`}
                            onFilesSelected={(files) => {
                              handleFileChange(
                                files,
                                "document_photos",
                                field,
                                i
                              );
                            }}
                            onDelete={(updatedFiles) =>
                              handleDeleteFiles(
                                updatedFiles,
                                "document_photos",
                                field,
                                i
                              )
                            }
                            error={errors.vehicles?.[i]?.document_photos}
                          />
                        )}
                      />
                      {imagePreviews[i] && imagePreviews[i].length > 0 && (
                        <div style={{ marginTop: "20px" }}>
                          <ImageSlider
                            imagePreviews={imagePreviews[i]}
                            currentSlide={currentSlides[i] || 0}
                            onSlideChange={(slide) =>
                              setCurrentSlides((prev) => ({
                                ...prev,
                                [i]: slide,
                              }))
                            }
                            onDeleteImage={(imageIndex) =>
                              handleDeleteImage(i, imageIndex)
                            }
                            isDeletable={true}
                          />
                        </div>
                      )}
                    </div>

                    <InputField
                      type="text"
                      placeholder={t("vehicleModal.ui.comment")}
                      name={`vehicles.${i}.comment`}
                      register={register}
                      error={errors.vehicles?.[i]?.comment}
                      className="input vehicle__input"
                      required={false}
                      value={control._formValues.vehicles[i]?.comment || ""}
                    />
                  </TabPanel>
                ))}
              </Tabs>

              <div className="buttons-container">
                <Button
                  type="button"
                  text={t("common.ui.saveAll")}
                  className="link vehicle__change"
                  onClick={handleFormSubmit}
                />

                <Button
                  type="button"
                  text={t("common.ui.back")}
                  className="link warning"
                  onClick={onClose}
                />
              </div>
            </form>
          </>
        )}
      </Modal>
    );
  }
);

export default ClientAddVehicleModal;
