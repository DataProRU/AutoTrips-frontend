import React, { useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import "./Header.css";
import LanguageStore from "../../store/LanguageStore";
import { Link } from "react-router-dom";

const Header: React.FC = observer(() => {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleLanguageChange = (language: string) => {
    LanguageStore.setLanguage(language);
    setMenuOpen(false);
  };

  return (
    <header className="menu">
      <Link to="/" className="menu__logo">
        {t("logo")}
      </Link>
      <div className="menu__company">{t("autotransport")}</div>
      <div className="menu__language">
        <div className="menu__burger" onClick={toggleMenu}>
          ☰
        </div>
        <div className={`languages ${isMenuOpen ? "open" : ""}`}>
          <button
            className="languages__btn"
            onClick={() => handleLanguageChange("ru")}
          >
            Русский
          </button>
          <button
            className="languages__btn"
            onClick={() => handleLanguageChange("en")}
          >
            English
          </button>
          <button
            className="languages__btn"
            onClick={() => handleLanguageChange("az")}
          >
            Azərbaycan
          </button>
          <button
            className="languages__btn"
            onClick={() => handleLanguageChange("ge")}
          >
            ქართული
          </button>
        </div>
        <div className="menu__language">{LanguageStore.selectedLanguage}</div>
      </div>
    </header>
  );
});

export default Header;
