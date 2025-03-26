import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./FullscreenSlider.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Swipe from "../../assets/swiper/swipe.svg";
import Close from "../../assets/modals/close.svg";

interface FullscreenSliderProps {
  photos: File[];
  initialSlide: number;
  onClose: () => void;
}

const FullscreenSlider: React.FC<FullscreenSliderProps> = ({
  photos,
  initialSlide,
  onClose,
}) => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    initialSlide: initialSlide,
    nextArrow: (
      <button className="arrow next" style={{ right: "10px" }}>
        <img src={Swipe} alt="Следующий слайд" />
      </button>
    ),
    prevArrow: (
      <button className="arrow prev" style={{ left: "10px" }}>
        <img src={Swipe} alt="Предыдущий слайд" />
      </button>
    ),
  };

  return (
    <div className="fullscreen-slider">
      <Slider {...sliderSettings} className="fullscreen-slick-slider">
        {photos.map((file, index) => (
          <div key={index} className="slick-slide">
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={5}
              wheel={{ step: 0.1 }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100vw",
                  height: "100vh",
                }}
                contentStyle={{
                  width: "100vw",
                  height: "100vh",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Фото ${index + 1}`}
                  className="fullscreen-img"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        ))}
      </Slider>

      <button className="close-fullscreen-btn" onClick={onClose}>
        <img src={Close} alt="Закрыть" />
      </button>
    </div>
  );
};

export default FullscreenSlider;
