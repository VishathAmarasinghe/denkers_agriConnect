import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  textClassName = '',
  icon,
  iconPosition = 'left',
}) => {
  const getButtonClasses = (): string => {
    const baseClasses = 'flex-row items-center justify-center rounded-lg';
    const sizeClasses = {
      small: 'px-3 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4',
    };
    const widthClasses = fullWidth ? 'w-full' : '';

    const variantClasses = {
      primary: 'bg-[#52B788] active:bg-[#45A077]',
      secondary: 'bg-gray-200 active:bg-gray-300',
      outline: 'border-2 border-[#52B788] bg-transparent',
      ghost: 'bg-transparent',
      danger: 'bg-red-500 active:bg-red-600',
    };

    const disabledClasses = disabled || loading ? 'opacity-50' : '';

    return `${baseClasses} ${sizeClasses[size]} ${widthClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`.trim();
  };

  const getTextClasses = (): string => {
    const baseTextClasses = 'font-semibold text-center';
    const sizeTextClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    const variantTextClasses = {
      primary: 'text-white',
      secondary: 'text-gray-800',
      outline: 'text-[#52B788]',
      ghost: 'text-[#52B788]',
      danger: 'text-white',
    };

    const disabledTextClasses = disabled || loading ? 'opacity-50' : '';

    return `${baseTextClasses} ${sizeTextClasses[size]} ${variantTextClasses[variant]} ${disabledTextClasses} ${textClassName}`.trim();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#52B788' : 'white'} />
          <Text className={`${getTextClasses()} ml-2`}>Loading...</Text>
        </>
      );
    }

    if (icon) {
      if (iconPosition === 'left') {
        return (
          <>
            {icon}
            <Text className={`${getTextClasses()} ml-2`}>{title}</Text>
          </>
        );
      } else {
        return (
          <>
            <Text className={`${getTextClasses()} mr-2`}>{title}</Text>
            {icon}
          </>
        );
      }
    }

    return <Text className={getTextClasses()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default CustomButton;
