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

const schema = z.object({
  login: z.string().min(1, "Логин обязательно для заполнения"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

type LoginFormData = z.infer<typeof schema>;

const AuthData = () => {
  const { authStore } = useContext(Context);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
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
            <h2 className="main__header">Войдите в приложение</h2>
            <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
              {authStore.errorMessage && (
                <div className="error error-password">
                  {authStore.errorMessage}
                </div>
              )}
              <InputField
                type="text"
                placeholder="Логин/Номер телефона"
                name="login"
                register={register}
                error={errors.login}
                className="input"
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
              <Button type="submit" text={"Войти"} className="link" />
            </form>
            <Link to="#" className="main__forget">
              {t("main.forgot_password")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(AuthData);
