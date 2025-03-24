import { useState, useEffect } from "react";
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
import FileUploader from "../../ui/FileUploader/FileUploader";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";

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
      .array(z.instanceof(File))
      .min(1, "Загрузите хотя бы одно фото")
      .refine(
        (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
        "Каждый файл должен быть меньше 5MB"
      )
      .refine(
        (files) =>
          files.every((file) =>
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      identityPhotos: [],
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const dataTransfer = new DataTransfer();
      data.identityPhotos.forEach((file) => dataTransfer.items.add(file));
      const fileList = dataTransfer.files;

      const updatedData = {
        ...data,
        identityPhotos: fileList,
      };

      await authStore.register(updatedData);
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

  const handleFileChange = (files: FileList) => {
    const fileArray = Array.from(files);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));

    const currentFiles = control._formValues.identityPhotos || [];
    console.log("Current files before update:", currentFiles.length);

    const updatedFiles = [...currentFiles, ...fileArray];
    console.log("New files added:", fileArray.length);
    console.log("Total files after update:", updatedFiles.length);

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setValue("identityPhotos", updatedFiles, { shouldValidate: true });
  };

  const handleDeleteImage = (index: number) => {
    ConfirmModal({
      title: "Удаление фото",
      message: "Вы уверены, что хотите удалить это фото?",
      onConfirm: () => {
        const deletedPreview = imagePreviews[index];
        URL.revokeObjectURL(deletedPreview);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updatedPreviews);

        const currentFiles = control._formValues.identityPhotos as File[];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setValue("identityPhotos", updatedFiles, { shouldValidate: true });
      },
      onCancel: () => {},
    });
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
          <Controller
            name="identityPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                onFilesSelected={(files) => {
                  handleFileChange(files); // Обработка всех файлов
                  field.onChange(control._formValues.identityPhotos);
                }}
              />
            )}
          />
          {errors.identityPhotos && (
            <span className="error error-photos">
              {errors.identityPhotos.message}
            </span>
          )}
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

        <Button type="submit" text="Зарегистрироваться" className="link" />
      </form>
    </div>
  );
};

export default observer(RegisterData);
