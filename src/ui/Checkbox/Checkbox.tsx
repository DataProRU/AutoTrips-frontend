import React from "react";
import "./Checkbox.css";
import { FieldError, FieldErrorsImpl, Merge, UseFormRegister } from "react-hook-form";

interface CheckboxProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<FormData>> | undefined;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  register,
  error,
  label,
}) => {
  return (
    <div className="checkbox-group">
      <label className="checkbox-container">
        <input type="checkbox" {...register(name)} className="checkbox-input" />
        <span className="checkmark"></span>
        {label}
      </label>
      {error && <p className="error error-checkbox">{error.message}</p>}
    </div>
  );
};

export default Checkbox;
