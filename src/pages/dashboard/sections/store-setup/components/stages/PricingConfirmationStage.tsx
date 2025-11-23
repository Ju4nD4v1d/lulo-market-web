/**
 * PricingConfirmationStage Component
 *
 * Stage 6: Pricing Confirmation
 * Displays pricing details and collects confirmation
 */

import type * as React from 'react';
import { PricingConfirmation } from '../PricingConfirmation';

interface PricingConfirmationStageProps {
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export const PricingConfirmationStage: React.FC<PricingConfirmationStageProps> = ({
  confirmed,
  onConfirmChange,
}) => {
  return (
    <PricingConfirmation
      confirmed={confirmed}
      onConfirmChange={onConfirmChange}
    />
  );
};
