import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

interface MessageBoxProps {
  title: string;
  message: string;
  onClose?: () => void;
  buttonText?: string;
}

const MessageBox = ({
  title,
  message,
  onClose,
  buttonText = "OK",
}: MessageBoxProps) => {
  confirmAlert({
    title,
    message,
    buttons: [
      {
        label: buttonText,
        onClick: () => {
          setTimeout(() => onClose?.(), 100);
        },
      },
    ],
    closeOnEscape: true,
    closeOnClickOutside: true,
    willUnmount: () => {
      onClose?.();
    },
  });
};

export default MessageBox;