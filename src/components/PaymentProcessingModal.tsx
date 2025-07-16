import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Lottie from 'lottie-react';
import { CheckCircle2, XCircle, CreditCard, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error' | null;
  onClose: () => void;
  errorMessage?: string;
}

// Simple Lottie animation for payment processing (credit card with pulse effect)
const paymentProcessingAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 500,
  h: 500,
  nm: "Payment Processing",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Card",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { 
          a: 1, 
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 30, s: [110, 110, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [160, 100] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 15 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.784, 0.894, 0, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Card Shape",
          np: 3,
          cix: 2,
          bm: 0
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

// Success checkmark animation (expanding green circle)
const successAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 500,
  h: 500,
  nm: "Success Checkmark",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Checkmark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { 
          a: 1, 
          k: [
            { t: 0, s: [0, 0, 100] },
            { t: 30, s: [120, 120, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [100, 100] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.133, 0.725, 0.133, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Circle",
          np: 3,
          cix: 2,
          bm: 0
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

// CSS Spinner fallback component
const CSSSpinner: React.FC = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-[#C8E400] border-t-transparent rounded-full animate-spin"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <CreditCard className="w-6 h-6 text-[#C8E400]" />
    </div>
  </div>
);

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  status,
  onClose,
  errorMessage
}) => {
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
      setCurrentStep(0);
    } else {
      setShowContent(false);
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Progress through steps when processing
  useEffect(() => {
    if (status === 'processing' && isOpen) {
      const stepTimer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 1500); // Change step every 1.5 seconds

      return () => clearInterval(stepTimer);
    }
  }, [status, isOpen]);

  if (!isOpen) return null;

  const handleLottieError = () => {
    setLottieError(true);
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="mb-6 flex justify-center relative">
              {!lottieError ? (
                <div className="w-24 h-24 relative">
                  <Lottie
                    animationData={paymentProcessingAnimation}
                    loop={true}
                    onError={handleLottieError}
                    className="w-full h-full"
                  />
                  {/* Progress ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200">
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-[#C8E400] border-t-transparent transition-all duration-1000"
                      style={{
                        transform: `rotate(${(currentStep + 1) * 120}deg)`,
                        clipPath: `inset(0 ${100 - ((currentStep + 1) / 3) * 100}% 0 0)`
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <CSSSpinner />
                  {/* Progress indicator for CSS fallback */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((step) => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            currentStep >= step ? 'bg-[#C8E400]' : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {t('payment.processing')}
            </h3>
            <p className="text-gray-600 text-sm md:text-base mb-4">
              {t('payment.processingDescription') || 'Please wait while we process your payment securely...'}
            </p>
            
            {/* Enhanced processing steps */}
            <div className="bg-gradient-to-r from-[#C8E400]/10 to-[#A3C700]/10 rounded-xl p-4 mb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    currentStep >= 0 
                      ? 'bg-[#C8E400] animate-pulse' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm transition-colors duration-500 ${
                    currentStep >= 0 ? 'text-gray-700' : 'text-gray-400'
                  }`}>{t('payment.verifyingMethod')}</span>
                  {currentStep === 0 && (
                    <div className="ml-auto">
                      <div className="w-3 h-3 border-2 border-[#C8E400] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {currentStep > 0 && (
                    <div className="ml-auto">
                      <CheckCircle2 className="w-4 h-4 text-[#C8E400]" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    currentStep >= 1 
                      ? 'bg-[#C8E400] animate-pulse' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm transition-colors duration-500 ${
                    currentStep >= 1 ? 'text-gray-700' : 'text-gray-400'
                  }`}>{t('payment.processingTransaction')}</span>
                  {currentStep === 1 && (
                    <div className="ml-auto">
                      <div className="w-3 h-3 border-2 border-[#C8E400] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {currentStep > 1 && (
                    <div className="ml-auto">
                      <CheckCircle2 className="w-4 h-4 text-[#C8E400]" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    currentStep >= 2 
                      ? 'bg-[#C8E400] animate-pulse' 
                      : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm transition-colors duration-500 ${
                    currentStep >= 2 ? 'text-gray-700' : 'text-gray-400'
                  }`}>{t('payment.confirmingOrder')}</span>
                  {currentStep === 2 && (
                    <div className="ml-auto">
                      <div className="w-3 h-3 border-2 border-[#C8E400] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {currentStep > 2 && (
                    <div className="ml-auto">
                      <CheckCircle2 className="w-4 h-4 text-[#C8E400]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#C8E400] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#C8E400] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#C8E400] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              {!lottieError ? (
                <div className="w-24 h-24">
                  <Lottie
                    animationData={successAnimation}
                    loop={false}
                    onError={handleLottieError}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-green-900 mb-2">
              {t('payment.successful')}
            </h3>
            <p className="text-green-700 text-sm md:text-base">
              {t('payment.successDescription') || 'Your payment has been processed successfully!'}
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-red-900 mb-2">
              {t('payment.error')}
            </h3>
            <p className="text-red-700 text-sm md:text-base">
              {errorMessage || t('payment.failed') || 'Payment processing failed. Please try again.'}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('common.tryAgain') || 'Try Again'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const modal = (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 10000 }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm md:max-w-md w-full mx-4 transform transition-all duration-300 relative ${
          showContent ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button - only show for processing or error states */}
        {(status === 'processing' || status === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};