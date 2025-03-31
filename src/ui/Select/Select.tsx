import { Controller } from "react-hook-form";
import Select from "react-select";
import "./Select.css";
import { useTranslation } from "react-i18next";

interface CustomSelectProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: any;
  options: { value: string; label: string }[];
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  disabled?: boolean;
}

const CustomSelect = ({
  name,
  control,
  options,
  placeholder,
  isClearable = true,
  isSearchable = true,
  className,
  error,
  disabled = false,
}: CustomSelectProps) => {
  const { t } = useTranslation();

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
            placeholder={placeholder || t("select.ui.defaultPlaceholder")}
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable={isClearable}
            isSearchable={isSearchable}
            onChange={(selectedOption) =>
              field.onChange(selectedOption?.value || "")
            }
            value={options.find((option) => option.value === field.value) || null}
            isDisabled={disabled}
          />
        )}
      />
      {error && <span className="error">{error.message}</span>}
    </div>
  );
};

export default CustomSelect;