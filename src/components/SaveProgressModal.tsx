import React from 'react';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface SaveProgressModalProps {
  isOpen: boolean;
  currentStep: 'saving' | 'uploading' | 'finalizing' | 'complete';
  onComplete?: () => void;
}

export const SaveProgressModal = ({ isOpen, currentStep, onComplete }: SaveProgressModalProps) => {
  if (!isOpen) return null;

  const steps = [
    { id: 'saving', label: 'Saving store info...' },
    { id: 'uploading', label: 'Uploading images...' },
    { id: 'finalizing', label: 'Finalizing...' },
    { id: 'complete', label: 'Store saved successfully!' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 relative">
        <div className="flex flex-col items-center">
          {currentStep === 'complete' ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-primary-500 mb-4 animate-scale" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Store Created Successfully!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Your store has been created and saved. You can now start adding products to your store.
              </p>
              <button
                onClick={onComplete}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg
                  hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Continue to Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-primary-500 mb-4 animate-spin" />
              <div className="space-y-4 w-full">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 ${
                      index > currentStepIndex ? 'text-gray-400' :
                      index === currentStepIndex ? 'text-primary-600 font-medium' :
                      'text-gray-600'
                    }`}
                  >
                    <div className={`
                      w-2 h-2 rounded-full
                      ${index > currentStepIndex ? 'bg-gray-300' :
                        index === currentStepIndex ? 'bg-primary-500' :
                        'bg-primary-400'}
                    `} />
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};