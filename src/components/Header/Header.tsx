import React, { useState } from "react";
import { observer } from "mobx-react";
import "./Header.css";
import LanguageStore from "../../store/LanguageStore";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import authStore from "../../store/AuthStore";

const Header: React.FC = observer(() => {
  const [isMenuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleLanguageChange = (language: string) => {
    LanguageStore.setLanguage(language);
    setMenuOpen(false);
  };

  const allLanguages = [
    { code: "ru", name: "RU" },
    { code: "en", name: "EN" },
    { code: "az", name: "AZ" },
    { code: "ge", name: "GE" },
  ];

  const availableLanguages = allLanguages.filter(
    (lang) => lang.code !== LanguageStore.selectedLanguage
  );

  return (
    <header className="menu">
      <Link to="/" className="menu__logo">
        <img src={Logo} alt="Logo" />
      </Link>
      <h2 className="menu__header">{authStore.page}</h2>
      <div className="menu__language">
        <button className="menu__burger menu__burger-selected" onClick={toggleMenu}>
          <span className="menu__language">
            {LanguageStore.selectedLanguage.toUpperCase()}
          </span>
        </button>
        <div className={`languages ${isMenuOpen ? "languages__open" : ""}`}>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className="languages__btn"
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
});

export default Header;