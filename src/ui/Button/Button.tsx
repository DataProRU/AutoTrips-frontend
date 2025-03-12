import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

interface ButtonProps {
  text: string;
  type?: "button" | "submit"; // Only button types
  to?: string; // Link destination
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  type = "button", // Default to "button"
  to,
  onClick,
  className,
}) => {
  if (to) { // If 'to' is provided, render a Link
    return (
      <Link to={to} className={className}>
        {text}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {text}
    </button>
  );
};

export default Button;