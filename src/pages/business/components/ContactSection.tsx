import React from 'react';
import { Calendar, Mail, Phone, Users, Clock } from 'lucide-react';
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

            {/* Quick Contact Options */}
            <div className={styles.quickCard}>
              <h4 className={styles.quickTitle}>
                {t('business.contact.quickOptions.title')}
              </h4>

              <div className={styles.quickOptions}>
                <div className={styles.quickOption}>
                  <div className={styles.quickIconOrange}>
                    <Mail className={styles.quickIcon} />
                  </div>
                  <div>
                    <div className={styles.quickLabel}>
                      {t('business.contact.quickOptions.email')}
                    </div>
                    <div className={styles.quickDesc}>
                      {t('business.contact.quickOptions.emailDesc')}
                    </div>
                  </div>
                </div>

                <div className={styles.quickOption}>
                  <div className={styles.quickIconGreen}>
                    <Phone className={styles.quickIcon} />
                  </div>
                  <div>
                    <div className={styles.quickLabel}>
                      {t('business.contact.quickOptions.phone')}
                    </div>
                    <div className={styles.quickDesc}>
                      {t('business.contact.quickOptions.phoneDesc')}
                    </div>
                  </div>
                </div>

                <div className={styles.quickOption}>
                  <div className={styles.quickIconPurple}>
                    <Users className={styles.quickIcon} />
                  </div>
                  <div>
                    <div className={styles.quickLabel}>
                      {t('business.contact.quickOptions.support')}
                    </div>
                    <div className={styles.quickDesc}>
                      {t('business.contact.quickOptions.supportDesc')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className={styles.responseCard}>
              <div className={styles.responseContent}>
                <div className={styles.clockIcon}>
                  <Clock className={styles.icon} />
                </div>
                <h4 className={styles.responseTitle}>
                  {t('business.contact.responseTime.title')}
                </h4>
                <p className={styles.responseDescription}>
                  {t('business.contact.responseTime.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
