/**
 * ServiceAgreementStage Component
 *
 * Stage 4: Legal Agreements
 * Displays three legal agreements with checkboxes
 * Only shows pending (not yet accepted) agreements
 */

import type * as React from 'react';
import { LegalAgreements, AgreementState } from '../LegalAgreements';

interface ServiceAgreementStageProps {
  agreements: AgreementState;
  onAgreementChange: (agreements: AgreementState) => void;
  /** Previously accepted agreements - only pending ones will be shown */
  existingAcceptances?: AgreementState;
}

export const ServiceAgreementStage: React.FC<ServiceAgreementStageProps> = ({
  agreements,
  onAgreementChange,
  existingAcceptances,
}) => {
  return (
    <LegalAgreements
      agreements={agreements}
      onAgreementChange={onAgreementChange}
      existingAcceptances={existingAcceptances}
    />
  );
};
