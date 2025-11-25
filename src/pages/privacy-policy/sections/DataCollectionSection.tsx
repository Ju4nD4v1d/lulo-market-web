import type * as React from 'react';

import { Database } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { LegalSection } from '../../../components/shared/legal';

export const DataCollectionSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <LegalSection icon={Database} title={t('legal.privacy.dataCollection.title')}>
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
    </LegalSection>
  );
};
