import { z } from "zod";
import InputField from "../../ui/Input/Input";
import "./AuthData.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import Button from "../../ui/Button/Button";
import { Context } from "../../main";
import { observer } from "mobx-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getSchema = (t: (key: string) => string) =>
  z.object({
    login: z.string().min(1, t("authData.errors.loginRequired")),
    password: z.string().min(6, t("authData.errors.passwordRequired")),
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
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(getSchema(t)),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authStore.login(data.login, data.password);
    const response = await authStore.login(data.login, data.password);
    if (response && authStore.isAuth) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="main">
        <div className="container">
          <div className="main__content">
            <h2 className="main__header">{t("authData.ui.loginTitle")}</h2>
            <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
              {authStore.errorMessage && (
                <div className="error error-password">
                  {authStore.errorMessage}
                </div>
              )}
              <InputField
                type="text"
                placeholder={t("authData.ui.loginPlaceholder")}
                name="login"
                register={register}
                error={errors.login}
                className="input"
              />
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder={t("authData.ui.passwordPlaceholder")}
                name="password"
                register={register}
                error={errors.password}
                className="input"
                showPasswordButton
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <Button
                type="submit"
                text={t("authData.ui.loginButton")}
                className="link"
              />
            </form>
            <Link to="https://t.me/GarageShop_bot" className="main__forget">
              {t("authData.ui.forgotPassword")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(AuthData);