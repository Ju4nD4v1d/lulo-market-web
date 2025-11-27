const CALENDLY_URL = 'https://calendly.com/lulocart-support/30min';

export const useCalendly = () => {
  const openCalendly = () => {
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
  };

  return { openCalendly };
};
