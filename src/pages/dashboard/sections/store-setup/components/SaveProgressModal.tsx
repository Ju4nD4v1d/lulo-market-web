import { Loader2, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';

interface SaveProgressModalProps {
  isOpen: boolean;
  currentStep: 'saving' | 'uploading' | 'finalizing' | 'complete' | 'error';
  error?: string | null;
  onComplete?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
}

export const SaveProgressModal = ({
  isOpen,
  currentStep,
  error,
  onComplete,
  onRetry,
  onClose
}: SaveProgressModalProps) => {
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
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl border-2 border-gray-200">
        <div className="flex flex-col items-center">
          {currentStep === 'error' ? (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t('store.saveProgress.errorTitle')}
              </h3>
              <p className="text-gray-600 mb-2 text-center">
                {t('store.saveProgress.errorDesc')}
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 w-full">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="btn-primary flex-1 flex items-center justify-center font-medium"
                  >
                    {t('store.saveProgress.retry')}
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="btn-ghost flex-1 flex items-center justify-center font-medium"
                  >
                    {t('store.saveProgress.close')}
                  </button>
                )}
              </div>
            </>
          ) : currentStep === 'complete' ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-scale" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {t('store.saveProgress.createdTitle')}
              </h3>
              <p className="text-gray-600 mb-8 text-center text-lg">
                {t('store.saveProgress.createdDesc')}
              </p>
              <button
                onClick={onComplete}
                className="btn-primary w-full flex items-center justify-center font-medium"
              >
                {t('store.saveProgress.continue')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-16 h-16 text-primary-400 mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                {t('store.saveProgress.settingUpStore')}
              </h3>
              <div className="space-y-4 w-full">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 ${
                      index > currentStepIndex ? 'text-gray-400' :
                      index === currentStepIndex ? 'text-primary-400 font-medium' :
                      'text-gray-600'
                    }`}
                  >
                    <div className={`
                      w-2 h-2 rounded-full
                      ${index > currentStepIndex ? 'bg-gray-300' :
                        index === currentStepIndex ? 'bg-primary-400 animate-pulse' :
                        'bg-green-500'}
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
