import React, { useEffect, useState } from "react";
import {
  FieldError,
  Merge,
  FieldErrorsImpl,
  UseFormRegister,
} from "react-hook-form";
import "./Input.css";
import HidePassword from "../../assets/input/hide-password.svg";
import ShowPassword from "../../assets/input/show-password.svg";

interface InputFieldProps {
  type: string;
  placeholder?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<FormData>> | undefined;
  label?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  showPasswordButton?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
  required?: boolean;
  value?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  name,
  register,
  error,
  label,
  multiple,
  onChange,
  showPasswordButton = false,
  onTogglePassword,
  className,
  disabled = false,
  required = true,
  value = "",
}) => {
  const isIdentityPhotos = name === "identityPhotos";
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
    setIsEmpty(!value);
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (type === "tel") {
      inputValue = formatPhoneNumber(inputValue);
    }
    setInternalValue(inputValue);
    setIsEmpty(inputValue === "");

    onChange?.(e);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = "+";

    if (digits.length > 0) formatted += digits.substring(0, 3);
    if (digits.length > 3) formatted += "" + digits.substring(3, 6);
    if (digits.length > 6) formatted += "" + digits.substring(6, 9);
    if (digits.length > 9) formatted += "" + digits.substring(9, 12);
    if (digits.length > 12) formatted += "" + digits.substring(12, 14);

    return formatted;
  };

  return (
    <div className={`group ${isIdentityPhotos ? "group-photos" : ""}`}>
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          type={type === "tel" ? "text" : type}
          placeholder=""
          {...register(name)}
          value={internalValue}
          multiple={multiple}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={handleInput}
          className={className}
          disabled={disabled}
        />

        {error && <div className={`error`}>{error.message}</div>}

        <span
          className={`placeholder ${!isEmpty || isFocused ? "hidden" : ""}`}
        >
          {placeholder} {required && <span className="required">*</span>}
        </span>
        {showPasswordButton && (
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
          >
            {type === "password" ? (
              <img src={HidePassword} alt="Показать пароль" />
            ) : (
              <img src={ShowPassword} alt="Скрыть пароль" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
