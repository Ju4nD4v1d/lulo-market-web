declare global {
  interface Window {
    Calendly?: {
      showPopupWidget: (url: string) => void;
    };
  }
}

export const useCalendly = () => {
  const openCalendly = () => {
    // Load Calendly script only when needed
    if (!window.Calendly) {
      // Add Calendly CSS
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Add Calendly script
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        // Trigger Calendly popup after script loads
        if (window.Calendly) {
          window.Calendly.showPopupWidget('https://calendly.com/juandavidortegat/15min');
        }
      };
      document.head.appendChild(script);
    } else {
      // Trigger Calendly popup if already loaded
      window.Calendly.showPopupWidget('https://calendly.com/juandavidortegat/15min');
    }
  };

  return { openCalendly };
};
