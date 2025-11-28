/**
 * Common allergens for product labeling
 * Based on major food allergens required by food labeling regulations
 */
export const COMMON_ALLERGENS = [
    {id: 'wheat', translationKey: 'products.allergen.wheat'},
    {id: 'gluten', translationKey: 'products.allergen.gluten'},
    {id: 'dairy', translationKey: 'products.allergen.dairy'},
    {id: 'eggs', translationKey: 'products.allergen.eggs'},
    {id: 'nuts', translationKey: 'products.allergen.nuts'},
    {id: 'peanuts', translationKey: 'products.allergen.peanuts'},
    {id: 'soy', translationKey: 'products.allergen.soy'},
    {id: 'fish', translationKey: 'products.allergen.fish'},
    {id: 'shellfish', translationKey: 'products.allergen.shellfish'},
] as const;

export type AllergenId = typeof COMMON_ALLERGENS[number]['id'];
