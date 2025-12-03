/**
 * Seed script for legal agreements collection
 *
 * This script creates initial legal agreement documents in Firestore.
 *
 * SETUP:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key" and download the JSON file
 * 3. Save it as:
 *    - scripts/serviceAccountKey.dev.json (for development)
 *    - scripts/serviceAccountKey.prod.json (for production)
 *
 * RUN:
 * npx ts-node scripts/seedLegalAgreements.ts dev   # Seeds development
 * npx ts-node scripts/seedLegalAgreements.ts prod  # Seeds production
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment from command line argument
const env = process.argv[2];

if (!env || !['dev', 'prod'].includes(env)) {
    console.error('❌ Please specify environment: dev or prod');
    console.error('');
    console.error('Usage:');
    console.error('  npx ts-node scripts/seedLegalAgreements.ts dev   # Seeds development');
    console.error('  npx ts-node scripts/seedLegalAgreements.ts prod  # Seeds production');
    process.exit(1);
}

// Check for service account key
const serviceAccountPath = path.join(__dirname, `serviceAccountKey.${env}.json`);

if (!fs.existsSync(serviceAccountPath)) {
    console.error(`❌ Service account key not found for ${env.toUpperCase()} environment!`);
    console.error('');
    console.error('To fix this:');
    console.error(`1. Go to your ${env.toUpperCase()} Firebase Console > Project Settings > Service Accounts`);
    console.error('2. Click "Generate new private key"');
    console.error(`3. Save the downloaded file as: scripts/serviceAccountKey.${env}.json`);
    console.error('');
    console.error('⚠️  Make sure serviceAccountKey.*.json files are in .gitignore!');
    process.exit(1);
}

// Initialize Firebase Admin
const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountContent);

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

// Agreement content from Documents.md (latest versions)
const agreements = [
    {
        agreementType: 'payoutPolicy',
        version: '1.0.0',
        isLatest: true,
        lastUpdated: 'December 2025',
        title: {
            en: 'Payout Policy',
            es: 'Política de Pagos',
        },
        subtitle: {
            en: 'How and when we pay our sellers',
            es: 'Cómo y cuándo pagamos a nuestros vendedores',
        },
        content: {
            en: `1. Description

Lulocart operates as a multi-vendor marketplace. Customers pay directly to Lulocart, and payouts to stores ("Sellers") are processed via Stripe Connect Express.

⸻

2. Platform Fees

2.1 Founders Plan (Stores registered before Dec 31, 2025)

Transaction Fee
• Months 1–3: 6% of the base price
• Month 4 onward: 9%

Monthly Subscription
• Month 1: $0 CAD
• Month 2: $9 CAD
• Month 3: $9 CAD
• Month 4 onward: $30 CAD/month

2.2 Stores joining on or after January 1, 2026
• 9% transaction fee
• $30 CAD/month subscription

⸻

3. Store Earnings

After deducting fees:

Stores receive:
• 94% of the base price during the 6% period
• 91% after the 9% period
• 100% of PST/GST taxes

⸻

4. Driver Evidence

Drivers must upload:
• Pickup photo
• Delivery photo
• Pickup time
• Delivery time

⸻

5. Delivery Window & Cold Chain

Stores accept that:
• Lulocart may take up to 8 hours to complete delivery
• Time depends on routes, weather, demand, and availability

For cold, refrigerated, or frozen products:
• Lulocart is fully responsible for maintaining the cold chain
• Drivers will use:
  • Coolers
  • Thermal bags
  • Refrigerant packs

If the cold chain breaks after pickup, Lulocart assumes responsibility and the store will not be charged.

⸻

6. Responsibility for Issues

6.1 If the store is responsible

Examples:
• Missing products
• Incorrect products
• Expired or damaged products before pickup

Lulocart may deduct:
• Refunds
• Disputes

6.2 If Lulocart/driver is responsible

Examples:
• Delays
• Damage after pickup
• Lost products
• Cold chain break

The store will not be charged.

⸻

7. Payouts

• Standard delay: 3 business days
• New stores: up to 5 business days
• Possible pauses during disputes

⸻

8. Compliance

Stores must comply with:
• Seller Agreement
• Stripe Terms`,
            es: `1. Descripción

Lulocart funciona como un marketplace de múltiples tiendas. Los clientes pagan directamente a Lulocart, y los pagos a las tiendas ("Vendedores") se realizan mediante Stripe Connect Express.

⸻

2. Tarifas de la Plataforma

2.1 Plan Fundadores (tiendas registradas antes del 31 de diciembre 2025)

Tarifa por transacción
• Meses 1–3: 6% del precio base
• Desde el mes 4: 9%

Suscripción mensual
• Mes 1: $0 CAD
• Mes 2: $9 CAD
• Mes 3: $9 CAD
• Desde el mes 4: $30 CAD/mes

2.2 Tiendas que ingresan desde el 1 de enero 2026
• 9% por transacción
• $30 CAD/mes de suscripción

⸻

3. Ganancias de la Tienda

Después de descontar las tarifas:

Las tiendas reciben:
• 94% del precio base durante el periodo al 6%
• 91% después del periodo al 9%
• 100% de impuestos PST/GST

⸻

4. Evidencia del Conductor

Los conductores deben subir:
• Foto de recogida
• Foto de entrega
• Hora de recogida
• Hora de entrega

⸻

5. Ventana de Entrega y Ciclo de Frío

Las tiendas aceptan que:
• Lulocart puede tardar hasta 8 horas en completar la entrega
• El tiempo depende de rutas, clima, demanda y disponibilidad

Para productos fríos, refrigerados o congelados:
• Lulocart es totalmente responsable de mantener el ciclo de frío
• Conductores usarán:
  • Coolers
  • Bolsas térmicas
  • Packs refrigerantes

Si el ciclo de frío se rompe después de la recogida, Lulocart asume la responsabilidad y la tienda no será cobrada.

⸻

6. Responsabilidad por Problemas

6.1 Si la tienda es responsable

Ejemplos:
• Productos faltantes
• Productos incorrectos
• Productos vencidos o dañados antes de la recogida

Lulocart podrá descontar:
• Reembolsos
• Disputas

6.2 Si Lulocart/el conductor es responsable

Ejemplos:
• Retrasos
• Daño después de la recogida
• Pérdida de productos
• Ruptura del ciclo de frío

La tienda no será cobrada.

⸻

7. Pagos

• Retraso estándar: 3 días hábiles
• Tiendas nuevas: hasta 5 días hábiles
• Pausas posibles durante disputas

⸻

8. Cumplimiento

Las tiendas deben cumplir con:
• Acuerdo de Tiendas
• Términos de Stripe`,
        },
    },
    {
        agreementType: 'sellerAgreement',
        version: '1.0.0',
        isLatest: true,
        lastUpdated: 'December 2025',
        title: {
            en: 'Seller Partner Agreement',
            es: 'Acuerdo de Tiendas',
        },
        subtitle: {
            en: 'Terms and conditions for store partners',
            es: 'Términos y condiciones para tiendas asociadas',
        },
        content: {
            en: `This Agreement applies to all stores ("Sellers") using Lulocart. By creating a store account or accepting orders, the Seller agrees to all terms.

⸻

1. About Lulocart

• Lulocart is a marketplace and payment facilitator, not the seller of record.
• Customers purchase products from Sellers using Lulocart.
• Payments are processed through Stripe Connect Express.
• Lulocart is responsible for drivers and delivery.
• The store is not responsible for issues that occur after pickup.

⸻

2. Fees and Subscriptions

2.1 Founders Plan (before December 31, 2025)

Transaction Fee
• Months 1–3 → 6%
• Month 4 onward → 9%

Monthly Subscription
• Month 1 → $0 CAD
• Month 2 → $9 CAD
• Month 3 → $9 CAD
• Month 4 onward → $30 CAD/month

2.2 Stores joining on or after January 1, 2026
• 9% transaction fee
• $30 CAD/month from day one

⸻

3. Seller Responsibilities

3.1 Quality & Accuracy

The store must:
• Deliver the correct products
• Deliver correct quantities
• Ensure products are within expiration dates
• Not omit items
• Package correctly

If proven that the issue existed before pickup, Lulocart may charge the store for the user's refund.

3.2 Preparation

The store must:
• Have the order ready for pickup
• Allow pickup photo
• Deliver properly packaged products

3.3 Prohibited Items

The store may not sell:
• Alcohol
• Tobacco/cannabis
• Medication
• Weapons
• Expired or illegal products

⸻

4. Driver Evidence

The driver will upload:
• Pickup photo
• Delivery photo
• Lulocart will track pickup time
• Lulocart will track delivery time

⸻

5. Delivery Window & Cold Chain

The store accepts:
• Up to 8 hours to complete delivery

For cold, refrigerated, or frozen products:
• Lulocart is responsible for the cold chain after pickup
• Will use:
  • Coolers
  • Thermal bags
  • Gel packs

If temperature is compromised after pickup, the store will not be charged.

⸻

6. Refunds, Disputes & Chargebacks

6.1 If the store is responsible
• Missing items
• Incorrect products
• Expired products
• Damage prior to pickup

Lulocart may deduct:
• Refunds
• Disputes

6.2 If Lulocart/driver is responsible
• Delays
• Damage after pickup
• Product loss
• Cold chain break

The store will not be charged.

⸻

7. Payouts

• Standard payouts: 3 business days
• New stores: up to 5 business days

⸻

8. Suspension

Lulocart may suspend stores for:
• Fraud
• High complaint rate
• Violation of rules
• Prohibited products

⸻

9. Acceptance

By using Lulocart, the store accepts all terms.`,
            es: `Este Acuerdo aplica a todas las tiendas ("Vendedores") que utilizan Lulocart. Al crear una cuenta de tienda o aceptar pedidos, el Vendedor acepta todos los términos.

⸻

1. Sobre Lulocart

• Lulocart es un marketplace y facilitador de pagos, no el vendedor final.
• Los clientes compran productos a las tiendas mediante Lulocart.
• Los pagos se realizan a través de Stripe Connect Express.
• Lulocart es responsable de los conductores y de la entrega.
• La tienda no es responsable por problemas que ocurran después de la recogida.

⸻

2. Tarifas y Suscripciones

2.1 Plan Fundadores (antes del 31 de diciembre 2025)

Tarifa por transacción
• Meses 1–3 → 6%
• Desde el mes 4 → 9%

Suscripción mensual
• Mes 1 → $0 CAD
• Mes 2 → $9 CAD
• Mes 3 → $9 CAD
• Desde el mes 4 → $30 CAD/mes

2.2 Tiendas que ingresan desde el 1 de enero 2026
• 9% por transacción
• $30 CAD/mes desde el primer día

⸻

3. Responsabilidades del Vendedor

3.1 Calidad y Exactitud

La tienda debe:
• Entregar los productos correctos
• Entregar cantidades correctas
• Garantizar que los productos estén dentro de fecha
• No omitir artículos
• Empacar correctamente

Si se demuestra que el problema existía antes de la recogida, Lulocart puede cobrar a la tienda el reembolso del usuario.

3.2 Preparación

La tienda debe:
• Tener el pedido listo para la recogida
• Permitir foto de recogida
• Entregar productos empacados correctamente

3.3 Productos Prohibidos

La tienda no puede vender:
• Alcohol
• Tabaco/cannabis
• Medicamentos
• Armas
• Productos vencidos o ilegales

⸻

4. Evidencia del Conductor

El conductor subirá:
• Foto de recogida
• Foto de entrega
• LuloCart rastreará tiempo de recogida
• LuloCart rastreará tiempo de entrega

⸻

5. Ventana de Entrega y Ciclo de Frío

La tienda acepta:
• Hasta 8 horas para completar la entrega

Para productos fríos, refrigerados o congelados:
• Lulocart es responsable del ciclo de frío después de la recogida
• Se usarán:
  • Coolers
  • Bolsas térmicas
  • Packs de gel

Si la temperatura se compromete después de la recogida, la tienda no será cobrada.

⸻

6. Reembolsos, Disputas y Chargebacks

6.1 Si la tienda es responsable
• Faltantes
• Productos incorrectos
• Productos vencidos
• Daño previo a la recogida

Lulocart podrá descontar:
• Reembolsos
• Disputas

6.2 Si Lulocart/el conductor es responsable
• Retrasos
• Daños después de la recogida
• Pérdida del producto
• Ruptura del ciclo de frío

La tienda no será cobrada.

⸻

7. Pagos

• Pagos estándar: 3 días hábiles
• Tiendas nuevas: hasta 5 días hábiles

⸻

8. Suspensión

Lulocart puede suspender tiendas por:
• Fraude
• Alta tasa de quejas
• Violación de normas
• Productos prohibidos

⸻

9. Aceptación

Al usar Lulocart, la tienda acepta todos los términos.`,
        },
    },
    {
        agreementType: 'refundPolicy',
        version: '1.0.0',
        isLatest: true,
        lastUpdated: 'December 2025',
        title: {
            en: 'Refund & Cancellation Policy',
            es: 'Política de Reembolsos y Cancelaciones',
        },
        subtitle: {
            en: 'How refunds and cancellations are handled',
            es: 'Cómo se manejan los reembolsos y cancelaciones',
        },
        content: {
            en: `1. Refund Reasons

Customers may request refunds for:
• Missing products
• Incorrect products
• Expired products
• Damage before delivery
• Non-delivery

They must provide:
• Order number
• Photos
• Description

⸻

2. Time Limits

An order can be considered as not delivered to the user when 30 minutes have passed since the delivery window.

⸻

3. Refund Process

Each order generated in LuloCart gives the user the option to request a refund, specifying one of the reasons in section 1.

⸻

4. Cancellation Process

Each order generated in LuloCart gives the user the option to cancel the order up to 24 hours before the scheduled delivery. If the order is created with less than 24 hours notice, the cancellation option is not offered but the user will be informed that there are no cancellations before making the purchase.

⸻

5. Responsibility

5.1 If the store is responsible

If photos show the issue before pickup:
• Refund to customer
• Deduction from store

5.2 If Lulocart/driver is responsible

If the issue occurs after:
• Lulocart covers the cost
• Store will not be charged

⸻

6. Delivery Time & Cold Chain

• Delivery may take up to 8 hours from the moment of store pickup
• Lulocart guarantees the cold chain after pickup`,
            es: `1. Motivos de Reembolso

El cliente puede solicitar reembolso por:
• Productos faltantes
• Productos incorrectos
• Productos vencidos
• Daños antes de la entrega
• No entrega

Debe proporcionar:
• Número de orden
• Fotos
• Descripción

⸻

2. Límites de Tiempo

Una orden puede considerarse como no entregada al usuario cuando ha pasado 30 minutos desde la ventana de entrega.

⸻

3. Proceso de Reembolso

Cada orden generada en LuloCart da la opción al usuario de solicitar un reembolso, especificando uno de los motivos en la sección 1.

⸻

4. Proceso de Cancelaciones

Cada orden generada en LuloCart da la opción al usuario de cancelar la orden hasta 24 horas antes de la entrega programada. Si la orden se crea con menos de 24 horas, no se ofrece la opción de cancelación pero al usuario se le informará que no hay cancelaciones antes de que realice la compra.

⸻

5. Responsabilidad

5.1 Si la tienda es responsable

Si las fotos muestran el problema antes de recogida:
• Reembolso al cliente
• Descuento a la tienda

5.2 Si Lulocart/el conductor es responsable

Si el problema ocurre después:
• Lulocart cubre el costo
• La tienda no será cobrada

⸻

6. Tiempo de Entrega y Ciclo de Frío

• La entrega puede tardar hasta 8 horas desde el momento de recogida en tienda
• Lulocart garantiza el ciclo de frío después de la recogida`,
        },
    },
];

async function seedLegalAgreements() {
    console.log(`Seeding legal agreements to Firestore (${env.toUpperCase()} environment)...`);
    console.log(`Project: ${serviceAccount.project_id}`);
    console.log('');

    try {
        const agreementsRef = db.collection('legal_agreements');

        for (const agreement of agreements) {
            const docData = {
                ...agreement,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            const docRef = await agreementsRef.add(docData);
            console.log(`✅ Added ${agreement.agreementType} v${agreement.version} with ID: ${docRef.id}`);
        }

        console.log('');
        console.log('🎉 All legal agreements seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding legal agreements:', error);
        process.exit(1);
    }
}

// Run the seed function
seedLegalAgreements();
