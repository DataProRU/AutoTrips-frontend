import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './RecieverRegister.css';
import InputField from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
import { observer } from 'mobx-react';
import Checkbox from '../../ui/Checkbox/Checkbox';
import { AxiosError } from '../../models/response/AxiosError';
import authStore from '../../store/AuthStore';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../../ui/FileUploader/FileUploader';
import ConfirmModal from '../../ui/ConfirmModal/ConfirmModal';
import ImageSlider from '../../ui/ImageSlider/ImageSlider';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../ui/ProgressBar/ProgressBar';
import { isValidPhoneNumber } from 'react-phone-number-input';
import PhoneInput from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru';

const getSchema = (t: (key: string) => string) =>
  z
    .object({
      fullName: z.string().min(1, t('register.errors.fullNameRequired')),
      phoneNumber: z
        .string()
        .min(4, t('register.errors.phoneNumberRequired'))
        .refine((value) => isValidPhoneNumber(value), {
          message: t('register.errors.phoneNumberInvalid'),
        }),
      telegramLogin: z
        .string()
        .min(1, t('register.errors.telegramLoginRequired'))
        .refine((val) => !val.startsWith('@'), {
          message: t('register.errors.telegramLoginStartsWithAt'),
        }),
      identityPhotos: z
        .array(z.instanceof(File))
        .min(1, t('register.errors.photosRequired'))
        .max(10, t('register.errors.photosMaxLimit'))
        .refine(
          (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
          t('register.errors.fileSizeLimit')
        )
        .refine(
          (files) =>
            files.every((file) =>
              [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/heic',
                'image/heif',
              ].includes(file.type)
            ),
          t('register.errors.fileFormatLimit')
        ),
      password: z
        .string()
        .min(6, t('register.errors.passwordRequired'))
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
          t('register.errors.passwordComplexity')
        ),
      confirmPassword: z.string(),
      consent: z.boolean().refine((val) => val === true, {
        message: t('register.errors.consentRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('register.errors.passwordsMustMatch'),
      path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<ReturnType<typeof getSchema>>;

const RecieverRegister = () => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  authStore.page = t('register.page.pageRegisterClient');

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

  const getReceiverError = (type: string) => {
    console.log('Error type:', type);
    switch (type) {
      case 'phone_exists':
        return t('register.errors.phoneNumberExists');
      case 'telegram_exists':
        return t('register.errors.telegramExists');
      default:
        return null;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const dataTransfer = new DataTransfer();
      data.identityPhotos.forEach((file) => dataTransfer.items.add(file));
      const fileList = dataTransfer.files;

      const updatedData = {
        ...data,
        identityPhotos: fileList,
      };

      await authStore.register(updatedData);
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        const errors = axiosError.response.data;
        if (errors?.phone) {
          setError('phoneNumber', {
            type: 'manual',
            message:
              getReceiverError(errors.phone.error_type) ?? errors.phone.message,
          });
        }
        if (errors?.telegram) {
          setError('telegramLogin', {
            type: 'manual',
            message:
              getReceiverError(errors.telegram.error_type) ??
              errors.telegram.message,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (files: FileList) => {
    const fileArray = Array.from(files);
    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));

    const currentFiles = control._formValues.identityPhotos || [];
    const updatedFiles = [...currentFiles, ...fileArray];

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setValue('identityPhotos', updatedFiles, { shouldValidate: true });
  };

  const handleDeleteImage = (index: number) => {
    ConfirmModal({
      title: t('register.ui.deleteImageTitle'),
      message: t('register.ui.deleteImageMessage'),
      confirmLabel: t('common.ui.yes'),
      cancelLabel: t('common.ui.no'),
      onConfirm: () => {
        const deletedPreview = imagePreviews[index];
        URL.revokeObjectURL(deletedPreview);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(updatedPreviews);

        const currentFiles = control._formValues.identityPhotos as File[];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setValue('identityPhotos', updatedFiles, { shouldValidate: true });
      },
      onCancel: () => {},
    });
  };

  return (
    <div className="register__form">
      {isLoading && <ProgressBar />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          type="text"
          placeholder={t('register.ui.fullNamePlaceholder')}
          name="fullName"
          register={register}
          error={errors.fullName}
          className="input"
        />

        <div className="group">
          <Controller
            name="phoneNumber"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <PhoneInput
                international
                defaultCountry="RU"
                value={field.value}
                onChange={field.onChange}
                className="input phone-number"
                labels={ru}
              />
            )}
          />
          {errors.phoneNumber && <div className="error">{errors.phoneNumber.message}</div>}
        </div>

        <InputField
          type="text"
          placeholder={t('register.ui.telegramLoginPlaceholder')}
          name="telegramLogin"
          register={register}
          error={errors.telegramLogin}
          className="input"
        />

        <div className="register__group">
          <label className="register__label">
            {t('register.ui.identityPhotosLabel')}{' '}
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
                error={errors.identityPhotos}
              />
            )}
          />
        </div>

        <ImageSlider
          imagePreviews={imagePreviews}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
          onDeleteImage={handleDeleteImage}
        />

        <InputField
          type={showPassword ? 'text' : 'password'}
          placeholder={t('register.ui.passwordPlaceholder')}
          name="password"
          register={register}
          error={errors.password}
          className="input"
          showPasswordButton
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <InputField
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder={t('register.ui.confirmPasswordPlaceholder')}
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
          label={t('register.ui.consentLabel')}
        />

        <Button
          type="submit"
          text={t('register.ui.registerButton')}
          className="link"
        />
      </form>
    </div>
  );
};

export default observer(RecieverRegister);
