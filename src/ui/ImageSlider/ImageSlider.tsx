import Slider from "react-slick";
import DeletePicture from "../../assets/swiper/delete.svg";
import Swipe from "../../assets/swiper/swipe.svg";
import Pagination from "../../ui/Pagination/Pagination";
import "./ImageSlider.css";
import SwiperPreview from "../../assets/swiper/swiper-preview.svg";

interface ImageSliderProps {
  imagePreviews: string[];
  currentSlide: number;
  onSlideChange: (slide: number) => void;
  onDeleteImage: (index: number) => void;
  isDeletable?: boolean;
  onImageClick?: (index: number) => void;
}

const ImageSlider = ({
  imagePreviews,
  currentSlide,
  onSlideChange,
  onDeleteImage,
  isDeletable = true,
  onImageClick,
}: ImageSliderProps) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: (
      <button className="arrow next">
        <img src={Swipe} alt="Следующий слайд" />
      </button>
    ),
    prevArrow: (
      <button className="arrow prev">
        <img src={Swipe} alt="Предыдущий слайд" />
      </button>
    ),
  };

  return (
    <div className="image-slider">
      {imagePreviews.length > 0 ? (
        <>
          <Slider {...settings} afterChange={onSlideChange}>
            {imagePreviews.map((src, index) => (
              <div key={index} className="slide-container">
                <img
                  src={src}
                  alt={`preview ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onClick={() => {
                    console.log("Image clicked", index);
                    onImageClick?.(index);
                  }}
                />
                {isDeletable && (
                  <button
                    type="button"
                    className="slider__delete"
                    onClick={() => onDeleteImage(index)}
                  >
                    <img src={DeletePicture} alt="Картинка удаления" />
                  </button>
                )}
              </div>
            ))}
          </Slider>
          <Pagination
            currentSlide={currentSlide}
            totalSlides={imagePreviews.length}
          />
        </>
      ) : (
        <div className="slider__empty">
          <img src={SwiperPreview} alt="Превью слайдера" />
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
