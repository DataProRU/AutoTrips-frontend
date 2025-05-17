import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

interface ButtonProps {
  text: string;
  type?: "button" | "submit";
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  type = "button",
  to,
  onClick,
  className,
  disabled = false,
}) => {
  if (to) {
    return (
      <Link to={to} className={className}>
        {text}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
