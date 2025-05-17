import { observer } from "mobx-react";
import DatePicker from "react-datepicker";
import "./DatePicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { ru, az, enGB, ka, Locale } from "date-fns/locale";
import LanguageStore from "../../store/LanguageStore";
import { useState, useEffect } from "react";

type LanguageCode = "ru" | "az" | "en" | "ge";

const locales: Record<LanguageCode, Locale> = {
  ru,
  az,
  en: enGB,
  ge: ka,
};

const CustomDatePicker = observer(
  ({ value, onChange, placeholderText, required = false, error, ...props }) => {
    const currentLanguage = LanguageStore.selectedLanguage as LanguageCode;
    const [isFocused, setIsFocused] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
      setIsEmpty(!value);
    }, [value]);

    return (
      <div className="input-container datepicker-container">
        <DatePicker
          selected={value}
          onChange={(date) => {
            onChange(date);
            setIsEmpty(!date);
          }}
          locale={locales[currentLanguage]}
          dateFormat="dd.MM.yyyy"
          placeholderText=""
          className="custom-datepicker-input"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {error && <div className={`error`}>{error.message}</div>}

        <span
          className={`placeholder ${!isEmpty || isFocused ? "hidden" : ""}`}
        >
          {placeholderText} {required && <span className="required">*</span>}
        </span>
      </div>
    );
  }
);

export default CustomDatePicker;
