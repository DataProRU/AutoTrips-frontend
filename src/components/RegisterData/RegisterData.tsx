import { useState, useRef, useEffect } from "react";
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
import { AxiosError } from "../../models/response/AxiosError";
import authStore from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";

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
    password: z
      .string()
      .min(6, "Мин. 6 символов")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол"
      ),
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      identityPhotos: [],
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authStore.register(data);
      navigate("/regards");
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 400) {
        const errors = axiosError.response.data;

        if (errors?.phone) {
          setError("phoneNumber", {
            type: "manual",
            message: errors.phone[0],
          });
        }

        if (errors?.telegram) {
          setError("telegramLogin", {
            type: "manual",
            message: errors.telegram[0],
          });
        }
      }
    }
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (files: FileList | File[]) => {
    const fileArray = Array.from<File>(files);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDeleteImage = (index: number) => {
    const deletedPreview = imagePreviews[index];
    URL.revokeObjectURL(deletedPreview);
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
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute("capture");
                  fileInputRef.current.click();
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
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
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
                    handleFileChange(Array.from(newFiles));
                  }}
                />
              )}
            />
          </div>
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
