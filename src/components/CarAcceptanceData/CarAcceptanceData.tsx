import { observer } from "mobx-react";
import "./CarAcceptanceData.css";
import Button from "../../ui/Button/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import getTodayDate from "../../utils/getTodayDate";
import Select from "../../ui/Select/Select";
import FileUploader from "../../ui/FileUploader/FileUploader";
import InputField from "../../ui/Input/Input";
import ReportsService from "../../services/ReportsService";
import { AcceptanceData } from "../../@types/AcceptanceData";
import { useEffect, useState } from "react";
import reportsStore from "../../store/ReportsStore";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import MessageBox from "../../ui/MessageBox/MessageBox";
import ComparisonsData from "../ComparisonsData/ComparisonsData";
import { useTranslation } from "react-i18next";
import Loader from "../../ui/Loader/Loader";
import ProgressBar from "../../ui/ProgressBar/ProgressBar";
import ExistingAcceptance from "./ExistingAcceptance";

const getSchema = (t: (key: string) => string) =>
  z.object({
    vin: z.string().min(1, t("carAcceptanceData.errors.vinRequired")),
    carPhotos: z
      .array(z.instanceof(File))
      .min(1, t("carAcceptanceData.errors.photosRequired"))
      .max(30, t("carAcceptanceData.errors.carPhotosMaxLimit"))
      .refine(
        (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
        t("carAcceptanceData.errors.fileSizeLimit")
      )
      .refine(
        (files) =>
          files.every((file) =>
            [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/heic",
              "image/heif",
            ].includes(file.type)
          ),
        t("carAcceptanceData.errors.fileFormatLimit")
      ),
    keyPhotos: z
      .array(z.instanceof(File))
      .min(1, t("carAcceptanceData.errors.photosRequired"))
      .max(3, t("carAcceptanceData.errors.keyPhotosMaxLimit"))
      .refine(
        (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
        t("carAcceptanceData.errors.fileSizeLimit")
      )
      .refine(
        (files) =>
          files.every((file) =>
            [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/heic",
              "image/heif",
            ].includes(file.type)
          ),
        t("carAcceptanceData.errors.fileFormatLimit")
      ),
    docsPhotos: z
      .array(z.instanceof(File))
      .min(1, t("carAcceptanceData.errors.photosRequired"))
      .max(10, t("carAcceptanceData.errors.docsPhotosMaxLimit"))
      .refine(
        (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
        t("carAcceptanceData.errors.fileSizeLimit")
      )
      .refine(
        (files) =>
          files.every((file) =>
            [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/heic",
              "image/heif",
            ].includes(file.type)
          ),
        t("carAcceptanceData.errors.fileFormatLimit")
      ),
    place: z.string().optional(),
    notes: z.string().optional(),
  });

type CarAcceptanceFormData = z.infer<ReturnType<typeof getSchema>>;

const CarAcceptanceData = () => {
  const [uploaderKey, setUploaderKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CarAcceptanceFormData>({
    resolver: zodResolver(getSchema(t)),
    defaultValues: {
      carPhotos: [],
      keyPhotos: [],
      docsPhotos: [],
      place: "",
      notes: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await reportsStore.fetchCars();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedVin = watch("vin");

  useEffect(() => {
    setValue("place", "", { shouldValidate: false, shouldDirty: false });
    setValue("notes", "", { shouldValidate: false, shouldDirty: false });
  }, [selectedVin, setValue]);

  const resetForm = () => {
    reset();
    setUploaderKey((prev) => prev + 1);
  };

  const getCarModel = () => {
    return selectedVin && reportsStore.vins[selectedVin]
      ? reportsStore.vins[selectedVin]
      : "";
  };

  const handleFileChange = (
    files: FileList,
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    const fileArray = Array.from(files);

    const currentFiles = control._formValues[fieldName] || [];
    const updatedFiles = [...currentFiles, ...fileArray];

    console.log(
      `Загружено ${fileArray.length} файла(ов) для поля ${fieldName}`
    );
    console.log(`Всего файлов в поле ${fieldName}: ${updatedFiles.length}`);
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const handleDeleteFiles = (
    updatedFiles: File[],
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const handleAcceptCar = async (data: CarAcceptanceFormData) => {
    setIsPending(true);
    const submissionData: AcceptanceData = {
      vin: data.vin,
      model: getCarModel(),
      carPhotos: data.carPhotos,
      keyPhotos: data.keyPhotos,
      docsPhotos: data.docsPhotos,
      place: data.place,
      notes: data.notes || "",
      status: "Принят",
    };

    await ReportsService.addReport(submissionData);
    setIsPending(false);

    MessageBox({
      title: t("common.ui.successTitle"),
      message: t("common.ui.successMessage"),
      onClose: () => {},
      buttonText: t("common.ui.okButton"),
    });
    resetForm();
  };

  const handleDamagedCar = async (data: CarAcceptanceFormData) => {
    const submissionData: AcceptanceData = {
      vin: data.vin,
      model: getCarModel(),
      carPhotos: data.carPhotos,
      keyPhotos: data.keyPhotos,
      docsPhotos: data.docsPhotos,
      place: data.place,
      notes: data.notes || "",
      status: "Повреждён",
    };

    await ReportsService.addReport(submissionData);

    MessageBox({
      title: t("common.ui.successTitle"),
      message: t("carAcceptanceData.ui.successDamagedMessage"),
      onClose: () => {},
      buttonText: t("common.ui.okButton"),
    });
    resetForm();
  };

  const onAcceptCarSubmit = (data: CarAcceptanceFormData) => {
    ConfirmModal({
      title: t("common.ui.confirmTitle"),
      message: t("carAcceptanceData.ui.confirmAcceptMessage"),
      onConfirm: () => handleAcceptCar(data),
      onCancel: () => console.log("Принятие отменено"),
      confirmLabel: t("common.ui.yes"),
      cancelLabel: t("common.ui.no"),
    });
  };

  const onDamagedCarSubmit = (data: CarAcceptanceFormData) => {
    ConfirmModal({
      title: t("common.ui.confirmTitle"),
      message: t("carAcceptanceData.ui.confirmDamagedMessage"),
      onConfirm: () => handleDamagedCar(data),
      onCancel: () => console.log("Отмена действия"),
      confirmLabel: t("common.ui.yes"),
      cancelLabel: t("common.ui.no"),
    });
  };

  if (showComparison) {
    return (
      <ComparisonsData
        onBack={() => setShowComparison(false)}
        initialVin={selectedVin}
      />
    );
  }

  return (
    <div className="acceptance__form">
      {isLoading ? (
        <div className="loader">
          <Loader />
        </div>
      ) : (
        <>
          <div className="acceptance__tabs">
            <button
              type="button"
              className={`acceptance__tab ${
                activeTab === "new" ? "acceptance__tab--active" : ""
              }`}
              onClick={() => setActiveTab("new")}
            >
              {t("carAcceptanceData.ui.newAcceptance")}
            </button>
            <button
              type="button"
              className={`acceptance__tab ${
                activeTab === "existing" ? "acceptance__tab--active" : ""
              }`}
              onClick={() => setActiveTab("existing")}
            >
              {t("carAcceptanceData.ui.existingAcceptance")}
            </button>
          </div>

          {activeTab === "new" ? (
            <form>
              {isPending && <ProgressBar />}
              <p className="acceptance__date_borderless">
                {t("carAcceptanceData.ui.acceptanceDate")}: {getTodayDate()}
              </p>
              <Select
                name="vin"
                control={control}
                options={reportsStore.vinOptions}
                placeholder={t("carAcceptanceData.ui.vinPlaceholder")}
                error={errors.vin}
              />

              <p className="acceptance__text">
                {t("carAcceptanceData.ui.brandLabel")}: {""}
                <span className="acceptance__text-model">{getCarModel()}</span>
              </p>
              <Button
                type="button"
                text={t("carAcceptanceData.ui.compareModel")}
                className="link acceptance__comparison"
                disabled={!selectedVin}
                onClick={() => setShowComparison(true)}
              />
              
              <div className="acceptance__group">
                <label
                  className={`label ${currentLanguage === "ge" ? "small" : ""}`}
                >
                  {t("carAcceptanceData.ui.carPhotosLabel")} {""}
                  <span className="label-required">*</span>
                </label>
                <Controller
                  name="carPhotos"
                  control={control}
                  render={({ field }) => (
                    <FileUploader
                      key={`carPhotos-${uploaderKey}`}
                      onFilesSelected={(files) => {
                        handleFileChange(files, "carPhotos");
                        field.onChange(control._formValues.carPhotos);
                      }}
                      onDelete={(updatedFiles) =>
                        handleDeleteFiles(updatedFiles, "carPhotos")
                      }
                      error={errors.carPhotos}
                    />
                  )}
                />
              </div>

              <div className="acceptance__group">
                <label className="label">
                  {t("carAcceptanceData.ui.keyPhotosLabel")} {""}
                  <span className="label-required">*</span>
                </label>
                <Controller
                  name="keyPhotos"
                  control={control}
                  render={({ field }) => (
                    <FileUploader
                      key={`keyPhotos-${uploaderKey}`}
                      onFilesSelected={(files) => {
                        handleFileChange(files, "keyPhotos");
                        field.onChange(control._formValues.keyPhotos);
                      }}
                      onDelete={(updatedFiles) =>
                        handleDeleteFiles(updatedFiles, "keyPhotos")
                      }
                      error={errors.keyPhotos}
                    />
                  )}
                />
              </div>

              <div className="acceptance__group">
                <label className="label">
                  {t("carAcceptanceData.ui.docsPhotosLabel")} {""}
                  <span className="label-required">*</span>
                </label>
                <Controller
                  name="docsPhotos"
                  control={control}
                  render={({ field }) => (
                    <FileUploader
                      key={`docsPhotos-${uploaderKey}`}
                      onFilesSelected={(files) => {
                        handleFileChange(files, "docsPhotos");
                        field.onChange(control._formValues.docsPhotos);
                      }}
                      onDelete={(updatedFiles) =>
                        handleDeleteFiles(updatedFiles, "docsPhotos")
                      }
                      error={errors.docsPhotos}
                    />
                  )}
                />
              </div>

              <InputField
                type="text"
                placeholder={t("carAcceptanceData.ui.placePlaceholder")}
                name="place"
                register={register}
                error={errors.place}
                className="input"
                value={control._formValues.place || ""}
                required={false}
              />

              <InputField
                type="text"
                placeholder={t("carAcceptanceData.ui.notesPlaceholder")}
                name="notes"
                register={register}
                error={errors.notes}
                className="input acceptance__notes"
                value={control._formValues.notes || ""}
                required={false}
              />

              <div className="acceptance__btns">
                <Button
                  type="button"
                  text={t("carAcceptanceData.ui.acceptButton")}
                  className={`link acceptance__btn ${
                    currentLanguage === "az" || currentLanguage === "ge"
                      ? "tall-button"
                      : ""
                  }`}
                  onClick={handleSubmit(onAcceptCarSubmit)}
                />
                <div className="acceptance__damaged acceptance__btn">
                  <Button
                    type="button"
                    text={t("carAcceptanceData.ui.damagedButton")}
                    className="link warning"
                    onClick={handleSubmit(onDamagedCarSubmit)}
                  />
                  <span className="acceptance__warning">
                    {t("carAcceptanceData.ui.damagedWarning")}
                  </span>
                </div>
              </div>
            </form>
          ) : (
            <ExistingAcceptance />
          )}
        </>
      )}
    </div>
  );
};

export default observer(CarAcceptanceData);
