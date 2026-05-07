import type { FoodItem } from '../types';

export async function fetchFoodByBarcode(barcode: string): Promise<Partial<FoodItem> | null> {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
            const product = data.product;
            const nutriments = product.nutriments;
            
            return {
                name: product.product_name || 'Bilinmeyen Ürün',
                kcal: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
                protein: nutriments.proteins_100g || nutriments.proteins || 0,
                carb: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
                fat: nutriments.fat_100g || nutriments.fat || 0,
                unit: 'gram',
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching barcode data:', error);
        return null;
    }
}
