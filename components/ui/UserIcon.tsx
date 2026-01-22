import React from 'react';
import { UserRound } from 'lucide-react';

interface UserIconProps {
  variant?: 'gold' | 'green' | 'beige' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ 
  variant = 'gold', 
  size = 'md',
  className = '' 
}) => {
  // Define color palettes for each variant
  const colorVariants = {
    gold: {
      bg: '#edbf8c',
      icon: '#10302b',
      border: '#d4a574'
    },
    green: {
      bg: '#10302b',
      icon: '#edbf8c',
      border: '#0a1f1b'
    },
    beige: {
      bg: '#ead3b9',
      icon: '#10302b',
      border: '#d9c3a9'
    },
    teal: {
      bg: '#1a4a43',
      icon: '#edbf8c',
      border: '#0f2f2a'
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 22
  };

  const colors = colorVariants[variant];

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-sm ${className}`}
      style={{
        backgroundColor: colors.bg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: colors.border
      }}
    >
      <UserRound 
        size={iconSizes[size]} 
        strokeWidth={0}
        fill={colors.icon}
        style={{ color: colors.icon }}
      />
    </div>
  );
};

export default UserIcon;
