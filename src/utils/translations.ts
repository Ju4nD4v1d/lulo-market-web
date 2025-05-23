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
    
    // Hero Section
    'hero.tagline': 'Inspired by Latin America',
    'hero.title': 'Connect with Latin American Culture',
    'hero.subtitle': 'The digital marketplace where Latin-owned businesses and Latin American consumers meet',
    'hero.businessCta': 'Grow Your Business',
    'hero.shopperCta': 'Start Shopping',
    'hero.marketplaceText': `Whether you're buying or selling, ${COMPANY_NAME} is your Latin marketplace`,
    
    // Business Owners Section
    'business.badge': 'For Business Owners',
    'business.title': 'Grow Your Latin Business',
    'business.subtitle': 'Join thousands of Latin American entrepreneurs reaching new customers across Canada',
    'business.benefits.setup': 'Quick and easy store setup with no technical skills required',
    'business.benefits.discover': 'Get discovered by thousands of customers looking for authentic Latin products near them',
    'business.benefits.delivery': 'Offer pickup, local delivery, or in-store shopping — your choice',
    'business.cta': 'Start Selling Today',
    
    // Shoppers Section
    'shoppers.title': 'For Shoppers',
    'shoppers.subtitle': 'Your favorite Latin products, one tap away',
    'shoppers.description': 'Find authentic Latin American products from trusted sellers near you',
    'shoppers.feature1.title': 'Authentic Products',
    'shoppers.feature1.desc': 'Bring home closer with every order',
    'shoppers.feature2.title': 'Home Delivery',
    'shoppers.feature2.desc': 'Get your favorite products delivered directly to your door',
    'shoppers.feature3.title': 'Support Latin Businesses',
    'shoppers.feature3.desc': 'Every purchase supports Latin American entrepreneurs',
    'shoppers.appStore': 'Download on App Store',
    'shoppers.googlePlay': 'Get it on Google Play',
    
    // Testimonials Section
    'testimonials.title': 'Our Community',
    'testimonial1.quote': `${COMPANY_NAME} has transformed my business. I've reached customers I never could before and my sales have increased by 40%.`,
    'testimonial1.author': 'Maria Rodriguez, Owner of Sabor Latino',
    'testimonial2.quote': `Finding authentic products from my home country used to be so difficult. With ${COMPANY_NAME}, I can order everything I miss with just a few taps.`,
    'testimonial2.author': 'Carlos Mendez, Customer',
    'testimonial3.quote': 'The platform is incredibly easy to use. Setting up my store took less than an hour, and I started getting orders the same day!',
    'testimonial3.author': 'Isabella Torres, Owner of Casa Bella',
    
    // About Section
    'about.title': `About ${COMPANY_NAME}`,
    'about.mission': 'Our Mission',
    'about.missionText': `At ${COMPANY_NAME}, we're building bridges between Latin American businesses and consumers in North America. Our platform empowers entrepreneurs while helping shoppers connect with their cultural roots.`,
    'about.community': 'Community First',
    'about.communityText': 'We believe in the power of community. By supporting Latin American businesses, we\'re fostering economic growth and cultural preservation across borders.',
    
    // Footer
    'footer.tagline': 'Connecting Latin-owned businesses with Latin American consumers in Canada and the US',
    'footer.business': 'For Businesses',
    'footer.shopper': 'For Shoppers',
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.copyright': `© 2025 ${COMPANY_NAME}. All rights reserved.`,
    'footer.createAccount': 'Create Account',
    'footer.sellerDashboard': 'Seller Dashboard',
    'footer.sellerResources': 'Seller Resources',
    'footer.successStories': 'Success Stories',
    'footer.downloadApp': 'Download App',
    'footer.browseStores': 'Browse Stores',
    'footer.deliveryAreas': 'Delivery Areas',
    'footer.faqs': 'FAQs',
    'footer.ourStory': 'Our Story',
    'footer.careers': 'Careers',

    // Language Toggle
    'language.toggle': 'Español',

    // Auth Pages
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.welcomeBack': 'Welcome Back',
    'auth.createAccount': 'Create Account',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.loginButton': 'Sign In',
    'auth.registerButton': 'Create Account',
    'auth.resetPassword': 'Reset Password',
    'auth.resetInstructions': 'Enter your email and we\'ll send you instructions to reset your password.',
    'auth.resetButton': 'Send Reset Instructions',
    'auth.backToLogin': 'Back to Login',
    'auth.rememberPassword': 'Remember your password?',
    'auth.signIn': 'Sign in',
    'auth.welcomeMessage': 'Start your journey with',
    'auth.subtitle': 'Bringing Latin flavors closer to your door',
    'auth.trustMessage': 'Your data is safe with us — we never share your information',
    'auth.backToHome': 'Back to Home',
    'auth.forgotTitle': 'Forgot your password?',
    'auth.forgotSubtitle': 'Enter your email address and we\'ll send you instructions to reset your password.',
    'auth.forgotSuccess': 'If an account exists with this email, you will receive password reset instructions.',
    'auth.welcomeHero': 'Welcome to',
    'auth.welcomeSubtitle': 'Your gateway to authentic Latin American flavors and products'
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.forBusinesses': 'Para Negocios',
    'nav.forShoppers': 'Para Compradores',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    
    // Hero Section
    'hero.tagline': 'Inspirado por Latinoamérica',
    'hero.title': 'Conéctate con la Cultura Latinoamericana',
    'hero.subtitle': 'El mercado digital donde se encuentran los negocios latinos y consumidores latinoamericanos',
    'hero.businessCta': 'Haz Crecer tu Negocio',
    'hero.shopperCta': 'Empieza a Comprar',
    'hero.marketplaceText': `Ya sea que compres o vendas, ${COMPANY_NAME} es tu mercado Latino`,
    
    // Business Owners Section
    'business.badge': 'Para Dueños de Negocios',
    'business.title': 'Haz Crecer tu Negocio Latino',
    'business.subtitle': 'Únete a miles de emprendedores latinoamericanos alcanzando nuevos clientes en Canadá',
    'business.benefits.setup': 'Configuración rápida y fácil sin conocimientos técnicos',
    'business.benefits.discover': 'Sé descubierto por miles de clientes buscando productos latinos auténticos cerca de ti',
    'business.benefits.delivery': 'Ofrece recogida, entrega local o compra en tienda — tú eliges',
    'business.cta': 'Empieza a Vender Hoy',
    
    // Shoppers Section
    'shoppers.title': 'Para Compradores',
    'shoppers.subtitle': 'Tus productos latinos favoritos, a un toque de distancia',
    'shoppers.description': 'Encuentra productos latinoamericanos auténticos de vendedores confiables cerca de ti',
    'shoppers.feature1.title': 'Productos Auténticos',
    'shoppers.feature1.desc': 'Acerca tu hogar con cada pedido',
    'shoppers.feature2.title': 'Entrega a Domicilio',
    'shoppers.feature2.desc': 'Recibe tus productos favoritos directamente en tu puerta',
    'shoppers.feature3.title': 'Apoya Negocios Latinos',
    'shoppers.feature3.desc': 'Cada compra apoya a emprendedores latinoamericanos',
    'shoppers.appStore': 'Descarga en App Store',
    'shoppers.googlePlay': 'Consíguelo en Google Play',
    
    // Testimonials Section
    'testimonials.title': 'Nuestra Comunidad',
    'testimonial1.quote': `${COMPANY_NAME} ha transformado mi negocio. He llegado a clientes que nunca antes pude alcanzar y mis ventas han aumentado un 40%.`,
    'testimonial1.author': 'María Rodríguez, Propietaria de Sabor Latino',
    'testimonial2.quote': `Encontrar productos auténticos de mi país solía ser muy difícil. Con ${COMPANY_NAME}, puedo pedir todo lo que extraño con solo unos toques.`,
    'testimonial2.author': 'Carlos Méndez, Cliente',
    'testimonial3.quote': '¡La plataforma es increíblemente fácil de usar. Configurar mi tienda tomó menos de una hora y comencé a recibir pedidos el mismo día!',
    'testimonial3.author': 'Isabella Torres, Propietaria de Casa Bella',
    
    // About Section
    'about.title': `Sobre ${COMPANY_NAME}`,
    'about.mission': 'Nuestra Misión',
    'about.missionText': `En ${COMPANY_NAME}, estamos construyendo puentes entre negocios latinoamericanos y consumidores en Norteamérica. Nuestra plataforma empodera a emprendedores mientras ayuda a los compradores a conectar con sus raíces culturales.`,
    'about.community': 'La Comunidad Primero',
    'about.communityText': 'Creemos en el poder de la comunidad. Al apoyar a los negocios latinoamericanos, estamos fomentando el crecimiento económico y la preservación cultural a través de las fronteras.',
    
    // Footer
    'footer.tagline': 'Conectando negocios latinos con consumidores latinoamericanos en Canadá y EE. UU.',
    'footer.business': 'Para Negocios',
    'footer.shopper': 'Para Compradores',
    'footer.about': 'Sobre Nosotros',
    'footer.contact': 'Contacto',
    'footer.terms': 'Términos y Condiciones',
    'footer.privacy': 'Política de Privacidad',
    'footer.copyright': `© 2025 ${COMPANY_NAME}. Todos los derechos reservados.`,
    'footer.createAccount': 'Crear Cuenta',
    'footer.sellerDashboard': 'Panel de Vendedor',
    'footer.sellerResources': 'Recursos para Vendedores',
    'footer.successStories': 'Historias de Éxito',
    'footer.downloadApp': 'Descargar App',
    'footer.browseStores': 'Explorar Tiendas',
    'footer.deliveryAreas': 'Áreas de Entrega',
    'footer.faqs': 'Preguntas Frecuentes',
    'footer.ourStory': 'Nuestra Historia',
    'footer.careers': 'Carreras',

    // Language Toggle
    'language.toggle': 'English',

    // Auth Pages
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.welcomeBack': 'Bienvenido de Nuevo',
    'auth.createAccount': 'Crear Cuenta',
    'auth.email': 'Correo electrónico',
    'auth.emailPlaceholder': 'Ingresa tu correo electrónico',
    'auth.password': 'Contraseña',
    'auth.passwordPlaceholder': 'Ingresa tu contraseña',
    'auth.rememberMe': 'Recordarme',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.loginButton': 'Iniciar Sesión',
    'auth.registerButton': 'Crear Cuenta',
    'auth.resetPassword': 'Restablecer Contraseña',
    'auth.resetInstructions': 'Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.',
    'auth.resetButton': 'Enviar Instrucciones',
    'auth.backToLogin': 'Volver a Iniciar Sesión',
    'auth.rememberPassword': '¿Recuerdas tu contraseña?',
    'auth.signIn': 'Iniciar Sesión',
    'auth.welcomeMessage': 'Comienza tu viaje con',
    'auth.subtitle': 'Acercando los sabores latinos a tu puerta',
    'auth.trustMessage': 'Tus datos están seguros con nosotros — nunca compartimos tu información',
    'auth.backToHome': 'Volver al Inicio',
    'auth.forgotTitle': '¿Olvidaste tu contraseña?',
    'auth.forgotSubtitle': 'Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.',
    'auth.forgotSuccess': 'Si existe una cuenta con este correo electrónico, recibirás instrucciones para restablecer tu contraseña.',
    'auth.welcomeHero': 'Bienvenido a',
    'auth.welcomeSubtitle': 'Tu puerta de entrada a auténticos sabores y productos latinoamericanos'
  }
};