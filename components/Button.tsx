import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, children, icon, variant = 'primary', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed transition-all duration-200";
  
  const variantClasses = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400/50",
    secondary: "text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 focus:ring-blue-500 disabled:bg-blue-500/5",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${props.className}`}
    >
      {isLoading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        <>
          {icon && <span className="mr-2 -ml-1 h-5 w-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;