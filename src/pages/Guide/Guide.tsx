import { z } from "zod";
import Header from "../../components/Header/Header";
import authStore from "../../store/AuthStore";
import Checkbox from "../../ui/Checkbox/Checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./Guide.css";
import Button from "../../ui/Button/Button";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  consent: z.boolean().refine((val) => val === true, {
    message: "Необходимо подтвердить ознакомление",
  }),
});

type GuideFormData = z.infer<typeof schema>;

const Guide = () => {
  authStore.page = "";

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuideFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: GuideFormData) => {
    await authStore.onboard();
    await navigate("/");
    console.log(data);
  };

  return (
    <>
      <Header />
      <form className="guide" onSubmit={handleSubmit(onSubmit)}>
        <p className="guide__text">
          Ваша заявка принята! Ознаĸомьтесь, пожалуйста, с видео инструĸцией по
          использованию данного приложения
        </p>
        <div className="guide__video">ЗДЕСЬ БУДЕТ ВИДЕО</div>
        <Checkbox
          name="consent"
          register={register}
          error={errors.consent}
          label="Я ознакомлен(а)"
        />
        <Button type="submit" text="Войти" className="link" />
      </form>
    </>
  );
};

export default Guide;
