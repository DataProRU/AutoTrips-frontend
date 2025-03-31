import { useEffect, useState } from "react";
import reportsStore from "../../store/ReportsStore";
import Select from "../../ui/Select/Select";
import "./ComparisonsData.css";
import { useForm } from "react-hook-form";
import { observer } from "mobx-react";
import ImageSlider from "../../ui/ImageSlider/ImageSlider";
import { ReportPhoto } from "../../models/response/ReportPhoto";
import FullscreenSlider from "../../ui/FullscreenSlider/FullscreenSlider";
import Button from "../../ui/Button/Button";
import { useTranslation } from "react-i18next";

interface ComparisonsDataProps {
  onBack?: () => void;
  initialVin?: string;
}

const ComparisonsData = ({ onBack, initialVin }: ComparisonsDataProps) => {
  const { t } = useTranslation();
  const { control, watch, setValue } = useForm({
    defaultValues: {
      vin: initialVin || "",
      checks1: null,
      checks2: null,
    },
  });
  const [imagePreviews1, setImagePreviews1] = useState<string[]>([]);
  const [imagePreviews2, setImagePreviews2] = useState<string[]>([]);
  const [currentSlide1, setCurrentSlide1] = useState(0);
  const [currentSlide2, setCurrentSlide2] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenPhotos, setFullscreenPhotos] = useState<string[]>([]);
  const [initialSlide, setInitialSlide] = useState(0);

  const selectedVin = watch("vin");
  const selectedOption1 = watch("checks1");
  const selectedOption2 = watch("checks2");

  const selectedReport1 = selectedOption1
    ? reportsStore.reportDatesOptions.find(
        (opt) => opt.value === selectedOption1
      )?.rawReport
    : null;

  const selectedReport2 = selectedOption2
    ? reportsStore.reportDatesOptions.find(
        (opt) => opt.value === selectedOption2
      )?.rawReport
    : null;

  useEffect(() => {
    reportsStore.fetchCars();
  }, []);

  useEffect(() => {
    if (selectedVin) {
      reportsStore.fetchVinReports(selectedVin);
    }
  }, [selectedVin]);

  useEffect(() => {
    if (selectedReport1) {
      const carPhotos = (selectedReport1.car_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const keyPhotos = (selectedReport1.key_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const documentPhotos = (selectedReport1.document_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );

      const allPhotos = [...carPhotos, ...keyPhotos, ...documentPhotos];
      setImagePreviews1(allPhotos);
      setCurrentSlide1(0);
    } else {
      setImagePreviews1([]);
    }
  }, [selectedReport1]);

  useEffect(() => {
    if (selectedReport2) {
      const carPhotos = (selectedReport2.car_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const keyPhotos = (selectedReport2.key_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );
      const documentPhotos = (selectedReport2.document_photos || []).map(
        (photo: ReportPhoto) => photo.image
      );

      const allPhotos = [...carPhotos, ...keyPhotos, ...documentPhotos];
      setImagePreviews2(allPhotos);
      setCurrentSlide2(0);
    } else {
      setImagePreviews2([]);
    }
  }, [selectedReport2]);

  useEffect(() => {
    setValue("checks1", null);
    setValue("checks2", null);
  }, [selectedVin, setValue]);

  const openFullscreen = (photos: string[], index: number) => {
    setFullscreenPhotos(photos);
    setInitialSlide(index);
    setIsFullscreenOpen(true);
  };

  return (
    <div className="comparisons__form">
      <Select
        name="vin"
        control={control}
        options={reportsStore.vinOptions}
        placeholder={t("comparisonsData.ui.vinPlaceholder")}
      />

      <Select
        name="checks1"
        control={control}
        options={reportsStore.reportDatesOptions}
        placeholder={t("comparisonsData.ui.checksPlaceholder")}
        disabled={!selectedVin || reportsStore.vinReports.length === 0}
      />

      <ImageSlider
        imagePreviews={imagePreviews1}
        currentSlide={currentSlide1}
        onSlideChange={setCurrentSlide1}
        onDeleteImage={() => {}}
        isDeletable={false}
        onImageClick={(index) => openFullscreen(imagePreviews1, index)}
      />

      <Select
        name="checks2"
        control={control}
        options={reportsStore.reportDatesOptions}
        placeholder={t("comparisonsData.ui.checksPlaceholder")}
        disabled={!selectedVin || reportsStore.vinReports.length === 0}
      />

      <ImageSlider
        imagePreviews={imagePreviews2}
        currentSlide={currentSlide2}
        onSlideChange={setCurrentSlide2}
        onDeleteImage={() => {}}
        isDeletable={false}
        onImageClick={(index) => openFullscreen(imagePreviews2, index)}
      />

      <Button
        type="button"
        text={t("comparisonsData.ui.backButton")}
        className="link comparisons__back"
        onClick={onBack}
      />

      {isFullscreenOpen && (
        <FullscreenSlider
          photos={fullscreenPhotos}
          initialSlide={initialSlide}
          onClose={() => setIsFullscreenOpen(false)}
        />
      )}
    </div>
  );
};

export default observer(ComparisonsData);