import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    leftIcon, 
    rightIcon, 
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-primary text-secondary hover:bg-primary/90 shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95',
      secondary: 'bg-secondary text-primary hover:bg-secondary/90 shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-secondary hover:scale-105 active:scale-95',
      ghost: 'text-primary hover:bg-primary/10 hover:scale-105 active:scale-95',
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
