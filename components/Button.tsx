import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, children, icon, variant = 'primary', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]";

  const variantClasses = {
    primary: "text-white bg-deep-teal hover:bg-teal-hover focus:ring-deep-teal disabled:bg-gray-300 disabled:text-gray-500 shadow-sm hover:shadow-md",
    secondary: "text-rich-black bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 focus:ring-deep-teal disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200",
    outline: "text-deep-teal bg-transparent hover:bg-teal-light border-2 border-deep-teal hover:border-teal-hover focus:ring-deep-teal disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${props.className || ''}`}
    >
      {isLoading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        <>
          {icon && <span className="mr-2 -ml-1">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
