// src/components/forms/FormField.tsx
import React, { forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  register?: any; // Support pour react-hook-form
  rightElement?: React.ReactNode; // Support pour les éléments à droite (icônes, etc.)
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    className,
    showPasswordToggle = false,
    isPasswordVisible = false,
    onTogglePassword,
    type,
    register,
    rightElement,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type}
            className={cn(
              'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
              error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              (showPasswordToggle || rightElement) && 'pr-10',
              className
            )}
            {...(register && props.name ? register(props.name) : {})}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
          {showPasswordToggle && !rightElement && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={onTogglePassword}
            >
              {isPasswordVisible ? (
                <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center mt-1">
            <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;