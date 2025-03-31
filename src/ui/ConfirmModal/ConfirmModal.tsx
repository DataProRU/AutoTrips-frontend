import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "./ConfirmModal.css";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;  
}

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Да", // Значение по умолчанию 
  cancelLabel = "Нет",  
}: ConfirmModalProps) => {
  confirmAlert({
    title,
    message,
    buttons: [
      {
        label: confirmLabel,
        onClick: () => {
          setTimeout(onConfirm, 100);
        },
      },
      {
        label: cancelLabel,
        onClick: () => {
          onCancel?.();
        },
      },
    ],
    closeOnEscape: true,
    closeOnClickOutside: true,
    willUnmount: () => {
      onCancel?.();
    },
  });
};

export default ConfirmModal;