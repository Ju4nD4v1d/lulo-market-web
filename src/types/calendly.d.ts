// Calendly widget type definitions
declare global {
  interface Window {
    Calendly: {
      initBadgeWidget: (options: {
        url: string;
        text: string;
        color: string;
        textColor: string;
      }) => void;
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement | null;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
      showPopupWidget: (url: string) => void;
    };
  }
}

export {};