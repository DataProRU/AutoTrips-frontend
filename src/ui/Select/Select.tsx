// src/ui/Select/Select.tsx
import { Controller } from "react-hook-form";
import Select from "react-select";
import "./Select.css";

interface CustomSelectProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  options: { value: string; label: string }[];
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

const CustomSelect = ({
  name,
  control,
  options,
  placeholder = "Выберите значение",
  isClearable = true,
  isSearchable = true,
  className,
  error,
}: CustomSelectProps) => {
  return (
    <div className={`form-group ${className || ""}`}>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            placeholder={placeholder}
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable={isClearable}
            isSearchable={isSearchable}
            onChange={(selectedOption) =>
              field.onChange(selectedOption?.value || "")
            }
            value={options.find((option) => option.value === field.value) || null}
          />
        )}
      />
      {error && <span className="error">{error.message}</span>}
    </div>
  );
};

export default CustomSelect;