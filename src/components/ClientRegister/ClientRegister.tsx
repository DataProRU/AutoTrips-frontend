import { observer } from 'mobx-react';
import './ClientRegister.css';
import InputField from '../../ui/Input/Input';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Checkbox from '../../ui/Checkbox/Checkbox';
import Button from '../../ui/Button/Button';
import authStore from '../../store/AuthStore';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from '../../models/response/AxiosError';
import { isValidPhoneNumber } from 'react-phone-number-input';
import PhoneInput from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru';
import ProgressBar from '../../ui/ProgressBar/ProgressBar';

const getSchema = (t: (key: string) => string) =>
  z
    .object({
      fullName: z.string().min(1, t('register.errors.fullNameRequired')),
      company: z.string().optional(),
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
      address: z.string().min(1, t('register.errors.addressRequired')),
      email: z
        .string()
        .email(t('register.errors.emailInvalid'))
        .optional()
        .or(z.literal('')),
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

const ClientRegister = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getSchema(t)),
  });

  const getClientError = (type: string) => {
    console.log('Error type:', type);
    switch (type) {
      case 'phone_exists':
        return t('register.errors.phoneNumberExists');
      case 'telegram_exists':
        return t('register.errors.telegramExists');
      case 'email_exists':
        return t('register.errors.emailExists');
      default:
        return null;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        company: data.company || '',
        email: data.email || '',
      };

      await authStore.registerClient(payload);
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        const errors = axiosError.response.data;
        if (errors?.phone) {
          setError('phoneNumber', {
            type: 'manual',
            message:
              getClientError(errors.phone.error_type) ??
              errors.phone.message,
          });
        }
        if (errors?.telegram) {
          setError('telegramLogin', {
            type: 'manual',
            message:
              getClientError(errors.telegram.error_type) ??
              errors.telegram.message,
          });
        }
        if (errors?.email) {
          setError('email', {
            type: 'manual',
            message:
              getClientError(errors.email.error_type) ?? errors.email.message,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="register__form">
        <h2 className="register__title">Клиент</h2>
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

          <InputField
            type="text"
            placeholder={t('register.ui.companyPlaceholder')}
            name="company"
            register={register}
            error={errors.company}
            className="input"
            required={false}
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
            {errors.phoneNumber && (
              <div className="error">{errors.phoneNumber.message}</div>
            )}
          </div>

          <InputField
            type="text"
            placeholder={t('register.ui.telegramLoginPlaceholder')}
            name="telegramLogin"
            register={register}
            error={errors.telegramLogin}
            className="input"
          />

          <InputField
            type="text"
            placeholder={t('register.ui.addressPlaceholder')}
            name="address"
            register={register}
            error={errors.address}
            className="input"
          />

          <InputField
            type="email"
            placeholder={t('register.ui.emailPlaceholder')}
            name="email"
            register={register}
            error={errors.email}
            className="input"
            required={false}
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
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
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
    </>
  );
};

export default observer(ClientRegister);
