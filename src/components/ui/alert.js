// src/components/ui/alert.js
import React from 'react';

export const Alert = ({ children, variant = 'info', className }) => {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`${variantClasses[variant]} p-4 rounded-md ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);
