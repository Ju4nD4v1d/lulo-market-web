import { useState, useCallback } from 'react';
import { useBusinessContactMutation } from '../../../hooks/mutations/useBusinessContactMutation';

interface FormData {
  fullName: string;
  businessEmail: string;
  phoneNumber: string;
  businessName: string;
  contactPreference: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName: string;
  businessEmail: string;
  phoneNumber: string;
  businessName: string;
  contactPreference: string;
  agreeToTerms: string;
}

const initialFormData: FormData = {
  fullName: '',
  businessEmail: '',
  phoneNumber: '',
  businessName: '',
  contactPreference: '',
  agreeToTerms: false
};

const initialErrors: FormErrors = {
  fullName: '',
  businessEmail: '',
  phoneNumber: '',
  businessName: '',
  contactPreference: '',
  agreeToTerms: ''
};

export const useBusinessContact = () => {
  const { submitContact, isSubmitting } = useBusinessContactMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (t: (key: string) => string) => {
    const newErrors: FormErrors = {
      fullName: '',
      businessEmail: '',
      phoneNumber: '',
      businessName: '',
      contactPreference: '',
      agreeToTerms: ''
    };
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('business.contact.form.error.name');
      isValid = false;
    }

    if (!formData.businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = t('business.contact.form.error.email');
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = t('business.contact.form.error.business');
      isValid = false;
    }

    if (!formData.contactPreference) {
      newErrors.contactPreference = t('business.contact.form.error.preference');
      isValid = false;
    }

    if (formData.contactPreference === 'phone' && !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('business.contact.form.error.phone');
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('business.contact.form.error.terms');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent, t: (key: string) => string) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm(t)) return;

    try {
      await submitContact.mutateAsync({
        fullName: formData.fullName,
        businessEmail: formData.businessEmail,
        phoneNumber: formData.phoneNumber || null,
        businessName: formData.businessName,
        preferredContactMethod: formData.contactPreference,
        privacyConsent: {
          accepted: formData.agreeToTerms,
          version: 'v1.0'
        }
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving lead:', error);
      setSubmitError(t('business.contact.form.error.submit'));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (submitError) setSubmitError('');
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setIsSubmitted(false);
    setSubmitError('');
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    isSubmitted,
    submitError,
    handleInputChange,
    handleSubmit,
    validateForm,
    resetForm
  };
};
