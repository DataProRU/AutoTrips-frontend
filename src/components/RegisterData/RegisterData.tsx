import { useState, useRef, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Slider from "react-slick";
import "./RegisterData.css";
import InputField from "../../ui/Input/Input";
import Button from "../../ui/Button/Button";
import SwiperPreview from "../../assets/swiper/swiper-preview.svg";
import Swipe from "../../assets/swiper/swipe.svg";
import Pagination from "../../ui/Pagination/Pagination";
import { observer } from "mobx-react";
import Checkbox from "../../ui/Checkbox/Checkbox";
import DeletePicture from "../../assets/swiper/delete.svg";
import { Context } from "../../main";

const schema = z
  .object({
    fullName: z.string().min(1, "ФИО обязательно для заполнения"),
    phoneNumber: z
      .string()
      .min(1, "Номер телефона обязателен для заполнения")
      .regex(/^\+?[0-9]{10,15}$/, "Номер телефона должен быть действительным"),
    telegramLogin: z
      .string()
      .min(1, "Логин Telegram обязателен для заполнения"),
    identityPhotos: z
      .any()
      .refine(
        (files) => files && files.length > 0,
        "Загрузите хотя бы одно фото"
      )
      .refine(
        (files) =>
          Array.from<File>(files).every((file) => file.size <= 5 * 1024 * 1024),
        "Каждый файл должен быть меньше 5MB"
      )
      .refine(
        (files) =>
          Array.from<File>(files).every((file) =>
            ["image/jpeg", "image/png", "image/gif"].includes(file.type)
          ),
        "Поддерживаются только форматы JPEG, PNG и GIF"
      ),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string(),
    consent: z.boolean().refine((val) => val === true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли должны совпадать",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof schema>;

const RegisterData = () => {
  // authStore.page = "Регистрация";
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identityPhotos: undefined,
    },
  });

  const { authStore } = useContext(Context);


  const onSubmit = (data: RegisterFormData) => {
    authStore.register(data);
  };
  
  const handleTakePhoto = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context && videoRef.current) {
            context.drawImage(
              videoRef.current,
              0,
              0,
              canvas.width,
              canvas.height
            );
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], "photo.jpg", {
                  type: "image/jpeg",
                });

                const currentFiles = control._formValues.identityPhotos || [];
                const dataTransfer = new DataTransfer();

                if (Array.isArray(currentFiles)) {
                  currentFiles.forEach((file) => dataTransfer.items.add(file));
                } else if (currentFiles instanceof FileList) {
                  Array.from(currentFiles).forEach((file) =>
                    dataTransfer.items.add(file)
                  );
                }

                dataTransfer.items.add(file);
                const fileList = dataTransfer.files;

                setValue("identityPhotos", fileList);

                handleFileChange(fileList);
              }
            });
          }
        }
        stream.getTracks().forEach((track) => track.stop());
      }, 1000);
    }
  };

  const handleFileChange = (files: FileList | File[]) => {
    const fileArray = Array.from<File>(files);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);

    const currentFiles = control._formValues.identityPhotos || [];
    const updatedFiles = Array.from<File>(currentFiles).filter(
      (_, i) => i !== index
    );

    const dataTransfer = new DataTransfer();
    updatedFiles.forEach((file) => dataTransfer.items.add(file));
    const fileList = dataTransfer.files;

    setValue("identityPhotos", fileList);
  };

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
    <div className="register__form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          type="text"
          placeholder="ФИО"
          name="fullName"
          register={register}
          error={errors.fullName}
          className="input"
        />

        <InputField
          type="text"
          placeholder="Номер телефона"
          name="phoneNumber"
          register={register}
          error={errors.phoneNumber}
          className="input"
        />

        <InputField
          type="text"
          placeholder="Логин Telegram"
          name="telegramLogin"
          register={register}
          error={errors.telegramLogin}
          className="input"
        />

        <div className="register__group">
          <label className="register__label">
            Фото для подтверждения личности{" "}
            <span className="register__label-required">*</span>
          </label>
          <div className="register__buttons">
            <button
              type="button"
              className="register__btn register__btn-first"
              onClick={handleTakePhoto}
            >
              Сделать фото
            </button>
            <button
              type="button"
              className="register__btn register__btn-second"
              onClick={() => {
                const fileInput = document.querySelector(
                  'input[type="file"]'
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                }
              }}
            >
              Выбрать из галереи
            </button>
            <Controller
              name="identityPhotos"
              control={control}
              defaultValue={undefined}
              render={({ field }) => (
                <InputField
                  type="file"
                  name="identityPhotos"
                  className="register__photos"
                  register={register}
                  error={errors.identityPhotos}
                  multiple
                  onChange={(e) => {
                    const newFiles = e.target.files ? e.target.files : [];

                    const currentFiles =
                      control._formValues.identityPhotos || [];

                    const dataTransfer = new DataTransfer();

                    if (Array.isArray(currentFiles)) {
                      currentFiles.forEach((file) =>
                        dataTransfer.items.add(file)
                      );
                    } else if (currentFiles instanceof FileList) {
                      Array.from(currentFiles).forEach((file) =>
                        dataTransfer.items.add(file)
                      );
                    }
                    Array.from(newFiles).forEach((file) =>
                      dataTransfer.items.add(file)
                    );

                    const fileList = dataTransfer.files;

                    field.onChange(fileList);
                    handleFileChange(fileList);
                  }}
                />
              )}
            />
          </div>
          <video ref={videoRef} style={{ display: "none" }} />
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            width={640}
            height={480}
          />
        </div>
        <div className="register__swiper">
          {imagePreviews.length > 0 ? (
            <>
              <Slider
                {...settings}
                afterChange={(current: number) => setCurrentSlide(current)}
              >
                {imagePreviews.map((src, index) => (
                  <div key={index} className="slide-container">
                    <img
                      src={src}
                      alt={`preview ${index}`}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
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
              </Slider>
              <Pagination
                currentSlide={currentSlide}
                totalSlides={imagePreviews.length}
              />
            </>
          ) : (
            <div className="register__slider">
              <img src={SwiperPreview} alt="Превью слайдера" />
            </div>
          )}
        </div>

        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Пароль для входа в приложение"
          name="password"
          register={register}
          error={errors.password}
          className="input"
          showPasswordButton
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <InputField
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Повторите пароль"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword}
          className="input"
          showPasswordButton
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <Checkbox
          name="consent"
          register={register}
          error={errors.consent}
          label="Согласие на обработку персональных данных"
        />

        <Button type="submit" text={"Зарегистрироваться"} className="link" />
      </form>
    </div>
  );
};

export default observer(RegisterData);
