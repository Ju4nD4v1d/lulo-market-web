import React from 'react';
import { ArrowLeft, Shield, Eye, Cookie, Database, Lock, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY_NAME } from '../config/company';

export const PrivacyPolicy = () => {
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
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('legal.privacy.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('legal.privacy.subtitle')}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Eye className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.privacy.introduction.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    At {COMPANY_NAME}, we are committed to protecting your privacy and ensuring the security 
                    of your personal information. This Privacy Policy explains how we collect, use, disclose, 
                    and safeguard your information when you use our platform and services.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    By using {COMPANY_NAME}, you consent to the data practices described in this policy. 
                    We encourage you to review this policy periodically as we may update it from time to time.
                  </p>
                </div>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Database className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.privacy.dataCollection.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We collect information you provide directly to us, such as:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Name, email address, and phone number</li>
                        <li>• Business information and address</li>
                        <li>• Payment and billing information</li>
                        <li>• Profile photos and business images</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Device information and IP address</li>
                        <li>• Browser type and operating system</li>
                        <li>• Pages visited and time spent on our platform</li>
                        <li>• Search queries and interaction data</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Location Information</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• Business location for store listings</li>
                        <li>• Delivery addresses for order fulfillment</li>
                        <li>• General location data for service optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  {t('legal.privacy.dataUsage.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Provide, maintain, and improve our platform and services
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Process transactions and send related information
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Send administrative information and updates
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Personalize your experience and provide relevant content
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Analyze usage patterns to improve our services
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Detect, prevent, and address fraud and security issues
                    </li>
                  </ul>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Cookie className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.privacy.cookies.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. 
                    Cookies help us remember your preferences, analyze site traffic, and provide personalized content.
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">Essential Cookies:</span>
                        <span className="text-gray-700"> Required for basic platform functionality</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">Analytics Cookies:</span>
                        <span className="text-gray-700"> Help us understand how users interact with our platform</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">Marketing Cookies:</span>
                        <span className="text-gray-700"> Used to deliver relevant advertisements and content</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mt-4">
                    You can control cookie preferences through your browser settings, though disabling certain 
                    cookies may affect platform functionality.
                  </p>
                </div>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="w-5 h-5 text-primary-600" />
                  </div>
                  {t('legal.privacy.thirdParty.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We work with trusted third-party service providers to enhance our platform:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Payment Processing</h4>
                      <p className="text-gray-700 text-sm">
                        Secure payment processing through certified payment providers
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Analytics Services</h4>
                      <p className="text-gray-700 text-sm">
                        Google Analytics and similar services for usage insights
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Cloud Storage</h4>
                      <p className="text-gray-700 text-sm">
                        Secure cloud storage for data backup and accessibility
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Communication Tools</h4>
                      <p className="text-gray-700 text-sm">
                        Email and messaging services for platform communications
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  {t('legal.privacy.security.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your 
                    personal information against unauthorized access, alteration, disclosure, or destruction. 
                    These measures include encryption, secure servers, and regular security assessments.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    However, no method of transmission over the internet or electronic storage is 100% secure. 
                    While we strive to protect your personal information, we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">7</span>
                  </div>
                  {t('legal.privacy.rights.title')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have certain rights regarding your personal information:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Access and review your personal information
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Request correction of inaccurate information
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Request deletion of your personal information
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Opt-out of marketing communications
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Request data portability where applicable
                    </li>
                  </ul>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('legal.contact.title')}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p>Email: privacy@lulocart.com</p>
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