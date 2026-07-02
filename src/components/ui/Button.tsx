import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] hover:brightness-110 border border-brand-500/20',
    secondary: 'bg-dark-800/80 backdrop-blur-md text-white border border-dark-700/80 hover:bg-dark-700/80 hover:border-dark-600/80 shadow-lg',
    outline: 'border border-dark-700 text-dark-200 hover:text-white hover:bg-dark-800/50 hover:border-brand-500/30',
    ghost: 'text-dark-300 hover:text-white hover:bg-dark-800/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
