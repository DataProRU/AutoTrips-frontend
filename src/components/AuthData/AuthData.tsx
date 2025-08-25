import { z } from 'zod';
import InputField from '../../ui/Input/Input';
import './AuthData.css';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useState } from 'react';
import Button from '../../ui/Button/Button';
import { Context } from '../../main';
import { observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isValidPhoneNumber } from 'react-phone-number-input';
import PhoneInput from 'react-phone-number-input';
import ru from 'react-phone-number-input/locale/ru';

const getSchema = (t: (key: string) => string) =>
  z.object({
    login: z
      .string()
      .min(4, t('authData.errors.loginRequired'))
      .refine((value) => isValidPhoneNumber(value), {
        message: t('authData.errors.phoneNumberInvalid'),
      }),
    password: z.string().min(6, t('authData.errors.passwordRequired')),
  });

type LoginFormData = z.infer<ReturnType<typeof getSchema>>;

const AuthData = () => {
  const { authStore } = useContext(Context);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(getSchema(t)),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authStore.login(data.login, data.password);
    const response = await authStore.login(data.login, data.password);
    if (response && authStore.isAuth) {
      navigate('/');
    }
  };

  return (
    <>
      <div className="main">
        <div className="container">
          <div className="main__content">
            <h2 className="main__header">{t('authData.ui.loginTitle')}</h2>
            <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
              {authStore.errorMessage && (
                <div className="error error-password">
                  {authStore.errorMessage}
                </div>
              )}
              <div className="login__wrapper">
                <Controller
                  name="login"
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
                {errors.login && (
                  <div className="error">{errors.login.message}</div>
                )}
              </div>
              <InputField
                type={showPassword ? 'text' : 'password'}
                placeholder={t('authData.ui.passwordPlaceholder')}
                name="password"
                register={register}
                error={errors.password}
                className="input"
                showPasswordButton
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <Button
                type="submit"
                text={t('authData.ui.loginButton')}
                className="link"
              />
            </form>
            <Link to="https://t.me/GarageShop_bot" className="main__forget">
              {t('authData.ui.forgotPassword')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(AuthData);
