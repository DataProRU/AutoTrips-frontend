import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "./ConfirmModal.css";


interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  confirmAlert({
    title,
    message,
    buttons: [
      {
        label: "Да",
        onClick: onConfirm,
      },
      {
        label: "Нет",
        onClick: onCancel || (() => {}),
      },
    ],
  });
};

export default ConfirmModal;