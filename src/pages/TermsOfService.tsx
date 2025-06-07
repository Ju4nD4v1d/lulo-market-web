import React from 'react';
import { ArrowLeft, Shield, FileText, Users, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/company';

export const TermsOfService = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a 
              href="#" 
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>{t('legal.backToHome')}</span>
            </a>
            <div className="text-sm text-gray-500">
              {t('legal.lastUpdated')}: December 2024
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('legal.terms.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('legal.terms.subtitle')}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  {t('legal.terms.introduction.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to {COMPANY_NAME}. These Terms of Service ("Terms") govern your use of our platform, 
                    website, and services. By accessing or using {COMPANY_NAME}, you agree to be bound by these Terms. 
                    If you disagree with any part of these terms, then you may not access the service.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {COMPANY_NAME} is a marketplace platform that connects Latin American businesses with consumers, 
                    facilitating the discovery and purchase of authentic products and services.
                  </p>
                </div>
              </section>

              {/* User Obligations */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.terms.userObligations.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    As a user of {COMPANY_NAME}, you agree to:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Provide accurate, current, and complete information during registration
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Maintain the security of your account credentials
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Use the platform only for lawful purposes and in accordance with these Terms
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Respect the intellectual property rights of others
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Not engage in any activity that could harm or disrupt the platform
                    </li>
                  </ul>
                </div>
              </section>

              {/* Platform Usage */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  {t('legal.terms.platformUsage.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {COMPANY_NAME} provides a platform for businesses to list their products and services, 
                    and for consumers to discover and purchase these offerings. We facilitate transactions 
                    but are not directly involved in the actual exchange of goods or services between users.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Businesses are responsible for the accuracy of their listings, product quality, 
                    fulfillment, and customer service. Consumers are responsible for their purchasing 
                    decisions and compliance with payment terms.
                  </p>
                </div>
              </section>

              {/* Prohibited Activities */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  {t('legal.terms.prohibited.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The following activities are strictly prohibited on our platform:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Listing illegal, counterfeit, or harmful products
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Engaging in fraudulent or deceptive practices
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Violating intellectual property rights
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Harassment or discrimination against other users
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Attempting to circumvent platform security measures
                    </li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.terms.liability.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {COMPANY_NAME} provides the platform "as is" and makes no warranties regarding the 
                    availability, reliability, or suitability of the service. We are not liable for any 
                    direct, indirect, incidental, or consequential damages arising from your use of the platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Our liability is limited to the maximum extent permitted by law. We do not guarantee 
                    the quality, safety, or legality of products listed by businesses, nor do we guarantee 
                    the accuracy of user-generated content.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">6</span>
                  </div>
                  {t('legal.terms.changes.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of 
                    significant changes via email or through prominent notices on our platform. 
                    Continued use of {COMPANY_NAME} after changes constitutes acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('legal.contact.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>Email: legal@lulocart.com</p>
                  <p>Address: [Your Business Address]</p>
                  <p>Phone: [Your Phone Number]</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};