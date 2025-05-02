import React, { useState, useEffect } from "react";
import "./Checkbox.css";
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from "react-hook-form";
import Modal from "react-modal";
import { t } from "i18next";
import Button from "../Button/Button";

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
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const { onChange, ...restRegister } = register(name);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isAgreementOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAgreementOpen]);

  const handleLabelClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAgreementOpen(true);
  };

  const handleAgree = () => {
    setIsChecked(true);
    onChange({ target: { name, type: "checkbox", checked: true } });
    setIsAgreementOpen(false);
  };

  const handleDisagree = () => {
    setIsAgreementOpen(false);
  };

  return (
    <div className="checkbox-group">
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            onChange(e);
          }}
          {...restRegister}
          className="checkbox-input"
          id={`checkbox-${name}`}
        />
        <span className="checkmark"></span>
        <span className="checkbox-text" onClick={handleLabelClick}>
          {label}
        </span>
      </label>
      {error && <p className="error error-checkbox">{error.message}</p>}

      <Modal
        isOpen={isAgreementOpen}
        onRequestClose={handleDisagree}
        className="agreement-modal"
        overlayClassName="agreement-modal-overlay"
        ariaHideApp={false}
      >
        <div className="agreement-modal-container">
          <div className="agreement-modal-header">
            <h2 className="agreement-modal-heading">
              {t("register.ui.consentLabel")}
            </h2>
          </div>

          <div className="agreement-modal-content">
            <p
              className="agreement-modal-text"
              dangerouslySetInnerHTML={{
                __html: t("register.ui.agreementText"),
              }}
            />
          </div>

          <div className="agreement-modal-footer">
            <Button
              type="button"
              text={t("common.ui.yes")}
              className="link agreement-yes"
              onClick={handleAgree}
            />
            <Button
              type="button"
              text={t("common.ui.no")}
              className="link warning"
              onClick={handleDisagree}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checkbox;
