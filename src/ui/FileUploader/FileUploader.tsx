import { useRef } from "react";
import "./FileUploader.css";

interface FileUploaderProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploader = ({ onFilesSelected }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFilesSelected(e.target.files);
    }
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
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploader;