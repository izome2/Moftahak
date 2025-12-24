import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  onClick,
  style 
}) => {
  const baseStyles = 'bg-white border border-accent transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' : '';
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
  };
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} rounded-2xl shadow-lg ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
