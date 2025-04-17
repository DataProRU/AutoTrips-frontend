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
import { useTranslation } from "react-i18next";

const getSchema = (t: (key: string) => string) =>
  z
    .object({
      fullName: z.string().min(1, t("registerData.errors.fullNameRequired")),
      phoneNumber: z
        .string()
        .min(1, t("registerData.errors.phoneNumberRequired"))
        .regex(
          /^\+?[0-9]{10,15}$/,
          t("registerData.errors.phoneNumberInvalid")
        ),
      telegramLogin: z
        .string()
        .min(1, t("registerData.errors.telegramLoginRequired")),
      identityPhotos: z
        .array(z.instanceof(File))
        .min(1, t("registerData.errors.photosRequired"))
        .refine(
          (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
          t("registerData.errors.fileSizeLimit")
        )
        .refine(
          (files) =>
            files.every((file) =>
              ["image/jpeg", "image/png", "image/gif", "image/heic", "image/heif"].includes(file.type)
            ),
          t("registerData.errors.fileFormatLimit")
        ),
      password: z
        .string()
        .min(6, t("registerData.errors.passwordRequired"))
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
          t("registerData.errors.passwordComplexity")
        ),
      confirmPassword: z.string(),
      consent: z.boolean().refine((val) => val === true, {
        message: t("registerData.errors.consentRequired"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("registerData.errors.passwordsMustMatch"),
      path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<ReturnType<typeof getSchema>>;

const RegisterData = () => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    resolver: zodResolver(getSchema(t)),
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
      title: t("registerData.ui.deleteImageTitle"),
      message: t("registerData.ui.deleteImageMessage"),
      confirmLabel: t("common.ui.yes"),
      cancelLabel: t("common.ui.no"),
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
          placeholder={t("registerData.ui.fullNamePlaceholder")}
          name="fullName"
          register={register}
          error={errors.fullName}
          className="input"
        />

        <InputField
          type="text"
          placeholder={t("registerData.ui.phoneNumberPlaceholder")}
          name="phoneNumber"
          register={register}
          error={errors.phoneNumber}
          className="input"
        />

        <InputField
          type="text"
          placeholder={t("registerData.ui.telegramLoginPlaceholder")}
          name="telegramLogin"
          register={register}
          error={errors.telegramLogin}
          className="input"
        />

        <div className="register__group">
          <label className="register__label">
            {t("registerData.ui.identityPhotosLabel")}{" "}
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
          placeholder={t("registerData.ui.passwordPlaceholder")}
          name="password"
          register={register}
          error={errors.password}
          className="input"
          showPasswordButton
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <InputField
          type={showConfirmPassword ? "text" : "password"}
          placeholder={t("registerData.ui.confirmPasswordPlaceholder")}
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
          label={t("registerData.ui.consentLabel")}
        />

        <Button
          type="submit"
          text={t("registerData.ui.registerButton")}
          className="link"
        />
      </form>
    </div>
  );
};

export default observer(RegisterData);
