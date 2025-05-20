import React, { useEffect, useRef, useState } from "react";
import "./FileUploader.css";
import Gallery from "../Gallery/Gallery";
import { useTranslation } from "react-i18next";
import heic2any from "heic2any";
import ProgressBar from "../ProgressBar/ProgressBar";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  onDelete: (updatedFiles: File[]) => void;
  isDeletable?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

const FileUploader = ({
  onFilesSelected,
  onDelete,
  isDeletable = true,
  error,
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [conversionProgress, setConversionProgress] = useState({
    done: 0,
    total: 0,
    inProgress: false,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (conversionProgress.inProgress) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [conversionProgress.inProgress]);

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleChooseFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (
      file.type === "image/heic" ||
      file.name.toLowerCase().endsWith(".heic")
    ) {
      const conversionResult = (await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      })) as Blob;

      return new File(
        [conversionResult],
        file.name.replace(/\.heic$/i, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: new Date().getTime(),
        }
      );
    }
    return file;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const heicFilesCount = filesArray.filter(
        (file) =>
          file.type === "image/heic" ||
          file.name.toLowerCase().endsWith(".heic")
      ).length;

      if (heicFilesCount > 0) {
        setConversionProgress({
          done: 0,
          total: heicFilesCount,
          inProgress: true,
        });
      }

      const convertedFiles: File[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const convertedFile = await convertHeicToJpeg(file);
        convertedFiles.push(convertedFile);

        if (
          file.type === "image/heic" ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          setConversionProgress((prev) => ({
            ...prev,
            done: prev.done + 1,
          }));
        }
      }

      setSelectedFiles((prevFiles) => [...prevFiles, ...convertedFiles]);

      const dataTransfer = new DataTransfer();
      convertedFiles.forEach((file) => dataTransfer.items.add(file));
      onFilesSelected(dataTransfer.files);

      setConversionProgress({
        done: 0,
        total: 0,
        inProgress: false,
      });
    }
  };

  const handleDelete = (updatedFiles: File[]) => {
    setSelectedFiles(updatedFiles);
    onDelete(updatedFiles);
  };

  return (
    <>
      {conversionProgress.inProgress && (
        <ProgressBar
          done={conversionProgress.done}
          total={conversionProgress.total}
        />
      )}
      <div className="file-uploader">
        <div className="file-uploader__buttons">
          <button
            type="button"
            className="file-uploader__btn file-uploader__btn-first"
            onClick={handleTakePhoto}
          >
            {t("fileUploader.ui.takePhoto")}
          </button>
          <button
            type="button"
            className="file-uploader__btn file-uploader__btn-second"
            onClick={handleChooseFromGallery}
          >
            {t("fileUploader.ui.chooseFromGallery")}
          </button>
          {selectedFiles.length > 0 && (
            <button
              type="button"
              className="file-uploader__btn file-uploader__btn-third"
              onClick={() => setModalOpen(true)}
            >
              {t("fileUploader.ui.viewPhotos")}
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleFileChange}
        />

        {isModalOpen && (
          <Gallery
            photos={selectedFiles}
            onClose={() => setModalOpen(false)}
            onDelete={handleDelete}
            isDeletable={isDeletable}
          />
        )}
        {error && <span className="error file-error">{error.message}</span>}
      </div>
    </>
  );
};

export default FileUploader;
