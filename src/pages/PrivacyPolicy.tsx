import React from 'react';
import { ArrowLeft, Shield, Eye, Cookie, Database, Lock, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPolicy = () => {
  const { t } = useLanguage();

  const handleBack = () => {
    // Check if there's a stored back navigation path, otherwise go to home
    const backPath = localStorage.getItem('backNavigationPath');
    if (backPath && backPath !== window.location.hash) {
      localStorage.removeItem('backNavigationPath');
      window.location.hash = backPath;
    } else {
      window.location.hash = '#';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>{t('legal.backToHome')}</span>
            </button>
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
                    {t('legal.privacy.introduction.content1')}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t('legal.privacy.introduction.content2')}
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
                    {t('legal.privacy.dataCollection.intro')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.dataCollection.personal.title')}</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t('legal.privacy.dataCollection.personal.item1')}</li>
                        <li>• {t('legal.privacy.dataCollection.personal.item2')}</li>
                        <li>• {t('legal.privacy.dataCollection.personal.item3')}</li>
                        <li>• {t('legal.privacy.dataCollection.personal.item4')}</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.dataCollection.usage.title')}</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t('legal.privacy.dataCollection.usage.item1')}</li>
                        <li>• {t('legal.privacy.dataCollection.usage.item2')}</li>
                        <li>• {t('legal.privacy.dataCollection.usage.item3')}</li>
                        <li>• {t('legal.privacy.dataCollection.usage.item4')}</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.dataCollection.location.title')}</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        <li>• {t('legal.privacy.dataCollection.location.item1')}</li>
                        <li>• {t('legal.privacy.dataCollection.location.item2')}</li>
                        <li>• {t('legal.privacy.dataCollection.location.item3')}</li>
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
                    {t('legal.privacy.dataUsage.intro')}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item3')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item4')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item5')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.dataUsage.item6')}
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
                    {t('legal.privacy.cookies.intro')}
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">{t('legal.privacy.cookies.essential')}</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">{t('legal.privacy.cookies.analytics')}</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-gray-900">{t('legal.privacy.cookies.marketing')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mt-4">
                    {t('legal.privacy.cookies.control')}
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
                    {t('legal.privacy.thirdParty.intro')}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.payment.title')}</h4>
                      <p className="text-gray-700 text-sm">
                        {t('legal.privacy.thirdParty.payment.desc')}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.analytics.title')}</h4>
                      <p className="text-gray-700 text-sm">
                        {t('legal.privacy.thirdParty.analytics.desc')}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.storage.title')}</h4>
                      <p className="text-gray-700 text-sm">
                        {t('legal.privacy.thirdParty.storage.desc')}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{t('legal.privacy.thirdParty.communication.title')}</h4>
                      <p className="text-gray-700 text-sm">
                        {t('legal.privacy.thirdParty.communication.desc')}
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
                    {t('legal.privacy.security.content1')}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t('legal.privacy.security.content2')}
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
                    {t('legal.privacy.rights.intro')}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.rights.item1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.rights.item2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.rights.item3')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.rights.item4')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.privacy.rights.item5')}
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
                  {t('legal.contact.description')}
                </p>
                <div className="mt-4 text-gray-700">
                  <p>{t('legal.contact.email')}</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};export default PrivacyPolicy;
