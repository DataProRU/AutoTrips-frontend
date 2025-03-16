import { z } from "zod";
import InputField from "../../ui/Input/Input";
import "./AuthData.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import Button from "../../ui/Button/Button";
import { Context } from "../../main";

const schema = z.object({
  login: z.string().min(1, "Логин обязательно для заполнения"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

type LoginFormData = z.infer<typeof schema>;

const AuthData = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { authStore } = useContext(Context);

  const onSubmit = (data: LoginFormData) => {
    authStore.login(data.login, data.password);
  };

  return (
    <>
      <div className="main">
        <div className="container">
          <div className="main__content">
            <h2 className="main__header">Войдите в приложение</h2>
            <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthData;
