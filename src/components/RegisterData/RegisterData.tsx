// RegisterData.tsx
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./RegisterData.css";
import InputField from "../../ui/Input/Input";
import Button from "../../ui/Button/Button";
import { observer } from "mobx-react";
import Checkbox from "../../ui/Checkbox/Checkbox";
import { AxiosError } from "../../models/response/AxiosError";
import authStore from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";
import FileUploader from "../../ui/FileUploader/FileUploader";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import ImageSlider from "../../ui/ImageSlider/ImageSlider";

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
      navigate("/");
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
    const updatedFiles = [...currentFiles, ...fileArray];

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
                  handleFileChange(files);
                  field.onChange(control._formValues.identityPhotos);
                }}
                onDelete={() => {}}
                isDeletable={false}
              />
            )}
          />
          {errors.identityPhotos && (
            <span className="error error-photos">
              {errors.identityPhotos.message}
            </span>
          )}
        </div>

        <ImageSlider
          imagePreviews={imagePreviews}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
          onDeleteImage={handleDeleteImage}
        />

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