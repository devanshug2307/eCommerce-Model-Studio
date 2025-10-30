import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, children, icon, variant = 'primary', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed transition-all duration-200";

  const variantClasses = {
    primary: "text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:ring-purple-500 disabled:from-purple-400/50 disabled:to-pink-400/50 shadow-lg shadow-purple-500/25",
    secondary: "text-gray-300 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 focus:ring-purple-500 disabled:bg-white/5",
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