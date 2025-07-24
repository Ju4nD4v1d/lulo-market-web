import React from 'react';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SaveProgressModalProps {
  isOpen: boolean;
  currentStep: 'saving' | 'uploading' | 'finalizing' | 'complete';
  onComplete?: () => void;
}

export const SaveProgressModal = ({ isOpen, currentStep, onComplete }: SaveProgressModalProps) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const steps = [
    { id: 'saving', label: t('store.saveProgress.savingInfo') },
    { id: 'uploading', label: t('store.saveProgress.uploadingImages') },
    { id: 'finalizing', label: t('store.saveProgress.finalizing') },
    { id: 'complete', label: t('store.saveProgress.complete') }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center">
          {currentStep === 'complete' ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-[#C8E400] mb-4 animate-scale" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t('store.saveProgress.createdTitle')}
              </h3>
              <p className="text-gray-600 mb-8 text-center text-lg">
                {t('store.saveProgress.createdDesc')}
              </p>
              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-[#C8E400] to-[#A8C400] text-gray-900 py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center font-medium"
              >
                {t('store.saveProgress.continue')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 text-[#C8E400] mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                {t('store.saveProgress.settingUpStore')}
              </h3>
              <div className="space-y-4 w-full">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 ${
                      index > currentStepIndex ? 'text-gray-400' :
                      index === currentStepIndex ? 'text-[#C8E400] font-medium' :
                      'text-gray-600'
                    }`}
                  >
                    <div className={`
                      w-2 h-2 rounded-full
                      ${index > currentStepIndex ? 'bg-gray-300' :
                        index === currentStepIndex ? 'bg-[#C8E400]' :
                        'bg-[#A8C400]'}
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