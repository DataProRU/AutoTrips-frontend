import React from "react";
import Header from "../../components/Header/Header";
import "./Regards.css"
import { useTranslation } from "react-i18next";

const Regards: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <h2 className="regards">
        {t('regards.title')}<br/>
        {t('regards.subtitle')}
      </h2>
    </>
  );
};

export default Regards;
