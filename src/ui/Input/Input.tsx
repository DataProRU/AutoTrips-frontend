import React from "react";
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
}) => {
  const isIdentityPhotos = name === "identityPhotos";

  return (
    <div className={`group ${isIdentityPhotos ? "group-photos" : ""}`}>
      {label && <label>{label}</label>}
      <div className="input-container">
        <input
          type={type}
          placeholder=""
          {...register(name)}
          multiple={multiple}
          onChange={onChange}
          className={className}
        />
        <span className="placeholder">
          {placeholder} <span className="required">*</span>
        </span>
        {showPasswordButton && (
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
          >
            {type === "password" ? 
            <img src={HidePassword} alt="Показать пароль" /> : <img src={ShowPassword} alt="Скрыть пароль" />}
          </button>
        )}
      </div>
      {error && (
        <p className={`error ${isIdentityPhotos ? "error-photos" : ""}`}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default InputField;
