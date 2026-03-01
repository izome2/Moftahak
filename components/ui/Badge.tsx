import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full backdrop-blur-sm';
  
  const variantStyles = {
    primary: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
    secondary: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
    accent: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
    success: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
    warning: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
    info: 'bg-primary/80 text-secondary border border-primary/40 shadow-lg',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
