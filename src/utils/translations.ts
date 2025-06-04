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
    // All existing translations...
    
    // Order Management
    'orders.title': 'Orders',
    'orders.search': 'Search orders...',
    'orders.noOrders': 'No orders yet',
    'orders.noOrdersDesc': 'Orders will appear here once customers start purchasing.',
    'orders.noStoreError': 'You need to create a store first before you can start receiving orders.',
    'orders.storeError': 'Failed to load store information. Please try again.',
    'orders.loadError': 'Failed to load orders. Please try again.',
    'orders.detailsError': 'Failed to load order details',
    'orders.customer': 'Customer',
    'orders.delivery': 'Delivery',
    'orders.status.created': 'Created',
    'orders.status.inProgress': 'In Progress',
    'orders.status.delivered': 'Delivered',
    'orders.viewDetails': 'View Details',
    'orders.hideDetails': 'Hide Details',
    'orders.orderTimeline': 'Order Timeline',
    'orders.orderSummary': 'Order Summary',
    'orders.subtotal': 'Subtotal',
    'orders.tax': 'Tax',
    'orders.total': 'Total',
    'orders.orderItems': 'Order Items',
    'orders.quantity': 'Quantity',
    'orders.each': 'each'
  },
  es: {
    // All existing translations...
    
    // Order Management
    'orders.title': 'Pedidos',
    'orders.search': 'Buscar pedidos...',
    'orders.noOrders': 'Aún no hay pedidos',
    'orders.noOrdersDesc': 'Los pedidos aparecerán aquí cuando los clientes comiencen a comprar.',
    'orders.noStoreError': 'Necesitas crear una tienda primero antes de poder recibir pedidos.',
    'orders.storeError': 'Error al cargar la información de la tienda. Por favor, intenta de nuevo.',
    'orders.loadError': 'Error al cargar los pedidos. Por favor, intenta de nuevo.',
    'orders.detailsError': 'Error al cargar los detalles del pedido',
    'orders.customer': 'Cliente',
    'orders.delivery': 'Entrega',
    'orders.status.created': 'Creado',
    'orders.status.inProgress': 'En Proceso',
    'orders.status.delivered': 'Entregado',
    'orders.viewDetails': 'Ver Detalles',
    'orders.hideDetails': 'Ocultar Detalles',
    'orders.orderTimeline': 'Línea de Tiempo del Pedido',
    'orders.orderSummary': 'Resumen del Pedido',
    'orders.subtotal': 'Subtotal',
    'orders.tax': 'Impuesto',
    'orders.total': 'Total',
    'orders.orderItems': 'Artículos del Pedido',
    'orders.quantity': 'Cantidad',
    'orders.each': 'cada uno'
  }
};