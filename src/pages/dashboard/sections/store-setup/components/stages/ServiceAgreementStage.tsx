/**
 * ServiceAgreementStage Component
 *
 * Stage 5: Service Agreement
 * Displays service agreement and collects acceptance
 */

import type * as React from 'react';
import { ServiceAgreement } from '../ServiceAgreement';

interface ServiceAgreementStageProps {
  storeName: string;
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
}

export const ServiceAgreementStage: React.FC<ServiceAgreementStageProps> = ({
  storeName,
  agreed,
  onAgreeChange,
}) => {
  return (
    <ServiceAgreement
      storeName={storeName}
      agreed={agreed}
      onAgreeChange={onAgreeChange}
    />
  );
};
