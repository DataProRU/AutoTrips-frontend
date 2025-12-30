import { observer } from "mobx-react";
import "./CarAcceptanceData.css";
import Button from "../../ui/Button/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "../../ui/Select/Select";
import FileUploader from "../../ui/FileUploader/FileUploader";
import { useEffect, useState } from "react";
import reportsStore from "../../store/ReportsStore";
import MessageBox from "../../ui/MessageBox/MessageBox";
import { useTranslation } from "react-i18next";
import ImageSlider from "../../ui/ImageSlider/ImageSlider";
import FullscreenSlider from "../../ui/FullscreenSlider/FullscreenSlider";
import { ReportPhoto } from "../../models/response/ReportPhoto";
import ReportsService from "../../services/ReportsService";

const getSchema = (t: (key: string) => string) =>
  z.object({
    vin: z.string().min(1, t("carAcceptanceData.errors.vinRequired")),
    acceptanceDate: z.string().optional(),
    carPhotos: z
      .array(z.instanceof(File))
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
  });

type ExistingAcceptanceFormData = z.infer<ReturnType<typeof getSchema>>;

const ExistingAcceptance = () => {
  const [uploaderKey, setUploaderKey] = useState(0);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenPhotos, setFullscreenPhotos] = useState<string[]>([]);
  const [initialSlide, setInitialSlide] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExistingAcceptanceFormData>({
    resolver: zodResolver(getSchema(t)),
    defaultValues: {
      carPhotos: [],
      keyPhotos: [],
      docsPhotos: [],
    },
  });

  const selectedVin = watch("vin");
  const selectedDate = watch("acceptanceDate");

  useEffect(() => {
    const loadData = async () => {
      try {
        await reportsStore.fetchCars();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVin) {
      reportsStore.fetchVinReports(selectedVin);
    }
    setValue("acceptanceDate", "");
  }, [selectedVin, setValue]);

  useEffect(() => {
    if (!selectedDate) {
      setImagePreviews([]);
      return;
    }

    const selectedReport = reportsStore.reportDatesOptions.find(
      (opt) => opt.value === selectedDate
    )?.rawReport;

    if (selectedReport) {
      const carPhotos = (selectedReport.car_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const keyPhotos = (selectedReport.key_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const documentPhotos = (selectedReport.document_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );

      setImagePreviews([...carPhotos, ...documentPhotos, ...keyPhotos]);
      setCurrentSlide(0);
    } else {
      setImagePreviews([]);
    }
  }, [selectedDate, reportsStore.vinReports]);

  const openFullscreen = (photos: string[], index: number) => {
    setFullscreenPhotos(photos);
    setInitialSlide(index);
    setIsFullscreenOpen(true);
  };

  const handleFileChange = (
    files: FileList,
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    const fileArray = Array.from(files);
    const currentFiles = control._formValues[fieldName] || [];
    const updatedFiles = [...currentFiles, ...fileArray];
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const handleDeleteFiles = (
    updatedFiles: File[],
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const onSubmit = async (data: ExistingAcceptanceFormData) => {
    if (!data.acceptanceDate) return;

    try {
      await ReportsService.updateReport(data.acceptanceDate, {
        carPhotos: data.carPhotos,
        keyPhotos: data.keyPhotos,
        docsPhotos: data.docsPhotos,
      });

      MessageBox({
        title: t("common.ui.successTitle"),
        message: t("common.ui.successMessage"),
        onClose: () => {
          setValue("carPhotos", [], { shouldValidate: true });
          setValue("keyPhotos", [], { shouldValidate: true });
          setValue("docsPhotos", [], { shouldValidate: true });
          setUploaderKey((prev) => prev + 1);
          if (selectedVin) {
            reportsStore.fetchVinReports(selectedVin);
          }
        },
        buttonText: t("common.ui.okButton"),
      });
    } catch (error) {
      console.log(error);
      MessageBox({
        title: t("common.ui.errorTitle"),
        message: t("common.ui.errorMessage"),
        onClose: () => {},
        buttonText: t("common.ui.okButton"),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Select
        name="vin"
        control={control}
        options={reportsStore.vinOptions}
        placeholder={t("carAcceptanceData.ui.vinPlaceholder")}
        error={errors.vin}
      />

      <Select
        name="acceptanceDate"
        control={control}
        options={reportsStore.reportDatesOptions}
        placeholder={t("carAcceptanceData.ui.acceptanceDate")}
        error={errors.acceptanceDate}
        className=""
        disabled={!selectedVin || reportsStore.vinReports.length === 0}
      />

      <ImageSlider
        imagePreviews={imagePreviews}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
        onDeleteImage={() => {}}
        isDeletable={false}
        onImageClick={(index) => openFullscreen(imagePreviews, index)}
      />

      <div className="acceptance__group">
        <label className={`label ${currentLanguage === "ge" ? "small" : ""}`}>
          {t("carAcceptanceData.ui.carPhotosLabel")}{" "}
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
          {t("carAcceptanceData.ui.keyPhotosLabel")}{" "}
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
          {t("carAcceptanceData.ui.docsPhotosLabel")}{" "}
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

      <Button type="submit" text="Сохранить" className="link" />

      {isFullscreenOpen && (
        <FullscreenSlider
          photos={fullscreenPhotos}
          initialSlide={initialSlide}
          onClose={() => setIsFullscreenOpen(false)}
        />
      )}
    </form>
  );
};

export default observer(ExistingAcceptance);
