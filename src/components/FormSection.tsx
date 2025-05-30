import React from 'react';

interface FormSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export const FormSection = ({ 
  title, 
  icon: Icon, 
  children 
}: FormSectionProps) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center space-x-3 mb-6">
      <div className="bg-primary-50 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);