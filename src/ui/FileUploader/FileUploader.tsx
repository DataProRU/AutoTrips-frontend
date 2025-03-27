import React, { useRef, useState } from "react";
import "./FileUploader.css";
import Gallery from "../Gallery/Gallery";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
  onDelete: (updatedFiles: File[]) => void;
  isDeletable?: boolean;
}

const FileUploader = ({
  onFilesSelected,
  onDelete,
  isDeletable = true,
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
      onFilesSelected(e.target.files);
    }
  };

  const handleDelete = (updatedFiles: File[]) => {
    setSelectedFiles(updatedFiles);
    onDelete(updatedFiles);
  };

  return (
    <div className="file-uploader">
      <div className="file-uploader__buttons">
        <button
          type="button"
          className="file-uploader__btn file-uploader__btn-first"
          onClick={handleTakePhoto}
        >
          Сделать фото
        </button>
        <button
          type="button"
          className="file-uploader__btn file-uploader__btn-second"
          onClick={handleChooseFromGallery}
        >
          Выбрать из галереи
        </button>
        {selectedFiles.length > 0 && (
          <button
            type="button"
            className="file-uploader__btn file-uploader__btn-third"
            onClick={() => setModalOpen(true)}
          >
            Посмотреть фото
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
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
    </div>
  );
};

export default FileUploader;
