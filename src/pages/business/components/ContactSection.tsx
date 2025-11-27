import type * as React from 'react';

import { Calendar } from 'lucide-react';
import { BusinessContactForm } from './BusinessContactForm';
import styles from './ContactSection.module.css';

interface ContactSectionProps {
  formData: {
    fullName: string;
    businessEmail: string;
    phoneNumber: string;
    businessName: string;
    contactPreference: string;
    agreeToTerms: boolean;
  };
  errors: {
    fullName: string;
    businessEmail: string;
    phoneNumber: string;
    businessName: string;
    contactPreference: string;
    agreeToTerms: string;
  };
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError?: string;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenCalendly: () => void;
  t: (key: string) => string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  errors,
  isSubmitting,
  isSubmitted,
  submitError,
  onInputChange,
  onSubmit,
  onOpenCalendly,
  t
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textCenter}>
          <h2 className={styles.title}>
            {t('business.contact.title')}
          </h2>
          <p className={styles.description}>
            {t('business.contact.description')}
          </p>
        </div>

        <div className={styles.grid}>
          {/* Contact Form */}
          <div className={styles.formColumn}>
            <div className={styles.formCard}>
              <BusinessContactForm
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
                submitError={submitError}
                onInputChange={onInputChange}
                onSubmit={onSubmit}
                t={t}
              />
            </div>
          </div>

          {/* Schedule Call & Additional Options */}
          <div className={styles.sidebarColumn}>
            {/* Schedule Call */}
            <div className={styles.scheduleCard}>
              <div className={styles.scheduleContent}>
                <div className={styles.calendarIcon}>
                  <Calendar className={styles.icon} />
                </div>
                <h3 className={styles.scheduleTitle}>
                  {t('business.contact.scheduleCall.title')}
                </h3>
                <p className={styles.scheduleDescription}>
                  {t('business.contact.scheduleCall.description')}
                </p>
                <button
                  onClick={onOpenCalendly}
                  className={styles.scheduleButton}
                >
                  <Calendar className={styles.buttonIcon} />
                  {t('business.contact.scheduleCall.button')}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
