import { makeAutoObservable } from "mobx";
import i18n from "../setup/i18next";

class LanguageStore {
  selectedLanguage: string = "ru";

  constructor() {
    makeAutoObservable(this);
  }

  setLanguage(language: string) {
    this.selectedLanguage = language;
    i18n.changeLanguage(language);
    localStorage.setItem("selectedLanguage", language);
  }
}

export default new LanguageStore();
