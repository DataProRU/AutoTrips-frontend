import { useState, useEffect } from "react";
import FullscreenSlider from "../FullscreenSlider/FullscreenSlider";
import "./Pictures.css";
import photosStore from "../../store/PhotosStore";
import { Link } from "react-router-dom";

interface PicturesProps {
  type: string;
  id: string;
  canBack?: boolean;
  //onClose: () => void;
}

const Pictures: React.FC<PicturesProps> = ({ type, id, canBack }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    photosStore.fetchPhotos(id, type).finally(() => setIsLoading(false));

    return () => {
      photosStore.clearPhotos();
    };
  }, [id, type]);

  if (isLoading) {
    return <div className="loading">Loading photos...</div>;
  }

  if (!photosStore.photos || photosStore.photos.length === 0) {
    return <div className="no-photos">No photos found</div>;
  }

  return (
    <div className="pictures-container">
      {selectedPhoto === null ? (
        <div className="pictures-content">
          <div className="pictures-gallery">
            {photosStore.photos.map((photo, index) => (
              <div key={photo.id} className="pictures-item">
                <img
                  src={photo.image}
                  alt={`Фото ${index + 1}`}
                  className="pictures-img"
                  onClick={() => setSelectedPhoto(index)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          {canBack && (
            <div className="pictures-footer">
              <Link to="/documents" className="link">
                Назад
              </Link>
            </div>
          )}
        </div>
      ) : (
        <FullscreenSlider
          photos={photosStore.photoUrls}
          initialSlide={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default Pictures;
