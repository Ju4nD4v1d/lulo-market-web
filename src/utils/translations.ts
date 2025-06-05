import { COMPANY_NAME } from '../config/company';

export type Locale = 'en' | 'es';

type TranslationDict = {
  [key: string]: string;
};

type Translations = {
  [key in Locale]: TranslationDict;
};

export const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.forBusinesses': 'For Businesses',
    'nav.forShoppers': 'For Shoppers',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.prices': 'Prices',
    
    // Pricing Section
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Start growing your business with our flexible plans',
    'pricing.basic.title': 'Basic Plan',
    'pricing.basic.price': '$29',
    'pricing.basic.period': '/month',
    'pricing.basic.description': 'Perfect for small businesses starting their journey',
    'pricing.basic.features': [
      'List up to 50 products',
      'Basic analytics',
      'Standard support',
      'Mobile app access'
    ],
    'pricing.premium.title': 'Premium Plan',
    'pricing.premium.price': '$79',
    'pricing.premium.period': '/month',
    'pricing.premium.description': 'For growing businesses ready to scale',
    'pricing.premium.features': [
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'Marketing tools',
      'Custom branding'
    ],
    'pricing.contactUs': 'For more details, we\'d love to get in touch with you',
    'pricing.getStarted': 'Get Started',

    // Contact Form
    'contact.title': 'You\'re Very Close!',
    'contact.subtitle': 'You are very close to impacting the community with your wonderful products',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.namePlaceholder': 'Enter your name',
    'contact.emailPlaceholder': 'Enter your email',
    'contact.submit': 'Submit',
    'contact.back': 'Back to Plans',
    'contact.success': 'Thanks for your interest! We\'ll reach out to you soon.',
    'contact.error.name': 'Please enter your name',
    'contact.error.email': 'Please enter a valid email',

    // ... (rest of existing English translations)
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.forBusinesses': 'Para Negocios',
    'nav.forShoppers': 'Para Compradores',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.prices': 'Precios',

    // Pricing Section
    'pricing.title': 'Elige tu Plan',
    'pricing.subtitle': 'Comienza a hacer crecer tu negocio con nuestros planes flexibles',
    'pricing.basic.title': 'Plan Básico',
    'pricing.basic.price': '$29',
    'pricing.basic.period': '/mes',
    'pricing.basic.description': 'Perfecto para pequeños negocios comenzando su viaje',
    'pricing.basic.features': [
      'Lista hasta 50 productos',
      'Análisis básico',
      'Soporte estándar',
      'Acceso a app móvil'
    ],
    'pricing.premium.title': 'Plan Premium',
    'pricing.premium.price': '$79',
    'pricing.premium.period': '/mes',
    'pricing.premium.description': 'Para negocios en crecimiento listos para escalar',
    'pricing.premium.features': [
      'Productos ilimitados',
      'Análisis avanzado',
      'Soporte prioritario',
      'Herramientas de marketing',
      'Marca personalizada'
    ],
    'pricing.contactUs': 'Para más detalles, nos encantaría ponernos en contacto contigo',
    'pricing.getStarted': 'Comenzar',

    // Contact Form
    'contact.title': '¡Estás Muy Cerca!',
    'contact.subtitle': 'Estás muy cerca de impactar a la comunidad con tus maravillosos productos',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.namePlaceholder': 'Ingresa tu nombre',
    'contact.emailPlaceholder': 'Ingresa tu correo',
    'contact.submit': 'Enviar',
    'contact.back': 'Volver a Planes',
    'contact.success': '¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.',
    'contact.error.name': 'Por favor ingresa tu nombre',
    'contact.error.email': 'Por favor ingresa un correo válido',

    // ... (rest of existing Spanish translations)
  }
};