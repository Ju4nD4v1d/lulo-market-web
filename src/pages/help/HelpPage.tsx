/**
 * HelpPage Component
 *
 * Help & Support page with FAQs and troubleshooting guides
 * Features:
 * - Searchable FAQ section
 * - Category tabs
 * - Troubleshooting guides
 * - Contact support
 * - Fully responsive and multilingual
 */

import type * as React from 'react';
import { useState } from 'react';
import {
  ArrowLeft,
  Search,
  HelpCircle,
  ShoppingCart,
  Store,
  CreditCard,
  ChevronDown,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './HelpPage.module.css';

type Category = 'all' | 'orders' | 'stores' | 'payments' | 'account';

interface FAQ {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

export const HelpPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    // Orders
    {
      id: 'order-1',
      category: 'orders',
      question: t('help.faq.order1.question'),
      answer: t('help.faq.order1.answer')
    },
    {
      id: 'order-2',
      category: 'orders',
      question: t('help.faq.order2.question'),
      answer: t('help.faq.order2.answer')
    },
    {
      id: 'order-3',
      category: 'orders',
      question: t('help.faq.order3.question'),
      answer: t('help.faq.order3.answer')
    },
    // Stores
    {
      id: 'store-1',
      category: 'stores',
      question: t('help.faq.store1.question'),
      answer: t('help.faq.store1.answer')
    },
    {
      id: 'store-2',
      category: 'stores',
      question: t('help.faq.store2.question'),
      answer: t('help.faq.store2.answer')
    },
    // Payments
    {
      id: 'payment-1',
      category: 'payments',
      question: t('help.faq.payment1.question'),
      answer: t('help.faq.payment1.answer')
    },
    {
      id: 'payment-2',
      category: 'payments',
      question: t('help.faq.payment2.question'),
      answer: t('help.faq.payment2.answer')
    },
    // Account
    {
      id: 'account-1',
      category: 'account',
      question: t('help.faq.account1.question'),
      answer: t('help.faq.account1.answer')
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const categoryMatch = selectedCategory === 'all' || faq.category === selectedCategory;
    const searchMatch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            {t('common.back')}
          </button>
          <h1 className={styles.title}>
            {t('help.title')}
          </h1>
          <p className={styles.subtitle}>
            {t('help.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Search Box */}
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('help.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <HelpCircle size={18} />
            {t('help.categories.all')}
          </button>
          <button
            className={`${styles.tab} ${selectedCategory === 'orders' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('orders')}
          >
            <ShoppingCart size={18} />
            {t('help.categories.orders')}
          </button>
          <button
            className={`${styles.tab} ${selectedCategory === 'stores' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('stores')}
          >
            <Store size={18} />
            {t('help.categories.stores')}
          </button>
          <button
            className={`${styles.tab} ${selectedCategory === 'payments' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('payments')}
          >
            <CreditCard size={18} />
            {t('help.categories.payments')}
          </button>
          <button
            className={`${styles.tab} ${selectedCategory === 'account' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('account')}
          >
            <HelpCircle size={18} />
            {t('help.categories.account')}
          </button>
        </div>

        {/* FAQ Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <HelpCircle size={18} />
            </span>
            {t('help.faqTitle')}
          </h2>
          <div className={styles.faqList}>
            {filteredFaqs.map(faq => (
              <div
                key={faq.id}
                className={`${styles.faqItem} ${openFaqId === faq.id ? styles.open : ''}`}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className={styles.faqQuestionText}>{faq.question}</span>
                  <ChevronDown className={styles.faqIcon} size={20} />
                </button>
                <div className={styles.faqAnswer}>
                  <div className={styles.faqAnswerContent}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <AlertCircle size={18} />
            </span>
            {t('help.troubleshootingTitle')}
          </h2>
          <div className={styles.troubleshootingList}>
            {/* Issue 1 */}
            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                {t('help.troubleshooting.issue1.title')}
                <span className={styles.troubleshootingBadge}>
                  {t('help.troubleshooting.common')}
                </span>
              </h3>
              <div className={styles.troubleshootingSteps}>
                <p>{t('help.troubleshooting.issue1.description')}</p>
                <ol>
                  <li><strong>{t('help.troubleshooting.issue1.step1')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue1.step2')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue1.step3')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue1.step4')}</strong></li>
                </ol>
              </div>
            </div>

            {/* Issue 2 */}
            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                {t('help.troubleshooting.issue2.title')}
              </h3>
              <div className={styles.troubleshootingSteps}>
                <p>{t('help.troubleshooting.issue2.description')}</p>
                <ol>
                  <li><strong>{t('help.troubleshooting.issue2.step1')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue2.step2')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue2.step3')}</strong></li>
                </ol>
              </div>
            </div>

            {/* Issue 3 */}
            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                {t('help.troubleshooting.issue3.title')}
              </h3>
              <div className={styles.troubleshootingSteps}>
                <p>{t('help.troubleshooting.issue3.description')}</p>
                <ol>
                  <li><strong>{t('help.troubleshooting.issue3.step1')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue3.step2')}</strong></li>
                  <li><strong>{t('help.troubleshooting.issue3.step3')}</strong></li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className={styles.section}>
          <div className={styles.contactCard}>
            <h3 className={styles.contactTitle}>
              {t('help.contact.title')}
            </h3>
            <p className={styles.contactText}>
              {t('help.contact.description')}
            </p>
            <a href="mailto:support@lulocart.com">
              <button className={styles.contactButton}>
                <Mail size={18} />
                {t('help.contact.button')}
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
