import React, { useState } from "react";
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
  register: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<FormData>> | undefined;
  label?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  showPasswordButton?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
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
}) => {
  const isIdentityPhotos = name === "identityPhotos";
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmpty(e.target.value === "");
    onChange?.(e);
  };

  return (
    <div className={`group ${isIdentityPhotos ? "group-photos" : ""}`}>
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          type={type}
          placeholder=""
          {...register(name)}
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
          {placeholder} <span className="required">*</span>
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
