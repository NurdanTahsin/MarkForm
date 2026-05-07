import type { FoodItem } from '../types';

export function parseFoodInput(input: string, library: FoodItem[]): {
    food: FoodItem | null;
    amount: number;
    error?: string;
} {
    // Basic regex-based NLP mock
    // Expected format: "100 gram tavuk" or "1 porsiyon pilav" or "2 elma"
    const lowerInput = input.trim().toLowerCase();
    if (!lowerInput) {
        return { food: null, amount: 0, error: 'Lütfen ne yediğinizi yazın.' };
    }

    // Try to find an amount (number)
    const amountMatch = lowerInput.match(/(\d+([.,]\d+)?)/);
    let amount = 1;
    if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(',', '.'));
    }

    // Try to match a food item from the library
    let foundFood: FoodItem | null = null;
    
    // Sort library by name length descending so we match longer specific names first
    const sortedLibrary = [...library].sort((a, b) => b.name.length - a.name.length);

    for (const item of sortedLibrary) {
        if (lowerInput.includes(item.name.toLowerCase())) {
            foundFood = item;
            break;
        }
    }

    if (!foundFood) {
        return { food: null, amount: 0, error: 'Yazdığınız besin veritabanında bulunamadı.' };
    }

    // Determine if user specified "gram" for a portion-based item, etc.
    // Very simple mock: just return the found food and amount.
    return { food: foundFood, amount };
}
