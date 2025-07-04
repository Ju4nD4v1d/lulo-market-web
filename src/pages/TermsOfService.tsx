import React from 'react';
import { ArrowLeft, Shield, FileText, Users, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TermsOfService = () => {
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
                    {t('legal.terms.introduction.content1')}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t('legal.terms.introduction.content2')}
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
                    {t('legal.terms.userObligations.intro')}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.userObligations.item1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.userObligations.item2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.userObligations.item3')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.userObligations.item4')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.userObligations.item5')}
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
                    {t('legal.terms.platformUsage.content1')}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t('legal.terms.platformUsage.content2')}
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
                    {t('legal.terms.prohibited.intro')}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.prohibited.item1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.prohibited.item2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.prohibited.item3')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.prohibited.item4')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('legal.terms.prohibited.item5')}
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
                    {t('legal.terms.liability.content1')}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {t('legal.terms.liability.content2')}
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
                    {t('legal.terms.changes.content')}
                  </p>
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
};