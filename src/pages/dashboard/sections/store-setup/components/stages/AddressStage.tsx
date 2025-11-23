/**
 * AddressStage Component
 *
 * Stage 2: Store Address
 * Collects complete Canadian address with validation
 */

import type * as React from 'react';
import { AddressFields } from '../AddressFields';

interface AddressStageProps {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
}

export const AddressStage: React.FC<AddressStageProps> = ({
  street,
  city,
  province,
  postalCode,
  onStreetChange,
  onCityChange,
  onProvinceChange,
  onPostalCodeChange,
}) => {
  return (
    <AddressFields
      street={street}
      city={city}
      province={province}
      postalCode={postalCode}
      onStreetChange={onStreetChange}
      onCityChange={onCityChange}
      onProvinceChange={onProvinceChange}
      onPostalCodeChange={onPostalCodeChange}
    />
  );
};
