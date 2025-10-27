import { z } from 'zod';
import Header from '../../components/Header/Header';
import authStore from '../../store/AuthStore';
import Checkbox from '../../ui/Checkbox/Checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import './Guide.css';
import Button from '../../ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const getSchema = (t: (key: string) => string) =>
  z.object({
    consent: z.boolean().refine((val) => val === true, {
      message: t('guide.errors.consentRequired'),
    }),
  });

type GuideFormData = z.infer<ReturnType<typeof getSchema>>;

const Guide = () => {
  const { t } = useTranslation();
  authStore.page = '';

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuideFormData>({
    resolver: zodResolver(getSchema(t)),
  });

  const onSubmit = async (data: GuideFormData) => {
    await authStore.onboard();
    await navigate('/');
    console.log(data);
  };

  return (
    <>
      <Header />
      <form className="guide" onSubmit={handleSubmit(onSubmit)}>
        <p className="guide__text">{t('guide.ui.introText')}</p>
        <div className="guide__video">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/jEn3to9HmhY?si=Kn0bxbQ6dOOtqdHC"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <Checkbox
          name="consent"
          register={register}
          error={errors.consent}
          label={t('guide.ui.consentLabel')}
        />
        <Button
          type="submit"
          text={t('guide.ui.submitButton')}
          className="link"
        />
      </form>
    </>
  );
};

export default Guide;
