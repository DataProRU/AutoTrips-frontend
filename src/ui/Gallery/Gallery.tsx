import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./Gallery.css";
import FullscreenSlider from "../FullscreenSlider/FullscreenSlider.tsx";
import DeletePicture from "../../assets/swiper/delete.svg";
import Button from "../Button/Button.tsx";

interface GalleryProps {
  photos: File[];
  onClose: () => void;
  onDelete: (updatedPhotos: File[]) => void;
}

const Gallery: React.FC<GalleryProps> = ({ photos, onClose, onDelete }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<File[]>(photos);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDeleteImage = (index: number) => {
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    setCurrentPhotos(updatedPhotos);
    onDelete(updatedPhotos);
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      {selectedPhoto === null ? (
        <div className="modal-gallery">
          {photos.map((file, index) => (
            <div key={index} className="gallery-item">
              <img
                src={URL.createObjectURL(file)}
                alt={`Фото ${index + 1}`}
                className="gallery-img"
                onClick={() => setSelectedPhoto(index)}
              />
              <button
                type="button"
                className="register__delete"
                onClick={() => handleDeleteImage(index)}
              >
                <img src={DeletePicture} alt="Картинка удаления" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <FullscreenSlider
          photos={photos}
          initialSlide={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      <Button
        type="button"
        text="Вернуться назад"
        className="link gallery__btn"
        onClick={onClose}
      />
    </Modal>
  );
};

export default Gallery;
